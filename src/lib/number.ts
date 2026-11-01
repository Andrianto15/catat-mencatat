export function formatThousand(
  val: number | string | undefined | null,
  maxDecimals?: number
): string {
  if (val === '' || val === null || val === undefined) {
    return '';
  }

  const str = String(val).trim();
  if (!str) return '';

  let intStr = '';
  let decStr: string | undefined = undefined;

  if (typeof val === 'number') {
    if (isNaN(val)) return '';
    // Use JS toString() on number (e.g. 6951418.61 -> '6951418.61')
    const parts = String(val).split('.');
    intStr = parts[0];
    decStr = parts[1];
  } else {
    // String input
    if (str.includes(',') && str.includes('.')) {
      const lastComma = str.lastIndexOf(',');
      const lastDot = str.lastIndexOf('.');
      if (lastDot > lastComma) {
        // US format e.g. 6,951,418.61
        const clean = str.replace(/,/g, '');
        const parts = clean.split('.');
        intStr = parts[0];
        decStr = parts[1];
      } else {
        // ID format e.g. 6.951.418,61
        const clean = str.replace(/\./g, '');
        const parts = clean.split(',');
        intStr = parts[0];
        decStr = parts[1];
      }
    } else if (str.includes(',')) {
      const parts = str.replace(/\./g, '').split(',');
      intStr = parts[0];
      decStr = parts[1];
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length === 2 && parts[1].length !== 3) {
        // Likely decimal dot e.g. 0.5 or 6951418.61
        intStr = parts[0];
        decStr = parts[1];
      } else {
        // Thousands separator
        intStr = str.replace(/\./g, '');
      }
    } else {
      intStr = str;
    }
  }

  const cleanInt = intStr.replace(/\D/g, '');
  if (!cleanInt && decStr === undefined) return '';

  const formattedInt = (cleanInt || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (decStr !== undefined) {
    const cleanDec = decStr.replace(/\D/g, '');
    const finalDec =
      maxDecimals !== undefined ? cleanDec.slice(0, maxDecimals) : cleanDec;
    return `${formattedInt},${finalDec}`;
  }

  return formattedInt;
}

export function parseThousand(val: string): number | '' {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed === '') return '';

  let normalized = trimmed;
  if (trimmed.includes(',') && trimmed.includes('.')) {
    const lastComma = trimmed.lastIndexOf(',');
    const lastDot = trimmed.lastIndexOf('.');
    if (lastDot > lastComma) {
      // US format 6,951,418.61 -> 6951418.61
      normalized = trimmed.replace(/,/g, '');
    } else {
      // ID format 6.951.418,61 -> 6951418.61
      normalized = trimmed.replace(/\./g, '').replace(',', '.');
    }
  } else if (trimmed.includes(',')) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 2 && parts[1].length !== 3) {
      normalized = trimmed;
    } else {
      normalized = trimmed.replace(/\./g, '');
    }
  }

  const num = Number(normalized);
  return isNaN(num) ? '' : num;
}
