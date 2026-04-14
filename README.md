# IncomePilot Website

Premium web presence for [incomepilot.app](https://incomepilot.app).

Built with **Next.js 14 (App Router)** · **TypeScript** · **Tailwind CSS** · **Supabase Auth**

---

## What this site does

| Route | Purpose |
|-------|---------|
| `/` | Landing page — branding, features, coming-soon badges |
| `/auth/confirm` | Supabase email-verification callback + app deep-link |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Use |
| `/support` | Help centre + contact cards + FAQ |

---

## Quick start

```bash
cd WEBSITE
npm install
cp .env.example .env.local   # fill in Supabase values
npm run dev                   # → http://localhost:3000
```

---

## Environment variables

Create `.env.local` (never commit it):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values come from your Supabase project:  
**Settings → API → Project URL / anon public key**

---

## Supabase configuration

### 1. Set the Site URL

In your Supabase dashboard:  
**Authentication → URL Configuration → Site URL**

```
https://incomepilot.app
```

### 2. Add the redirect URL pattern

Under **Redirect URLs**, add:

```
https://incomepilot.app/auth/**
```

This allows the email verification link to redirect back to `/auth/confirm`.

### 3. Auth email templates (optional but recommended)

Edit your "Confirm signup" email template so the `{{ .ConfirmationURL }}`
points to `https://incomepilot.app/auth/confirm` (Supabase does this
automatically once Site URL is set correctly).

---

## Auth flow explained

```
User signs up in app
  → Supabase sends email with link to:
     https://incomepilot.app/auth/confirm?token_hash=...&type=signup

/auth/confirm page:
  1. Reads token_hash + type from URL
  2. Calls supabase.auth.verifyOtp({ token_hash, type })
  3. On success → tries to open incomepilot:// deep link
  4. Regardless of whether app opens → shows success UI
  5. On error → shows clean error state with retry guidance
```

### Same-device flow (phone that has the app)
The deep-link fires and the OS hands control back to the app.
The user lands on the verified screen inside IncomePilot.

### Cross-device flow (verified on desktop, app on phone)
The deep-link attempt silently fails (OS has no handler).
The page stays on the success state with the message:
> "If IncomePilot does not open automatically, return to the app and sign in there."

---

## Deep link

The app is opened via the custom URI scheme:

```
incomepilot://auth/verified?verified=1
```

This is registered in the Flutter app via:
- **Android**: `AndroidManifest.xml` intent-filter for `incomepilot://`
- **iOS**: `Info.plist` CFBundleURLSchemes entry `incomepilot`

To update the scheme, change `APP_SCHEME` in `src/lib/supabase.ts`.

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel                  # follow prompts; set root to WEBSITE/
```

### Option B — GitHub integration

1. Push this `WEBSITE/` folder to your GitHub repository
2. In Vercel → New Project → import repo
3. Set **Root Directory** to `WEBSITE`
4. Add environment variables in the Vercel dashboard

### Custom domain

1. In Vercel → Domains → add `incomepilot.app`
2. Follow the DNS instructions (CNAME/A records)
3. SSL certificate is provisioned automatically

---

## Project structure

```
WEBSITE/
├── public/
│   └── favicon.svg           SVG favicon (no build step needed)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         Root layout + global metadata
│   │   ├── globals.css        Tailwind base + custom utilities
│   │   ├── page.tsx           Home page
│   │   ├── auth/
│   │   │   └── confirm/
│   │   │       ├── page.tsx               Server shell + Suspense boundary
│   │   │       └── AuthConfirmContent.tsx  Client component — Supabase logic
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── support/page.tsx
│   │
│   ├── components/
│   │   ├── Logo.tsx           Compass mark + wordmark
│   │   ├── Nav.tsx            Sticky top nav (mobile-responsive)
│   │   ├── Footer.tsx         Site footer
│   │   └── LegalLayout.tsx    Shared wrapper for Privacy/Terms
│   │
│   └── lib/
│       └── supabase.ts        Browser client factory + deep-link helpers
│
├── .env.example               Copy → .env.local, fill in secrets
├── .gitignore
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                Security headers + cache rules
└── package.json
```

---

## Design system

Colours and tokens are defined in `tailwind.config.ts` under the `ip` namespace:

| Token | Value | Use |
|-------|-------|-----|
| `ip-bg-deep` | `#070F15` | Page background |
| `ip-bg-mid` | `#0A1820` | Section bg |
| `ip-bg-card` | `#0D1E2A` | Card bg |
| `ip-primary` | `#3DD6B0` | Teal accent |
| `ip-text` | `#E8F5F2` | Primary text |
| `ip-text-muted` | `#6E9BAA` | Secondary text |

Reusable CSS utility classes are in `src/app/globals.css`:  
`glass-card`, `btn-primary`, `btn-ghost`, `badge`, `section-eyebrow`, `legal-prose`, etc.

---

## Adding an OG image

1. Design a `1200×630` image and save as `public/og-image.png`
2. It will be picked up automatically by the metadata in `layout.tsx`

For dynamic OG images per page, use Next.js [ImageResponse](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

---

## Future expansion checklist

- [ ] Add `public/apple-touch-icon.png` (180×180)
- [ ] Add `public/og-image.png` for social sharing
- [ ] Wire `NEXT_PUBLIC_SITE_URL` for absolute URL generation
- [ ] Add email capture form (Resend / Loops / Beehiiv)
- [ ] Add App Store / Google Play links once live
- [ ] Consider `next-sitemap` for SEO sitemap generation
- [ ] Add Plausible or PostHog for privacy-first analytics
