# OP NOTE — PRIVACY-POLICY-TELEMETRY-FIX

**Date:** 2026-07-05
**Repo:** incomepilot-website (valkoda.app) — Next.js App Router, deploys via Vercel.
**Page:** `src/app/privacy/page.tsx` — §3.3 "Usage and Diagnostics".

## What changed
The §3.3 disclosure previously said the app "does not currently transmit crash reports off your device." The 1.0 app ships an `AppTelemetryService` that inserts device type, OS version, app version, feature-usage events, and error information (error code + anonymised stack reference) into Supabase `app_telemetry_events`, linked to `user_id`. The old sentence was therefore inaccurate and would contradict the App Store App Privacy declaration.

Replaced the §3.3 paragraph to accurately disclose account-linked diagnostic + telemetry collection (device type, OS version, app version, feature-usage, error info), in our own backend, linked to the account — while preserving the true claims: **no third-party analytics SDKs, no advertising/tracking technologies.** Removed the inaccurate crash-report sentence.

Bumped the policy "Last updated" from `25 June 2026` → `5 July 2026` (substantive change).

## Why
Reconciles **security finding D3** (SECURITY-DEFENSIVE-AUDIT-1) — the policy did not match the shipped telemetry — and aligns the policy with the App Store App Privacy declaration (Diagnostics/Usage: **collected, linked to the user, not used for tracking/advertising**).

## Scope / verification
- Copy-only. No structure, styling, or other sections changed. Terms / Delete Account untouched — the crash-report sentence existed **only** in `privacy/page.tsx:76` (grep-confirmed; no shared component).
- `grep "does not currently transmit crash reports"` → **zero** occurrences repo-wide.
- `next build` (mirrors Vercel deploy): compiled successfully, 18/18 static pages generated, `/privacy` in the route table — page renders.
- Files changed: `src/app/privacy/page.tsx` (+ this op note).

## Deploy note
Vercel deploys `main` as production. This change is committed on a branch; pushing the branch creates a Vercel **preview** to review the rendered `/privacy`, and **merging to `main` publishes it live** to valkoda.app/privacy. Confirm the preview before merge.
