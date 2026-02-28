import { render, screen, fireEvent, act } from '@testing-library/react';

import { ExerciseSearchBar } from './ExerciseSearchBar';

const mockExercises = [
  { name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { name: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Barbell Squat', muscle: 'Quads', equipment: 'Barbell' },
  { name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable' },
  { name: 'Dumbbell Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Band Pull Apart', muscle: 'Back', equipment: 'Band' },
];

describe('ExerciseSearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with placeholder text', () => {
    render(
      <ExerciseSearchBar
        value=""
        onChange={() => {}}
        exercises={mockExercises}
        placeholder="Search exercises..."
      />,
    );
    expect(screen.getByPlaceholderText('Search exercises...')).toBeTruthy();
  });

  it('debounces onChange calls by 300ms', () => {
    const handleChange = vi.fn();
    render(
      <ExerciseSearchBar
        value=""
        onChange={handleChange}
        exercises={mockExercises}
      />,
    );

    const input = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(input, { target: { value: 'bench' } });

    // onChange should not be called immediately
    expect(handleChange).not.toHaveBeenCalled();

    // After 300ms, onChange should fire
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(handleChange).toHaveBeenCalledWith('bench');
  });

  it('shows autocomplete dropdown after 2+ characters', () => {
    render(
      <ExerciseSearchBar
        value=""
        onChange={() => {}}
        exercises={mockExercises}
      />,
    );

    const input = screen.getByPlaceholderText('Search exercises...');

    // Single character should not show dropdown
    fireEvent.change(input, { target: { value: 'b' } });
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();

    // Two characters should show matching suggestions
    fireEvent.change(input, { target: { value: 'ba' } });
    expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
    expect(screen.getByText('Barbell Squat')).toBeTruthy();
    expect(screen.getByText('Band Pull Apart')).toBeTruthy();
  });

  it('limits autocomplete to 5 results', () => {
    const manyExercises = Array.from({ length: 10 }, (_, i) => ({
      name: `Test Exercise ${i}`,
      muscle: 'Chest',
      equipment: 'Barbell',
    }));

    render(
      <ExerciseSearchBar
        value=""
        onChange={() => {}}
        exercises={manyExercises}
      />,
    );

    const input = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(input, { target: { value: 'Test' } });

    const items = screen.getAllByText(/Test Exercise/);
    expect(items.length).toBe(5);
  });

  it('selects an autocomplete item and calls onChange immediately', () => {
    const handleChange = vi.fn();
    render(
      <ExerciseSearchBar
        value=""
        onChange={handleChange}
        exercises={mockExercises}
      />,
    );

    const input = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(input, { target: { value: 'bar' } });

    const suggestion = screen.getByText('Barbell Bench Press');
    fireEvent.click(suggestion);

    // Should call onChange immediately (no debounce)
    expect(handleChange).toHaveBeenCalledWith('Barbell Bench Press');
  });

  it('clears input and calls onChange when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <ExerciseSearchBar
        value="bench"
        onChange={handleChange}
        exercises={mockExercises}
      />,
    );

    const clearBtn = screen.getByText('✕');
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith('');
  });
});
