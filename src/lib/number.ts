export function formatThousand(val: number | string | undefined | null): string {
  if (val === '' || val === null || val === undefined) {
    return '';
  }

  const str = String(val).trim();
  if (!str) return '';

  // Standardize decimal separator: if input contains comma, treat as decimal
  const normalized = str.includes(',') ? str.replace(/\./g, '').replace(',', '.') : str;
  const num = Number(normalized);
  if (isNaN(num)) return '';

  const [intPart, decPart] = normalized.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
}

export function parseThousand(val: string): number | '' {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed === '') return '';

  // Remove dots and convert comma to decimal point
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const num = Number(normalized);
  return isNaN(num) ? '' : num;
}
