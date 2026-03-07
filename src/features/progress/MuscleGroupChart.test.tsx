import React from 'react';
import { render, screen } from '@testing-library/react';
import { MuscleGroupChart } from './MuscleGroupChart';
import type { MuscleGroupVolume } from '@/shared/types';

// recharts uses ResizeObserver internally via ResponsiveContainer
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub;

describe('MuscleGroupChart', () => {
  it('renders without crashing with empty data', () => {
    render(<MuscleGroupChart data={[]} />);
    expect(screen.getByText('Muscle Group Split')).toBeInTheDocument();
    expect(screen.getByText('No muscle group data available')).toBeInTheDocument();
  });

  it('renders without crashing with a single muscle group', () => {
    const data: MuscleGroupVolume[] = [
      { group: 'Chest', sets: 12, percentage: 100 },
    ];
    render(<MuscleGroupChart data={data} />);
    expect(screen.getByText('Muscle Group Split')).toBeInTheDocument();
  });

  it('renders without crashing with multiple muscle groups', () => {
    const data: MuscleGroupVolume[] = [
      { group: 'Chest', sets: 12, percentage: 40 },
      { group: 'Back', sets: 10, percentage: 33 },
      { group: 'Legs', sets: 8, percentage: 27 },
    ];
    render(<MuscleGroupChart data={data} />);
    expect(screen.getByText('Muscle Group Split')).toBeInTheDocument();
  });
});
