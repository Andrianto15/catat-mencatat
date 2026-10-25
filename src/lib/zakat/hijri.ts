export const HIJRI_RAMADHAN_DATES: Record<number, string> = {
  1440: '2019-05-06',
  1441: '2020-04-24',
  1442: '2021-04-13',
  1443: '2022-04-03',
  1444: '2023-03-23',
  1445: '2024-03-12',
  1446: '2025-03-01',
  1447: '2026-02-18',
  1448: '2027-02-08',
  1449: '2028-01-28',
  1450: '2029-01-16',
};

export function getHijriRamadhanDate(hijriYear: number): string {
  if (HIJRI_RAMADHAN_DATES[hijriYear]) {
    return HIJRI_RAMADHAN_DATES[hijriYear];
  }
  // Fallback approximation: 1 lunar year ~ 354.36 days
  const baseYear = 1447;
  const baseDate = new Date('2026-02-18');
  const diffYears = hijriYear - baseYear;
  const approxDays = Math.round(diffYears * 354.36);
  baseDate.setDate(baseDate.getDate() + approxDays);
  return baseDate.toISOString().split('T')[0];
}
