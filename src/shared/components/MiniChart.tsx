import React from 'react';

interface MiniChartProps {
  data: number[];
  color?: string;
  type?: 'line' | 'bar';
  height?: number;
}

export function MiniChart({ data, color = '#FF3B30', type = 'line', height = 50 }: MiniChartProps) {
  if (!data?.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  if (type === 'bar') {
    return (
      <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none">
        {data.map((v, i) => (
          <rect
            key={i}
            x={i * (100 / data.length) + 1}
            y={50 - (v / max) * 45}
            width={100 / data.length - 2}
            height={(v / max) * 45}
            fill={color}
            opacity={0.5 + i * 0.05}
            rx="2"
          />
        ))}
      </svg>
    );
  }

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${50 - ((v - min) / range) * 40 - 5}`)
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,50 ${pts} 100,50`} fill="url(#cg)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
