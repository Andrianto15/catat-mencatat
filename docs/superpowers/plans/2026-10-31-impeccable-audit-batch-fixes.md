# Impeccable Audit Batch Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute all four recommended actions from the Impeccable Audit report (Harden, Adapt, Optimize, Polish) to eliminate P1/P2/P3 issues across Accessibility, Theming, Responsive Design, and Performance.

**Architecture:** Standardize modal form controls and touch targets (≥44px), sanitize destructive motion-reduction media query, replace hardcoded colors with CSS variables, repair SVG ARIA button nesting, decouple package.json from the client bundle, memoize critical aggregations, and fix heading level skips.

**Tech Stack:** Next.js 14 (App Router), React 18, CSS Custom Properties (`src/app/globals.css`), Lucide Icons, Jest + React Testing Library.

**Spec:** Impeccable Audit Report (31-10-2026), `PRD.md`, `DESIGN.md`.

## Global Constraints
- Mobile-first layout prioritized over desktop (AGENTS.md Rule 9).
- Anti-slop guidelines strictly adhered to (`antislop-ui`, `antislop-layoutmobile`, `antislop-code`).
- Minimum touch target 44x44px for all interactive controls (buttons, links, inputs, selects, toggles).
- All unit tests must pass before completion (AGENTS.md Rule 5).
- No new external libraries or UI framework dependencies (Ponytail / YAGNI).
- Keep all existing comments and documentation intact.

## Review Focus
1. Motion Accessibility: `prefers-reduced-motion` must not destructively wipe state feedback or infinite spin spinners.
2. Dark Mode Contrast: Status chips in `emas/prices` must use semantic tokens (`--color-*-bg`, `--color-*-text`) without blinding light backgrounds in dark theme.
3. SVG ARIA Hierarchy: Interactive `<g role="button">` must not be swallowed by an ancestor `role="img"`.
4. Mobile Touch Targets: All inputs in `ServiceModal`, `PurchaseModal`, `YearModal`, chevron toggles, and checkboxes must have `minHeight: 44px`.
5. Bundle Optimization: `Footer.tsx` must not bundle full `package.json` into client chunks.

---

### Task 1: Accessibility & Theming Hardening (`/impeccable harden`)

**Files:**
- Modify: `src/app/globals.css:234-243`
- Modify: `src/app/emas/prices/page.tsx:380-405`
- Modify: `src/components/saldo-tahun/AnnualBalanceTrendChart.tsx:73-115`
- Modify: `src/components/motor/ServiceCard.tsx:73-89`
- Modify: `src/components/gold/SellModal.tsx:250-265`
- Test: `tests/audit-harden-fixes.test.tsx`

**Interfaces:**
- Consumes: CSS custom properties (`--color-danger-*`, `--color-warning-*`, `--color-success-*`, `--color-primary`)
- Produces: Non-destructive reduced motion styles, theme-synced status chips, and valid ARIA hierarchy in SVG trend chart.

- [x] **Step 1: Write failing test in `tests/audit-harden-fixes.test.tsx`**
  - Verify `globals.css` does not use `0.01ms !important` wipe on animations/transitions.
  - Verify `emas/prices/page.tsx` uses semantic CSS tokens instead of hardcoded `#fee2e2`, `#fef3c7`, `#dcfce7`.
  - Verify `AnnualBalanceTrendChart` does not wrap interactive `<g role="button">` inside `role="img"`, while maintaining `role="img"` on graphic sub-elements.
  - Verify `ServiceCard.tsx` uses `var(--color-danger-text)` instead of `#ef4444`.
  - Verify `SellModal.tsx` submit button uses `var(--color-primary)` or semantic token instead of `#10b981`.
- [x] **Step 2: Run test to verify failure**
  - Command: `rtk npm test tests/audit-harden-fixes.test.tsx`
- [x] **Step 3: Update `src/app/globals.css`**
  - Replace `0.01ms !important` with safe transition reduction that preserves state changes and functional feedback.
- [x] **Step 4: Update `src/app/emas/prices/page.tsx`**
  - Use `var(--color-danger-bg)`, `var(--color-danger-text)`, `var(--color-warning-bg)`, `var(--color-warning-text)`, `var(--color-success-bg)`, `var(--color-success-text)`.
- [x] **Step 5: Update `src/components/saldo-tahun/AnnualBalanceTrendChart.tsx`**
  - Shift `role="img"` from container `<div>` to graphic elements group `<g role="img" aria-label="...">` so `<g role="button">` remains accessible.
- [x] **Step 6: Update `ServiceCard.tsx` and `SellModal.tsx`**
  - Replace hardcoded hex colors with semantic tokens.
- [x] **Step 7: Run tests to verify all pass**
  - Command: `rtk npm test tests/audit-harden-fixes.test.tsx`

---

### Task 2: Mobile Touch Targets & Form Standardization (`/impeccable adapt`)

**Files:**
- Modify: `src/components/motor/ServiceModal.tsx`
- Modify: `src/components/gold/PurchaseModal.tsx`
- Modify: `src/components/zakat/YearModal.tsx`
- Modify: `src/components/motor/WorkshopAutocomplete.tsx:116-143`
- Modify: `src/app/saldo-tahun/settings/page.tsx:368-383`
- Modify: `src/app/emas/prices/page.tsx:340-348`
- Test: `tests/audit-adapt-targets.test.tsx`

**Interfaces:**
- Consumes: Standard `.form-input` and `.form-select` classes
- Produces: Minimum 44x44px touch targets across all modal fields, autocomplete buttons, filter buttons, and settings checkboxes.

- [x] **Step 1: Write failing test in `tests/audit-adapt-targets.test.tsx`**
  - Verify inputs in `ServiceModal`, `PurchaseModal`, `YearModal` have `minHeight: 44px`.
  - Verify chevron button in `WorkshopAutocomplete` has 44px minimum target dimensions.
  - Verify Telegram enabled checkbox in `saldo-tahun/settings` has 44px tap target padding/wrapper.
  - Verify `Reset Filter` in `emas/prices` has `minHeight: 44px`.
- [x] **Step 2: Run test to verify failure**
  - Command: `rtk npm test tests/audit-adapt-targets.test.tsx`
- [x] **Step 3: Update `src/components/motor/ServiceModal.tsx`**
  - Apply `className="form-input"` / `className="form-select"` and `minHeight: '44px'` to all input fields (`service-date`, `service-km`, `service-cost`).
- [x] **Step 4: Update `src/components/gold/PurchaseModal.tsx`**
  - Standardize all inputs (`gold-date`, `gold-weight`, `gold-pieces`, `gold-price`, `gold-buyback`) to `.form-input` / `.form-select` with `minHeight: '44px'`.
- [x] **Step 5: Update `src/components/zakat/YearModal.tsx`**
  - Standardize header inputs (`zakat-hijri-year`, `zakat-ref-date`, `zakat-gold-price`, `zakat-silver-price`, `zakat-gold-holdings`) to `.form-input` with `minHeight: '44px'`.
- [x] **Step 6: Update `WorkshopAutocomplete.tsx`, `saldo-tahun/settings/page.tsx`, and `emas/prices/page.tsx`**
  - Increase chevron button hit-area to 44x44px, wrap telegram toggle with 44px hit-area, and set reset filter button to minHeight 44px.
- [x] **Step 7: Run tests to verify all pass**
  - Command: `rtk npm test tests/audit-adapt-targets.test.tsx`

---

### Task 3: Performance Optimization & Calculation Memoization (`/impeccable optimize`)

**Files:**
- Create: `src/lib/version.ts`
- Modify: `src/components/Footer.tsx:1-25`
- Modify: `src/app/saldo-tahun/page.tsx:90-110`
- Modify: `src/app/emas/page.tsx:85-105`
- Test: `tests/audit-optimize.test.tsx`

**Interfaces:**
- Consumes: Static application version string and React `useMemo` hooks
- Produces: Decoupled client chunk without full `package.json` JSON tree, memoized financial summary computations.

- [x] **Step 1: Write failing test in `tests/audit-optimize.test.tsx`**
  - Verify `Footer.tsx` imports from `@/lib/version` instead of direct `package.json`.
  - Verify `saldo-tahun/page.tsx` uses `useMemo` for `yearsWithDeltas` and `paginatedYears`.
  - Verify `emas/page.tsx` uses `useMemo` for `summary` and `paginatedPurchases`.
- [x] **Step 2: Run test to verify failure**
  - Command: `rtk npm test tests/audit-optimize.test.tsx`
- [x] **Step 3: Create `src/lib/version.ts`**
  - Export `APP_VERSION = '0.7.0'` matching `package.json`.
- [x] **Step 4: Update `src/components/Footer.tsx`**
  - Replace `import packageJson from '../../package.json'` with `import { APP_VERSION } from '@/lib/version'`.
- [x] **Step 5: Update `saldo-tahun/page.tsx` and `emas/page.tsx`**
  - Wrap derived aggregations in `useMemo`.
- [x] **Step 6: Run tests to verify all pass**
  - Command: `rtk npm test tests/audit-optimize.test.tsx`

---

### Task 4: Heading Hierarchy & Design System Polish (`/impeccable polish`)

**Files:**
- Modify: `src/app/saldo-tahun/page.tsx:310-345`
- Modify: `src/components/saldo-tahun/AnnualBalanceTrendChart.tsx:90-105`
- Modify: `DESIGN.md` (if token mappings updated)
- Test: `tests/audit-polish-hierarchy.test.tsx`

**Interfaces:**
- Consumes: Semantic HTML heading elements (`<h1>`, `<h2>`, `<h3>`, `<h4>`)
- Produces: Strictly ordered heading hierarchy without skipped levels.

- [x] **Step 1: Write failing test in `tests/audit-polish-hierarchy.test.tsx`**
  - Verify `saldo-tahun/page.tsx` and `AnnualBalanceTrendChart.tsx` do not skip `<h2>` after `<h1>`.
- [x] **Step 2: Run test to verify failure**
  - Command: `rtk npm test tests/audit-polish-hierarchy.test.tsx`
- [x] **Step 3: Update `saldo-tahun/page.tsx` and `AnnualBalanceTrendChart.tsx`**
  - Adjust section titles to `<h2>` (e.g. `<h2>Riwayat Rekap Tahunan</h2>`, `<h2>Grafik Perkembangan Saldo Akhir Tahun</h2>`), subheaders to `<h3>`.
- [x] **Step 4: Run tests to verify all pass**
  - Command: `rtk npm test tests/audit-polish-hierarchy.test.tsx`

---

### Task 5: Full Regression Verification, PRD & Changelog Documentation

**Files:**
- Modify: `PRD.md`
- Create: `changelogs/CHANGELOG_31_10_2026.md`

- [x] **Step 1: Run full test suite to guarantee zero regression**
  - Command: `rtk npm test`
- [x] **Step 2: Re-run `/impeccable audit` detector to verify clean score**
  - Command: `rtk /Users/andriantonuriskandar/.gemini/config/skills/impeccable/scripts/impeccable detect --json src/`
- [x] **Step 3: Update `PRD.md`**
  - Record technical hardening standards (44px touch targets on modal controls, non-destructive reduced-motion styling, semantic token badge styling).
- [x] **Step 4: Create `changelogs/CHANGELOG_31_10_2026.md`**
  - Document all fixes under date heading `31-10-2026`.

