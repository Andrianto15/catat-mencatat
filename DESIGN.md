---
name: Catat-Mencatat Design System
description: Mobile-first Progressive Web App (PWA) for motorcycle service history, physical gold portfolio, and annual zakat mal calculations
colors:
  primary: "#4682b4"
  primary-hover: "#36648b"
  accent: "#0ea5e9"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  text-primary: "#0f172a"
  text-secondary: "#64748b"
  dark-bg: "#090d16"
  dark-surface: "#0f172a"
  dark-border: "#1e293b"
  dark-text-primary: "#f8fafc"
  dark-text-secondary: "#94a3b8"
  danger-bg-light: "#fee2e2"
  danger-text-light: "#b91c1c"
  danger-bg-dark: "rgba(239, 68, 68, 0.2)"
  danger-text-dark: "#fca5a5"
  success-bg-light: "#dcfce7"
  success-text-light: "#15803d"
  success-bg-dark: "rgba(16, 185, 129, 0.2)"
  success-text-dark: "#6ee7b7"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
---

# Design System: Catat-Mencatat

## Overview

**Creative North Star: "The Private Financial Ledger"**

Catat-Mencatat is a lightweight, mobile-first Progressive Web App (PWA) designed for seamless tracking across three specialized modules:
1. **Servis Motor**: Periodic maintenance, kilometer odometer logs, workshop notes, and recurring expense tracking.
2. **Emas Fisik**: Physical gold bar portfolio, Galeri24/Antam daily buyback price scraping, and realized/unrealized profit calculation.
3. **Zakat Mal**: Annual haul calculation on 1st Ramadhan, nisab threshold checking against 85g gold, cash account balance tracking, and year-over-year comparison.

The interface prioritizes mobile ergonomic comfort: bottom-sheet modals, minimum 44x44px touch targets, zero horizontal layout leaks, and complete light/dark/system theme synchronization without FOUC (flash of unstyled content).

## Colors & Semantic Tokens

All UI components reference centralized CSS custom properties declared in `src/app/globals.css`:

### Primary & Accent
- **Primary Steel Blue** (`#4682b4` / hover `#36648b`): Active actions, floating action buttons, module headers.
- **Accent Sky** (`#0ea5e9`): Focus indicators, active status highlights.

### Semantic Status Tokens
- **Danger Background** (`--color-danger-bg`): `#fee2e2` (light) / `rgba(239, 68, 68, 0.2)` (dark).
- **Danger Text** (`--color-danger-text`): `#b91c1c` (light) / `#fca5a5` (dark).
- **Success Background** (`--color-success-bg`): `#dcfce7` (light) / `rgba(16, 185, 129, 0.2)` (dark).
- **Success Text** (`--color-success-text`): `#15803d` (light) / `#6ee7b7` (dark).

### Canvas & Surface
- **Canvas Backdrop** (`--bg-main`): `#f8fafc` (light) / `#090d16` (dark).
- **Card Surface** (`--bg-card`): `#ffffff` (light) / `#0f172a` (dark).
- **Card Border** (`--border-card`): `#e2e8f0` (light) / `#1e293b` (dark).
- **Main Text** (`--text-main`): `#0f172a` (light) / `#f8fafc` (dark).
- **Muted Text** (`--text-muted`): `#64748b` (light) / `#94a3b8` (dark).

## Mobile-First Ergonomics & Accessibility

1. **Touch Targets**: All interactive elements (buttons, links, toggle switches, filter pills, close icons) provide a minimum bounding area of `44px x 44px`.
2. **Dialog Accessibility**: All modal sheets provide:
   - `role="dialog"` and `aria-modal="true"`.
   - Explicit `aria-labelledby` linking to dialog heading.
   - Global `Escape` keyboard dismissal.
   - Distinct, accessible close button with `aria-label="Tutup"`.
3. **Form Fields**: Every `<input>`, `<select>`, and `<textarea>` is linked to an explicit `<label htmlFor="...">` with matching `id`.
4. **Viewport Scaling**: Unrestricted pinch-to-zoom for WCAG AA 1.4.4 compliance.
5. **Safe Area Insets**: Handled via `calc(padding + env(safe-area-inset-bottom))` for notch and home-indicator compatibility.
