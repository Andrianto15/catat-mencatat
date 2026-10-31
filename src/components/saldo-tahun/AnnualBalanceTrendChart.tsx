'use client';

import React, { useState } from 'react';
import { AnnualBalanceYearRecord } from '@/lib/saldo-tahun/engine';

interface AnnualBalanceTrendChartProps {
  years: AnnualBalanceYearRecord[];
}

export function AnnualBalanceTrendChart({ years }: AnnualBalanceTrendChartProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  if (!years || years.length === 0) return null;

  // Sorted ascending by Masehi year for time-series left-to-right
  const sorted = [...years].sort((a, b) => a.masehi_year - b.masehi_year);

  const netValues = sorted.map((y) => Number(y.net_balance || 0));
  const rawMax = Math.max(...netValues, 0);
  const rawMin = Math.min(...netValues, 0);
  const maxVal = rawMax === 0 && rawMin === 0 ? 1000000 : Math.max(rawMax * 1.1, 1000);
  const minVal = rawMin < 0 ? rawMin * 1.1 : 0;
  const valRange = maxVal - minVal || 1;

  const width = 600;
  const height = 180;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const points = sorted.map((y, idx) => {
    const x =
      sorted.length === 1
        ? padLeft + plotWidth / 2
        : padLeft + (idx / (sorted.length - 1)) * plotWidth;
    const yVal = Number(y.net_balance || 0);
    const normalizedY = (yVal - minVal) / valRange;
    const yCoord = padTop + (1 - normalizedY) * plotHeight;
    return { idx, x, y: yCoord, record: y };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Polygon area under the curve
  const polygonPoints =
    points.length === 1
      ? `${points[0].x},${points[0].y} ${points[0].x},${padTop + plotHeight}`
      : `${points[0].x},${padTop + plotHeight} ` +
        polylinePoints +
        ` ${points[points.length - 1].x},${padTop + plotHeight}`;

  const formatCompact = (val: number) => {
    return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(
      val
    );
  };

  const latest = sorted[sorted.length - 1];
  const activeRecord = activePoint !== null ? points[activePoint] : null;

  // Clamped coordinates for tooltip
  const tooltipWidth = 140;
  const tooltipHeight = 36;
  const rawTooltipX = activeRecord ? activeRecord.x - tooltipWidth / 2 : 0;
  const tooltipX = Math.max(padLeft, Math.min(rawTooltipX, width - padRight - tooltipWidth));
  const isNearTop = activeRecord ? activeRecord.y - tooltipHeight - 12 < padTop : false;
  const tooltipY = activeRecord ? (isNearTop ? activeRecord.y + 12 : activeRecord.y - tooltipHeight - 12) : 0;

  return (
    <div
      aria-label="Grafik perkembangan saldo akhir tahun"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-card)',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Grafik Perkembangan Saldo Akhir Tahun
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {sorted.length === 1
              ? `Tahun ${latest.masehi_year} M`
              : `Rentang ${sorted[0].masehi_year} \u2013 ${latest.masehi_year} M`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Tahun {latest.masehi_year}</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Rp {Number(latest.net_balance || 0).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '320px' }}
          onMouseLeave={() => setActivePoint(null)}
        >
          {/* Chart Graphic Elements */}
          <g role="img" aria-label="Grafik perkembangan saldo akhir tahun">
            {/* Horizontal grid lines */}
            <line
              x1={padLeft}
              y1={padTop}
              x2={width - padRight}
              y2={padTop}
              stroke="var(--border-card)"
              strokeDasharray="3 3"
            />
            <text
              x={padLeft - 8}
              y={padTop + 4}
              fontSize="10"
              fill="var(--text-muted)"
              textAnchor="end"
            >
              {formatCompact(maxVal)}
            </text>

            <line
              x1={padLeft}
              y1={padTop + plotHeight / 2}
              x2={width - padRight}
              y2={padTop + plotHeight / 2}
              stroke="var(--border-card)"
              strokeDasharray="3 3"
            />
            <text
              x={padLeft - 8}
              y={padTop + plotHeight / 2 + 4}
              fontSize="10"
              fill="var(--text-muted)"
              textAnchor="end"
            >
              {formatCompact(minVal + valRange / 2)}
            </text>

            <line
              x1={padLeft}
              y1={padTop + plotHeight}
              x2={width - padRight}
              y2={padTop + plotHeight}
              stroke="var(--border-card)"
            />
            <text
              x={padLeft - 8}
              y={padTop + plotHeight + 4}
              fontSize="10"
              fill="var(--text-muted)"
              textAnchor="end"
            >
              {formatCompact(minVal)}
            </text>

            {/* Area under curve */}
            <polygon
              points={polygonPoints}
              fill="var(--color-primary)"
              fillOpacity="0.12"
            />

            {/* Trend line */}
            <polyline
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          </g>

          {/* Active Guideline */}
          {activeRecord && (
            <line
              x1={activeRecord.x}
              y1={padTop}
              x2={activeRecord.x}
              y2={padTop + plotHeight}
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          )}

          {/* Data Points and X labels */}
          {points.map((p) => {
            const isLast = p.record.masehi_year === latest.masehi_year;
            const isActive = activePoint === p.idx;
            const formattedNominal = `Rp ${Number(p.record.net_balance || 0).toLocaleString('id-ID')}`;
            const labelText = `Tahun ${p.record.masehi_year}: ${formattedNominal}`;

            return (
              <g
                key={p.record.masehi_year}
                role="button"
                tabIndex={0}
                aria-label={labelText}
                style={{ cursor: 'pointer', outline: 'none' }}
                onMouseEnter={() => setActivePoint(p.idx)}
                onMouseLeave={() => setActivePoint(null)}
                onFocus={() => setActivePoint(p.idx)}
                onBlur={() => setActivePoint(null)}
                onClick={() => setActivePoint(isActive ? null : p.idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePoint(isActive ? null : p.idx);
                  }
                }}
              >
                <title>{labelText}</title>

                {/* Touch/hover hit-area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                />

                {/* Halo ring when active */}
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={9}
                    fill="var(--color-primary)"
                    fillOpacity="0.25"
                    stroke="var(--color-primary)"
                    strokeWidth="1.5"
                  />
                )}

                {/* Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 6 : isLast ? 5 : 4}
                  fill={isActive || isLast ? 'var(--color-primary)' : 'var(--bg-card)'}
                  stroke="var(--color-primary)"
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Year X-axis label */}
                <text
                  x={p.x}
                  y={height - 10}
                  fontSize="11"
                  fontWeight={isActive || isLast ? '700' : '500'}
                  fill={isActive || isLast ? 'var(--text-main)' : 'var(--text-muted)'}
                  textAnchor="middle"
                >
                  {p.record.masehi_year}
                </text>
              </g>
            );
          })}

          {/* Floating Tooltip Card */}
          {activeRecord && (
            <g
              transform={`translate(${tooltipX}, ${tooltipY})`}
              style={{ pointerEvents: 'none' }}
            >
              <rect
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                fill="var(--bg-card)"
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
              />
              <text
                x={tooltipWidth / 2}
                y={14}
                fontSize="10"
                fill="var(--text-muted)"
                textAnchor="middle"
                fontWeight="500"
              >
                Tahun {activeRecord.record.masehi_year} M
              </text>
              <text
                x={tooltipWidth / 2}
                y={28}
                fontSize="11"
                fill="var(--color-primary)"
                textAnchor="middle"
                fontWeight="700"
              >
                Rp {Number(activeRecord.record.net_balance || 0).toLocaleString('id-ID')}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
