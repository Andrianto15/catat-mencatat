# Impeccable Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve technical quality findings from Impeccable Audit across Accessibility, Theming, Responsive Design, and Implementation Integrity.

**Architecture:** Refactor viewport settings for WCAG zoom compliance, introduce shared semantic theme tokens in `globals.css`, harden modal accessibility and touch targets (>=44px), fix unlinked form labels, align `DESIGN.md` with Catat-Mencatat domain, and add test coverage.

**Tech Stack:** Next.js 14 (App Router), React, Lucide Icons, Vanilla CSS Custom Properties, Jest + Testing Library.

**Spec:** Impeccable Audit Report (25-10-2026), `PRD.md`.

## Global Constraints
- Mobile-first prioritised over desktop (AGENTS.md Rule 9).
- Anti-slop guidelines adhered to (`antislop-ui`, `antislop-layoutmobile`, `antislop-code`).
- Minimum touch target 44x44px on all interactive controls.
- All unit tests must pass before completion (AGENTS.md Rule 5).
- No new external UI libraries or dependencies.

## Review Focus
1. Viewport accessibility: Mobile browsers must allow pinch-to-zoom (WCAG 1.4.4).
2. Keyboard accessibility: Modals dismiss on Escape and trap focus; inputs show visible focus outlines.
3. Form accessibility: All `<label>` elements link to input `id` attributes.
4. Mobile touch targets: Modal close buttons and filter pills meet 44px minimum touch targets.
5. Theme adaptability: Alert banners and status colors adapt to dark mode without low-contrast glare.

---

### Task 1: Viewport & Form Accessibility Hardening

**Files:**
- Modify: `src/app/layout.tsx:18-25`
- Modify: `src/app/login/page.tsx:60-120`
- Test: `tests/a11y-layout.test.ts`

**Interfaces:**
- Consumes: Next.js Viewport export, standard HTML form elements
- Produces: Unblocked zoom viewport, explicit label/input associations

- [ ] **Step 1: Write test for viewport zoom settings**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Modify `src/app/layout.tsx` to remove `maximumScale: 1` and `userScalable: false`**
- [ ] **Step 4: Add `htmlFor` and `id` to `src/app/login/page.tsx` and fix `:focus-visible` outline**
- [ ] **Step 5: Run test to verify it passes**

---

### Task 2: Semantic Theme Tokens & Alert Colors

**Files:**
- Modify: `src/app/globals.css:1-40`
- Modify: `src/app/login/page.tsx:60-72`
- Test: `tests/theme-tokens.test.ts`

**Interfaces:**
- Consumes: CSS custom properties in `globals.css`
- Produces: Semantic danger and success CSS variables (`--color-danger-bg`, `--color-danger-text`, `--color-success-bg`, `--color-success-text`)

- [ ] **Step 1: Write test verifying semantic danger and success tokens in CSS**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Update `globals.css` with semantic color tokens for root, light, and dark mode**
- [ ] **Step 4: Update alert box in `src/app/login/page.tsx` to use semantic CSS variables**
- [ ] **Step 5: Run test to verify it passes**

---

### Task 3: Modal Dialog Accessibility & Touch Target Hardening

**Files:**
- Modify: `src/components/motor/ServiceModal.tsx`
- Modify: `src/components/gold/PurchaseModal.tsx`
- Modify: `src/components/gold/SellModal.tsx`
- Modify: `src/components/zakat/YearModal.tsx`
- Test: `tests/modal-a11y.test.tsx`

**Interfaces:**
- Consumes: React component props
- Produces: WAI-ARIA compliant dialog wrappers with `role="dialog"`, `aria-modal="true"`, `Escape` listener, 44x44px close target, and `<label htmlFor>` / `<input id>`

- [ ] **Step 1: Write unit test testing modal dialog accessibility attributes and touch target**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Update `ServiceModal.tsx` with dialog attributes, Escape handler, 44px close button, and linked form IDs**
- [ ] **Step 4: Update `PurchaseModal.tsx`, `SellModal.tsx`, and `YearModal.tsx` with identical accessibility fixes**
- [ ] **Step 5: Run test to verify it passes**

---

### Task 4: Responsive Touch Targets & Mobile Stats Reflow

**Files:**
- Modify: `src/app/zakat/page.tsx`
- Modify: `src/app/motor/page.tsx`
- Test: `tests/responsive-targets.test.ts`

**Interfaces:**
- Consumes: Inline layouts and CSS
- Produces: 44px touch targets on person filter pills and fluid auto-fitting stats grid on small viewports

- [ ] **Step 1: Write test for filter pill minimum touch target and stats layout**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Update `src/app/zakat/page.tsx` to set `minHeight: '44px'` and adequate touch padding on person pills**
- [ ] **Step 4: Update `src/app/motor/page.tsx` to use responsive grid for stats cards that reflows gracefully on narrow screens**
- [ ] **Step 5: Run test to verify it passes**

---

### Task 5: Design Documentation Synchronization

**Files:**
- Modify: `DESIGN.md`
- Test: `tests/design-doc.test.ts`

**Interfaces:**
- Consumes: PRD.md and current implementation tokens
- Produces: Up-to-date DESIGN.md representing Catat-Mencatat system

- [ ] **Step 1: Write test verifying `DESIGN.md` describes Catat-Mencatat and contains correct theme tokens**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Rewrite `DESIGN.md` with accurate brand identity, color tokens, typography, and mobile ergonomics**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 6: Final Verification, PRD Update & Changelog

**Files:**
- Modify: `PRD.md`
- Create: `changelogs/CHANGELOG_25_10_2026.md`

- [ ] **Step 1: Run full test suite (`npm test`)**
- [ ] **Step 2: Update `PRD.md` to document accessibility, zoom compliance, and semantic tokens**
- [ ] **Step 3: Create `changelogs/CHANGELOG_25_10_2026.md` with summary of audit fixes**
