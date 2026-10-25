---
name: Andesa PDF Utility
description: Free, private, client-side in-browser PDF manipulation suite
colors:
  primary: "#4682b4"
  primary-hover: "#36648b"
  accent: "#0ea5e9"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-border-hover: "#cbd5e1"
  neutral-muted-hover: "#94a3b8"
  text-primary: "#0f172a"
  text-secondary: "#64748b"
  dark-bg: "#090d16"
  dark-surface: "#0f172a"
  dark-border: "#1e293b"
  dark-muted-thumb: "#334155"
  dark-muted-hover: "#475569"
  dark-drag-bg: "#274057"
  black: "#000000"
typography:
  display:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  micro:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  nano:
    fontFamily: "Public Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.02em"
  document:
    fontFamily: "Helvetica, Courier New, Times New Roman, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-tool:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
---

# Design System: Andesa PDF Utility

## Overview

**Creative North Star: "The Precision Document Lab"**

Andesa PDF Utility operates as a fast, private, and secure client-side digital workstation for all document workflows. Designed with tactile surfaces, crisp micro-interactions, and clear feedback states, the interface delivers professional desktop-grade performance directly inside the browser without exposing private files to remote servers.

The aesthetic blends clean Scandinavian minimalism with utilitarian precision. Elevated glass cards, restrained borders, and intentional accent pops maintain high scanability while reducing visual cognitive fatigue during extended PDF processing sessions.

**Key Characteristics:**
- **Zero-leak client privacy**: All files and operations execute locally within WebAssembly and standard web workers.
- **Tactile surface feedback**: Refined glass cards, gentle hover elevations, and explicit focus rings guide interactive flows.
- **Mobile-first adaptive ergonomics**: 44px minimum hit targets on touch devices with native safe area inset support.
- **Semantic token architecture**: Seamless light and dark mode adaptations backed by centralized CSS custom properties.

## Colors

The color palette centers around purposeful slate neutrals accented with precise Steel Blue and sky highlights to guide focus.

### Primary
- **Steel Blue Accent** (`#4682b4` / dark: `#6ba3ce`): Primary call-to-action buttons, active tabs, and primary state indicators.

### Secondary
- **Sky Glow** (`#0ea5e9` / dark: `#38bdf8`): Subtle progress bars, secondary badges, and selection indicators.

### Neutral
- **Slate Main Background** (`#f8fafc` / dark: `#090d16`): The foundational canvas backdrop.
- **Card Surface** (`#ffffff` / dark: `#0f172a`): Container backgrounds for tool cards, workspaces, and dialogs.
- **Divider & Border** (`#e2e8f0` / dark: `#1e293b`): Subtle separation lines and card borders.
- **Text Main** (`#0f172a` / dark: `#f8fafc`): Primary high-contrast content and heading color.
- **Text Muted** (`#64748b` / dark: `#94a3b8`): Descriptive subheadings, timestamps, and secondary metadata.

### Named Rules
**The Semantic Surface Rule.** All card backgrounds, borders, and main body canvas colors must reference semantic CSS custom properties (`--bg-main`, `--bg-card`, `--border-card`, `--text-main`, `--text-muted`) to ensure consistent dark and light mode rendering without layout thrashing.

## Typography

**Display Font:** Public Sans (fallback: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)  
**Body Font:** Public Sans (fallback: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)  
**Label/Mono Font:** JetBrains Mono (fallback: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)  
**Document Fonts:** Helvetica, Courier New, Times New Roman (standard embedded PDF reader fonts)  

**Character:** Utilitarian geometric sans-serif engineered for digital interfaces and official forms, high x-height, clear aperture definitions, and tabular lining numerals for precise document metadata display.

### Hierarchy
- **Display** (800, clamp(2rem, 5vw, 3rem), 1.15, -0.02em): Main hero heading and branding titles.
- **Headline** (700, 1.75rem, 1.25, -0.01em): Tool workspace headings and modal titles.
- **Title** (600, 1.125rem, 1.4, normal): Tool grid card titles and section headers.
- **Body** (400, 0.875rem, 1.5, normal): Main content, tool descriptions, and operational instructions (max 65–75ch).
- **Label** (600, 0.75rem, 1.4, 0.02em): Badges, table headers, file metadata, and input labels.
- **Micro** (500, 0.6875rem / 11px, 1.35, normal): Secondary metadata, timestamps, and compact footer legal notes.
- **Nano** (700, 0.625rem / 10px, 1.3, 0.02em): Uppercase badge pills and compact count indicators.
- **Mono** (400, 0.75rem, 1.4, normal): Supported file formats, code blocks, and technical parameters.

### Named Rules
**The Legibility First Rule.** All interactive labels and form descriptions must maintain a minimum contrast ratio of 4.5:1 against their surface backgrounds in both light and dark themes.

## Layout

The spatial model uses an 8-point base grid system with mobile-first responsiveness:
- **Mobile (<640px)**: Single-column tool grid, full-width modal drawer, persistent sticky action headers, and touch-optimized controls.
- **Tablet (640px–1024px)**: 2-column card grid, constrained workspace padding.
- **Desktop (>1024px)**: 3-column / 4-column balanced tool grid with a centered max-width container (`max-w-7xl`).
- **Safe Area Insets**: Handled on all screen edges via `env(safe-area-inset-*)` on `body` and floating toast containers.

## Elevation & Depth

Surfaces are predominantly flat with subtle tonal borders at rest. Depth is introduced dynamically on user interaction to signify actionable affordance.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)`): Baseline resting elevation for interactive cards.
- **Card Hover** (`box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`): Elevated state triggered by hover or focus.
- **Modal Float** (`box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`): Floating overlay elevation for workspace dialogs.

### Named Rules
**The Elevation On Action Rule.** Resting surfaces remain grounded with hairline borders (`1px solid var(--border-card)`). Elevation lifts appear only during hover, focus, drag, or modal states.

## Shapes

- **Base Radius (`rounded-lg` / 0.5rem - 0.75rem)**: Standard buttons, inputs, dropdowns, and interactive chips.
- **Card Radius (`rounded-xl` / 1rem)**: Tool cards and workspace panels.
- **Pill Radius (`rounded-full` / 9999px)**: Status badges, category pills, and floating action buttons.
- **Borders**: Hairline 1px solid stroke across all interactive container boundaries.

## Components

### Buttons
- **Shape:** Rounded corners (`0.5rem` / `rounded-lg`).
- **Primary:** Background `var(--color-primary)` (`#4682b4`), text white, font-weight 600, padding `0.625rem 1.25rem`.
- **Hover / Focus:** Hover darkens to `#36648b`; focus displays an accessible `:focus-visible` ring (`2px solid #4682b4` with `2px` offset).
- **Secondary / Ghost:** Transparent or white surface with border `1px solid var(--border-card)`, hover `rgba(0,0,0,0.03)`.

### Cards / Containers
- **Corner Style:** `1rem` (`rounded-xl`).
- **Background:** `var(--bg-card)` (`#ffffff` / dark `#0f172a`).
- **Border:** `1px solid var(--border-card)` (`#e2e8f0` / dark `#1e293b`).
- **Internal Padding:** `1.5rem` (`p-6`).

### Inputs / Fields
- **Style:** Stroke `1px solid #cbd5e1`, radius `0.5rem`, padding `0.5rem 0.75rem`.
- **Focus:** Ring `2px solid #4682b4` with border transition.
- **Disabled:** Background `rgba(0, 0, 0, 0.04)`, opacity 0.6, cursor not-allowed.

### Signature Pad
- **Canvas:** Direct pointer events with pointer capture (`touch-action: none`).
- **Resize Handle:** Minimum 44x44px hit bounds on touch/coarse pointers with keyboard arrow key resizing.

## Do's and Don'ts

### Do:
- **Do** map all background, surface, and text colors to CSS variables for dark mode compatibility.
- **Do** ensure interactive controls provide a minimum 44x44px touch target area on coarse pointers.
- **Do** include `:focus-visible` outlines and keyboard navigation listeners (`Enter` / `Space`) on all clickable elements.
- **Do** respect `@media (prefers-reduced-motion: reduce)` by disabling transitions for sensitive users.

### Don't:
- **Don't** perform DOM thrashing during progress updates; update leaf nodes directly.
- **Don't** retain `URL.createObjectURL()` references without explicit revocation upon cleanup.
- **Don't** leave broken image markup (`src=""`) on dynamic canvas or image overlay elements.
- **Don't** attach unmanaged global window listeners that leak memory when components unmount.
