'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { formatThousand, parseThousand } from '@/lib/number';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string;
  onChange: (value: number | '') => void;
  allowDecimal?: boolean;
  maxDecimalDigits?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  allowDecimal = false,
  maxDecimalDigits,
  placeholder,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    formatThousand(value, maxDecimalDigits)
  );

  useEffect(() => {
    const currentParsed = parseThousand(displayValue);
    const numericValue =
      value === '' || value === null || value === undefined ? '' : Number(value);

    if (currentParsed === numericValue && (displayValue !== '' || value === '')) {
      return;
    }

    setDisplayValue(formatThousand(value, maxDecimalDigits));
  }, [value, maxDecimalDigits]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (!raw.trim()) {
      setDisplayValue('');
      onChange('');
      return;
    }

    if (allowDecimal) {
      let intDigits = '';
      let decDigits: string | undefined = undefined;

      if (raw.includes(',') && raw.includes('.')) {
        const lastComma = raw.lastIndexOf(',');
        const lastDot = raw.lastIndexOf('.');
        if (lastDot > lastComma) {
          intDigits = raw.slice(0, lastDot).replace(/\D/g, '');
          decDigits = raw.slice(lastDot + 1).replace(/\D/g, '');
        } else {
          intDigits = raw.slice(0, lastComma).replace(/\D/g, '');
          decDigits = raw.slice(lastComma + 1).replace(/\D/g, '');
        }
      } else if (raw.includes(',')) {
        const parts = raw.split(',');
        if (parts.length > 2) return;
        intDigits = parts[0].replace(/\D/g, '');
        decDigits = parts[1].replace(/\D/g, '');
      } else if (raw.includes('.')) {
        const dotCount = (raw.match(/\./g) || []).length;
        if (dotCount === 1) {
          const parts = raw.split('.');
          if (raw.endsWith('.') || parts[1].length !== 3) {
            intDigits = parts[0].replace(/\D/g, '');
            decDigits = parts[1].replace(/\D/g, '');
          } else {
            intDigits = raw.replace(/\D/g, '');
          }
        } else {
          intDigits = raw.replace(/\D/g, '');
        }
      } else {
        intDigits = raw.replace(/\D/g, '');
      }

      if (!intDigits && decDigits === undefined) {
        setDisplayValue('');
        onChange('');
        return;
      }

      if (maxDecimalDigits !== undefined && decDigits !== undefined) {
        decDigits = decDigits.slice(0, maxDecimalDigits);
      }

      const formattedInt = (intDigits || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const formatted =
        decDigits !== undefined ? `${formattedInt},${decDigits}` : formattedInt;

      setDisplayValue(formatted);
      const parsed = parseThousand(formatted);
      onChange(parsed);
    } else {
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

  const formattedPlaceholder =
    placeholder !== undefined && !isNaN(Number(placeholder))
      ? formatThousand(placeholder, maxDecimalDigits)
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
