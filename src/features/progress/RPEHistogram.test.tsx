import React from 'react';
import { render, screen } from '@testing-library/react';
import { RPEHistogram } from './RPEHistogram';
import type { RPEDistribution } from '@/shared/types';

// recharts uses ResizeObserver internally via ResponsiveContainer
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub;

describe('RPEHistogram', () => {
  it('renders without crashing with empty data', () => {
    render(<RPEHistogram data={[]} />);
    expect(screen.getByText('RPE Distribution')).toBeInTheDocument();
    expect(screen.getByText('No RPE data available')).toBeInTheDocument();
  });

  it('renders without crashing with minimal valid data', () => {
    const data: RPEDistribution[] = [
      { rpe: 7, count: 5 },
    ];
    render(<RPEHistogram data={data} />);
    expect(screen.getByText('RPE Distribution')).toBeInTheDocument();
  });

  it('renders without crashing with a full distribution across RPE 1–10', () => {
    const data: RPEDistribution[] = Array.from({ length: 10 }, (_, i) => ({
      rpe: i + 1,
      count: i + 1,
    }));
    render(<RPEHistogram data={data} />);
    expect(screen.getByText('RPE Distribution')).toBeInTheDocument();
  });

  it('shows no-data state when data array has entries but all counts are zero', () => {
    const data: RPEDistribution[] = [
      { rpe: 5, count: 0 },
      { rpe: 6, count: 0 },
    ];
    render(<RPEHistogram data={data} />);
    expect(screen.getByText('No RPE data available')).toBeInTheDocument();
  });
});
