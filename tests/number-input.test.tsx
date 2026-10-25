import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { formatThousand, parseThousand } from '../src/lib/number';
import { NumberInput } from '../src/components/NumberInput';

describe('number formatting utilities', () => {
  test('formatThousand formats numbers with indonesian dot separator', () => {
    expect(formatThousand('')).toBe('');
    expect(formatThousand(null)).toBe('');
    expect(formatThousand(undefined)).toBe('');
    expect(formatThousand(0)).toBe('0');
    expect(formatThousand(500)).toBe('500');
    expect(formatThousand(1200)).toBe('1.200');
    expect(formatThousand(150000)).toBe('150.000');
    expect(formatThousand(1500000)).toBe('1.500.000');
    expect(formatThousand('10000000')).toBe('10.000.000');
  });

  test('formatThousand supports decimal numbers with comma', () => {
    expect(formatThousand(0.5)).toBe('0,5');
    expect(formatThousand(1250.75)).toBe('1.250,75');
  });

  test('parseThousand parses formatted string to number', () => {
    expect(parseThousand('')).toBe('');
    expect(parseThousand('0')).toBe(0);
    expect(parseThousand('1.200')).toBe(1200);
    expect(parseThousand('150.000')).toBe(150000);
    expect(parseThousand('1.500.000')).toBe(1500000);
    expect(parseThousand('0,5')).toBe(0.5);
    expect(parseThousand('1.250,75')).toBe(1250.75);
    expect(parseThousand('abc')).toBe('');
  });
});

describe('NumberInput component', () => {
  test('renders input with formatted value and numeric inputMode', () => {
    const html = renderToStaticMarkup(
      <NumberInput id="test-num" value={1500000} onChange={() => {}} placeholder="150000" />
    );
    expect(html).toContain('value="1.500.000"');
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('id="test-num"');
    expect(html).toContain('placeholder="150.000"');
  });

  test('renders input with decimal inputMode when allowDecimal is true', () => {
    const html = renderToStaticMarkup(
      <NumberInput id="test-dec" value={0.5} allowDecimal onChange={() => {}} />
    );
    expect(html).toContain('value="0,5"');
    expect(html).toContain('inputMode="decimal"');
  });

  test('renders empty value when value is empty or null', () => {
    const html = renderToStaticMarkup(
      <NumberInput id="test-empty" value="" onChange={() => {}} />
    );
    expect(html).toContain('value=""');
  });
});
