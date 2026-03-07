import React from 'react';
import { render, screen } from '@testing-library/react';
import { VolumeChart } from './VolumeChart';
import type { VolumePoint } from '@/shared/types';

// recharts uses ResizeObserver internally via ResponsiveContainer
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub;

describe('VolumeChart', () => {
  it('renders without crashing with empty data', () => {
    render(<VolumeChart data={[]} />);
    expect(screen.getByText('Volume Trend')).toBeInTheDocument();
    expect(screen.getByText('No volume data available')).toBeInTheDocument();
  });

  it('renders without crashing with minimal valid data', () => {
    const data: VolumePoint[] = [
      { date: '2024-01-05', volume: 5000, sessionCount: 2 },
    ];
    render(<VolumeChart data={data} />);
    expect(screen.getByText('Volume Trend')).toBeInTheDocument();
  });

  it('renders without crashing with multiple data points', () => {
    const data: VolumePoint[] = [
      { date: '2024-01-01', volume: 3000, sessionCount: 1 },
      { date: '2024-01-08', volume: 4500, sessionCount: 2 },
      { date: '2024-01-15', volume: 6000, sessionCount: 3 },
    ];
    render(<VolumeChart data={data} />);
    expect(screen.getByText('Volume Trend')).toBeInTheDocument();
  });

  it('accepts a custom height prop', () => {
    const data: VolumePoint[] = [
      { date: '2024-03-01', volume: 2000, sessionCount: 1 },
    ];
    // Should render without error; height is passed to ResponsiveContainer
    render(<VolumeChart data={data} height={300} />);
    expect(screen.getByText('Volume Trend')).toBeInTheDocument();
  });
});
