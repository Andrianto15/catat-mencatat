# Zakat Dual Nisab (Emas & Perak) & Yang Dibayarkan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Overview
Implement dual nisab reference for Zakat Mal (Gold 85g and Silver 595g) with separate zakat output columns, and an editable "Yang Dibayarkan" field defaulted to rounding up from 2.5% zakat.

## Tasks

- [ ] **Task 1: Supabase Database Migration**
  - Create `supabase/migrations/20261030000003_add_silver_and_paid_to_zakat_years.sql`
  - Add `silver_price_per_gram`, `nisab_silver_nominal`, `zakat_silver_due`, and `zakat_paid` columns to `zakat_years`
  - Verify migration file syntax

- [ ] **Task 2: Calculation Engine (`src/lib/zakat/engine.ts`) with TDD**
  - Write test cases in `tests/zakat-engine.test.ts` for dual nisab logic and rounding
  - Update `calculateZakat` to calculate gold nisab (85g) and silver nisab (595g)
  - Handle logic: if gold not wajib but silver wajib, output 2.5% on silver; if both wajib, values are equal
  - Compute `defaultZakatPaid` as round-up to nearest 10,000
  - Update `compareTwoZakatYears` with silver zakat and amount paid diffs
  - Run `rtk npm test` to verify

- [ ] **Task 3: YearModal Component Updates**
  - Add input field for `silver_price_per_gram` (default 18,000 / gram)
  - Display dual nisab thresholds and separate zakat due values
  - Add editable "Yang Dibayarkan" `NumberInput` field
  - Add quick rounding chips to set "Yang Dibayarkan"
  - Pass `silver_price_per_gram`, `nisab_silver_nominal`, `zakat_silver_due`, `zakat_paid` to `onSave`

- [ ] **Task 4: Spreadsheet & Mobile Comparison Views**
  - Update `ZakatSpreadsheetTable.tsx` to include Nisab Perak, Zakat Perak, and Yang Dibayarkan rows
  - Update `CompareTwoYears.tsx` with dual nisab and Yang Dibayarkan comparison
  - Update `src/app/zakat/page.tsx` for data fetching, saving, and card display

- [ ] **Task 5: Verification, Tests, PRD.md & Changelog**
  - Run all unit tests (`rtk npm test`)
  - Update `PRD.md` with dual nisab and Yang Dibayarkan specifications
  - Append changelog entry to `changelogs/CHANGELOG_30_10_2026.md`

