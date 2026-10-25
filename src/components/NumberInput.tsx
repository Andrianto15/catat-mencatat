'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { formatThousand, parseThousand } from '@/lib/number';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string;
  onChange: (value: number | '') => void;
  allowDecimal?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  allowDecimal = false,
  placeholder,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => formatThousand(value));

  useEffect(() => {
    setDisplayValue(formatThousand(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (!raw.trim()) {
      setDisplayValue('');
      onChange('');
      return;
    }

    if (allowDecimal) {
      // Allow digits and at most one decimal separator (comma or dot)
      const sanitized = raw.replace(/[^0-9,.]/g, '');
      const parts = sanitized.split(/[,.]/);
      if (parts.length > 2) return;

      const intPart = parts[0].replace(/\./g, '');
      const formattedInt = intPart ? formatThousand(intPart) : '0';
      const formatted = parts.length === 2 ? `${formattedInt},${parts[1]}` : formattedInt;

      setDisplayValue(formatted);
      const parsed = parseThousand(formatted);
      onChange(parsed);
    } else {
      // Only digits
      const digitsOnly = raw.replace(/\D/g, '');
      if (!digitsOnly) {
        setDisplayValue('');
        onChange('');
        return;
      }
      const formatted = formatThousand(digitsOnly);
      setDisplayValue(formatted);
      onChange(Number(digitsOnly));
    }
  };

  const formattedPlaceholder = placeholder !== undefined && !isNaN(Number(placeholder))
    ? formatThousand(placeholder)
    : placeholder;

  return (
    <input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={displayValue}
      onChange={handleChange}
      placeholder={formattedPlaceholder}
      style={{
        ...style,
      }}
      {...props}
    />
  );
};

export default NumberInput;
