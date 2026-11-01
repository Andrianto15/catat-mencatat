# Security Audit Remediation Implementation Plan (Motor & Telegram Features)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development after user approval. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate security findings identified during the security re-audit following the motor service reminder and Telegram notification feature release.

**Architecture:** Enforce fail-closed owner allowlist verification on all Telegram API endpoints, eliminate non-production fail-open in `/api/cron/telegram-reminder`, normalize API middleware unauthorized/forbidden responses to structured JSON (avoid HTML redirects), add UUID regex validation and malformed JSON 400 error handling, and harden date utilities against NaN propagation.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase SSR, Jest 30.

---

### Audit Findings Summary

| ID | Component | Severity | Description | Remediated Status |
|----|-----------|----------|-------------|-------------------|
| SEC-08 | `/api/motor/reminder/telegram` & `/api/telegram/test` | Medium | Authenticated user session verified but `isAllowedUser` (owner email allowlist) bypassed at endpoint level | Done |
| SEC-09 | `/api/cron/telegram-reminder` | Medium | Fail-open execution in non-production when `CRON_SECRET` is unset | Done |
| SEC-10 | `/api/motor/reminder/telegram` & `/api/telegram/test` | Low | Malformed JSON body in POST request causes HTTP 500 instead of HTTP 400 Bad Request; missing UUID format validation for `motor_id` | Done |
| SEC-11 | `src/lib/supabase/middleware.ts` | Low | Middleware redirects `/api/*` requests to `/login` (307 HTML) instead of returning JSON 401/403 for API consumers | Done |
| SEC-12 | `src/lib/motor/actions.ts` | Low | `addMonthsClamped` produces `NaN-NaN-NaN` if given invalid date format; message text length uncapped before Telegram dispatch | Done |

---

### Task 1: Enforce Owner Allowlist on `/api/motor/reminder/telegram` and `/api/telegram/test`

**Files:**
- Modify: `src/app/api/motor/reminder/telegram/route.ts`
- Modify: `src/app/api/telegram/test/route.ts`
- Test: `tests/motor-telegram-api.test.ts`
- Test: `tests/telegram-sender-security.test.ts`

**Steps:**
- [x] Add failing test asserting that authenticated user with email not in `OWNER_EMAIL` receives HTTP 403 Forbidden (`Forbidden: Akun tidak memiliki akses`).
- [x] In `src/app/api/motor/reminder/telegram/route.ts` and `src/app/api/telegram/test/route.ts`:
  - Import `isAllowedUser` from `@/lib/supabase/middleware`.
  - Check `isAllowedUser(user.email, process.env.OWNER_EMAIL || process.env.OWNER_EMAILS)`. If false, return 403 JSON.
- [x] Run tests to verify they pass.

---

### Task 2: Fix Fail-Open in `/api/cron/telegram-reminder/route.ts`

**Files:**
- Modify: `src/app/api/cron/telegram-reminder/route.ts`
- Test: `tests/telegram-reminder.test.tsx`

**Steps:**
- [x] Add failing test asserting that request without valid Bearer `CRON_SECRET` returns HTTP 401 even when `NODE_ENV !== 'production'`.
- [x] In `src/app/api/cron/telegram-reminder/route.ts`:
  - Require valid Bearer token matching `CRON_SECRET` in all environments, or return 401 Unauthorized (fail-closed).
  - If `CRON_SECRET` is not configured on server, return 500 server misconfiguration error.
- [x] Run tests to verify all pass.

---

### Task 3: Handle Malformed JSON (400) and Validate UUID Format for `motor_id`

**Files:**
- Modify: `src/app/api/motor/reminder/telegram/route.ts`
- Modify: `src/app/api/telegram/test/route.ts`
- Test: `tests/motor-telegram-api.test.ts`

**Steps:**
- [x] Add failing test sending invalid JSON string and asserting status 400 (`Bad Request: Format JSON tidak valid`).
- [x] Add failing test sending invalid UUID for `motor_id` (e.g. `'abc-123'`) and asserting status 400 (`Format motor_id tidak valid`).
- [x] In `src/app/api/motor/reminder/telegram/route.ts` & `src/app/api/telegram/test/route.ts`:
  - Wrap `request.json()` in dedicated try/catch returning 400 on `SyntaxError`.
  - Validate `motor_id` with UUID regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`.
- [x] Run tests to verify they pass.

---

### Task 4: Normalize Middleware Authentication for API Routes

**Files:**
- Modify: `src/lib/supabase/middleware.ts`
- Test: `tests/auth-guard.test.ts`

**Steps:**
- [x] Add tests for `updateSession` / `resolveAuthRedirect` asserting API requests (`/api/*`) return 401/403 JSON or pass through to route handlers rather than 307 redirecting to `/login`.
- [x] Update `resolveAuthRedirect` to let `/api/` routes pass through so route handlers enforce their native JSON 401/403 responses.
- [x] Run tests to verify all pass.

---

### Task 5: Date Utility Defense & Telegram Text Length Cap

**Files:**
- Modify: `src/lib/motor/actions.ts`
- Modify: `src/app/api/motor/reminder/telegram/route.ts`
- Test: `tests/motor-reminder.test.ts`

**Steps:**
- [x] Add test for `addMonthsClamped` with invalid date string verifying it returns empty string instead of `NaN-NaN-NaN`.
- [x] Update `addMonthsClamped` with `/^\d{4}-\d{2}-\d{2}$/` regex check.
- [x] In `/api/motor/reminder/telegram/route.ts`, truncate message if exceeding 4000 characters before sending to Telegram.
- [x] Run tests to verify all pass.

---

### Task 6: Full Verification, PRD Sync & Changelog

**Files:**
- Modify: `PRD.md`
- Modify: `changelogs/CHANGELOG_01_11_2026.md`

**Steps:**
- [x] Run full test suite: `rtk npm test` (all tests pass).
- [x] Run build check: `rtk npm run build` (0 build errors).
- [x] Update `PRD.md` with SEC-08 through SEC-12 security controls.
- [x] Append changelog entry in `changelogs/CHANGELOG_01_11_2026.md`.

