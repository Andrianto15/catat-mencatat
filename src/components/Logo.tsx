import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({ size = 48, className, style }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Logo Catat-Mencatat"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="cm-component-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b6f9a" />
          <stop offset="100%" stopColor="#4682b4" />
        </linearGradient>
        <linearGradient id="cm-component-pencil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* App Icon Background */}
      <rect width="512" height="512" rx="112" fill="url(#cm-component-bg)" />

      {/* Notepad Paper */}
      <rect x="110" y="86" width="292" height="340" rx="28" fill="#ffffff" />

      {/* Top Spiral Wire Rings */}
      <rect x="150" y="68" width="18" height="36" rx="9" fill="#94a3b8" />
      <rect x="200" y="68" width="18" height="36" rx="9" fill="#94a3b8" />
      <rect x="250" y="68" width="18" height="36" rx="9" fill="#94a3b8" />
      <rect x="300" y="68" width="18" height="36" rx="9" fill="#94a3b8" />
      <rect x="350" y="68" width="18" height="36" rx="9" fill="#94a3b8" />

      {/* Row 1: Active Checklist Item (Green Check) */}
      <circle cx="165" cy="168" r="18" fill="#10b981" />
      <path
        d="M 157 168 L 163 174 L 174 162"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="200" y="160" width="162" height="16" rx="8" fill="#334155" />

      {/* Row 2: Secondary Checklist Item */}
      <circle cx="165" cy="232" r="18" fill="#10b981" />
      <path
        d="M 157 232 L 163 238 L 174 226"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="200" y="224" width="132" height="16" rx="8" fill="#64748b" />

      {/* Row 3: In-Progress Note Line */}
      <circle cx="165" cy="296" r="12" fill="#cbd5e1" />
      <rect x="200" y="288" width="170" height="16" rx="8" fill="#94a3b8" />

      {/* Row 4: Draft Note Line */}
      <circle cx="165" cy="354" r="10" fill="#e2e8f0" />
      <rect x="200" y="346" width="110" height="16" rx="8" fill="#cbd5e1" />

      {/* Stylus / Pencil at 45 degree angle */}
      <g transform="translate(355, 365) rotate(-45)">
        <rect x="-14" y="-76" width="28" height="18" rx="4" fill="#ef4444" />
        <rect x="-14" y="-58" width="28" height="8" fill="#cbd5e1" />
        <rect x="-14" y="-50" width="28" height="66" fill="url(#cm-component-pencil)" />
        <polygon points="-14,16 14,16 0,42" fill="#fde68a" />
        <polygon points="-5,32 5,32 0,42" fill="#334155" />
      </g>
    </svg>
  );
}
