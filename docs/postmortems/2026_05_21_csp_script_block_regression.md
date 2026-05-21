# Postmortem: CSP script-src blocked all client JS (2026-05-21)

**Codename:** AUTH-CSP-SCRIPT-BLOCK  
**Severity:** P0 -- site-wide client JavaScript blocked on all modern browsers  
**Detection:** /auth/confirm spun forever on a non-app device; verifyOtp never ran  
**Regression commit:** `bbf6694` "security: production hardening -- Next.js 15, ..."  
**Fix commit:** see final section  

---

## Cause

Commit `bbf6694` moved the Content-Security-Policy from a static `vercel.json`
header to per-request generation in `src/middleware.ts`. In doing so it changed
`script-src` from the working:

```
script-src 'self' 'unsafe-inline'
```

to:

```
script-src 'self' 'nonce-{base64}' 'strict-dynamic' 'unsafe-inline'
```

The intent was correct: a per-request header value embedded into `<script>` tags
would allow trusted scripts while blocking injected third-party ones.

The implementation was **half-complete**. The middleware:
- Generated a fresh header value per request (correct)
- Set the value on the HTTP response `Content-Security-Policy` header (correct)
- Forwarded the value to server components via the `x-nonce` request header (present)

But **nothing ever read the forwarded value**. No layout, no page, and no
`next/script` component stamped it onto any `<script>` tag in the rendered HTML.

### Why that is fatal with the chosen directive combination

`strict-dynamic`, when present in `script-src`, instructs all modern browsers
(Chrome, Firefox, Safari 2019+) to **silently ignore `'unsafe-inline'`** and
**ignore allowlist hosts such as `'self'`**. Only scripts carrying a matching
`nonce="..."` attribute are trusted; scripts dynamically loaded by those trusted
scripts are also trusted (propagation).

Since no `<script>` tag in the HTML ever carried the stamped value, zero scripts
were trusted. Every Next.js hydration script, every chunk loader, and every React
bootstrap was blocked. The `'unsafe-inline'` fallback, which the comment
described as working on "older browsers", was ignored on every modern browser.

### Why /auth/confirm was the most visible symptom

`/auth/confirm` and `/auth/reset` are **statically pre-rendered** (`○` in the
build output). Their HTML is generated once at build time. Even if a layout had
read the per-request value, it could not have been embedded at serve time into
static HTML -- a fundamental incompatibility.

Beyond the static-page issue, these pages are **pure client-side**: the Suspense
fallback (the loading spinner) is rendered server-side, and all meaningful work
(`verifyOtp`, state transitions) happens in a `useEffect` inside a client
component. Without JavaScript, the spinner renders and stays forever. Other pages
with useful SSR content appeared to work visually even without JavaScript.

---

## Impact

| Scope | Effect |
|---|---|
| All modern browsers (Chrome, Firefox, Safari 2019+) | All client JavaScript blocked |
| `/auth/confirm` | Infinite spinner -- verifyOtp never ran |
| `/auth/reset` | Infinite spinner -- verifyOtp never ran |
| Sign-in, sign-up, dashboard forms | Silently broken interactivity |
| Homepage, legal, marketing pages | Appeared OK (SSR content rendered without JS) |
| Older browsers / IE | Not broken (ignored the directive, used 'unsafe-inline') |

---

## Fix A -- Applied (commit see below)

`src/middleware.ts`, `buildCSP()`:

```diff
- `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
+ `script-src 'self' 'unsafe-inline'`,
```

Also removed:
- `nonce: string` parameter from `buildCSP()`
- `const nonce = Buffer.from(crypto.randomUUID()).toString('base64')` generation line
- `requestHeaders.set('x-nonce', nonce)` forwarding line (was never consumed)

All other CSP directives (`default-src`, `style-src`, `connect-src`, `img-src`,
`font-src`, `frame-ancestors`, `base-uri`, `form-action`) left verbatim.

This restores `script-src` to parity with the pre-`bbf6694` `vercel.json` value.
The remaining CSP directives continue to provide meaningful protection.

---

## Residual risk from Fix A

`'unsafe-inline'` permits any inline `<script>` on a page that an XSS attacker
could inject. Mitigations in place:

- `connect-src` restricts outbound fetch to `'self'`, Supabase, and Vercel
  Analytics -- limits exfiltration even if an inline script ran.
- `form-action 'self'` prevents form hijacking to third-party destinations.
- `frame-ancestors 'none'` blocks clickjacking.
- No user-controlled HTML is rendered on any page.
- Supabase RLS policies protect all data regardless of client-side state.

---

## Fix B -- Deferred

A correct per-request stamped implementation requires:

1. **`export const dynamic = 'force-dynamic'`** on both `/auth/confirm` and
   `/auth/reset` pages -- static pre-rendering is incompatible with per-request
   values in HTML.
2. **Root `layout.tsx`** reads the per-request value from `headers()` (async
   server component) and passes it to all `next/script` components.
3. **Next.js internal scripts** (`__NEXT_DATA__`, chunk preloads) also need the
   value stamped -- requires either the `next.config.mjs` `experimental.nonce`
   feature or manual stamping via `<Script>` for every entry point.
4. **Full test pass** confirming hydration works end-to-end on all auth and
   dashboard pages.

Fix B is a multi-file architectural change. It is tracked but not urgent given
the mitigations in place from Fix A.

---

## Pass / Fail Device Tree (at time of regression)

| Device / Browser | Result |
|---|---|
| iOS Safari (any version 2019+) | FAIL -- JS blocked, spinner forever |
| iOS Chrome | FAIL -- JS blocked |
| Android Chrome | FAIL -- JS blocked |
| Desktop Chrome | FAIL -- JS blocked |
| Desktop Firefox | FAIL -- JS blocked |
| Desktop Safari | FAIL -- JS blocked |
| IE 11 / very old browsers | PASS -- ignored directive, unsafe-inline honoured |

---

## Timeline

| Time | Event |
|---|---|
| Session 1 (bbf6694) | Security hardening committed; regression introduced |
| Session 2 (ed92e50) | Auth pages deployed; spinning symptom reported |
| Session 3 (audit) | Root cause identified in AUTH-CONFIRM-CSP-SCRIPT-BLOCK-AUDIT-1 |
| Session 3 (this fix) | Fix A applied; all arch tests pass; deployed |
