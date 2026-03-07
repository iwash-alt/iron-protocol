import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from './ExerciseCard';
import type { ExerciseCardProps } from './ExerciseCard';
import type { PlanExercise } from '@/shared/types';
import type { ProgressionResult } from '@/training/progression';

// ── Test fixture factory ─────────────────────────────────────────────────────

function makeExercise(overrides: Partial<PlanExercise['exercise']> = {}): PlanExercise['exercise'] {
  return {
    id: 'squat',
    name: 'Back Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    type: 'compound',
    isBodyweight: false,
    formCues: [],
    commonMistakes: [],
    ...overrides,
  };
}

function makePlanExercise(overrides: Partial<PlanExercise> = {}): PlanExercise {
  return {
    id: 'test-ex-1',
    dayId: 'day-1',
    exercise: makeExercise(),
    sets: 3,
    reps: 5,
    repsMin: 3,
    repsMax: 8,
    weightKg: 100,
    restSeconds: 120,
    progressionKg: 2.5,
    ...overrides,
  };
}

function makeProps(overrides: Partial<ExerciseCardProps> = {}): ExerciseCardProps {
  return {
    exercise: makePlanExercise(),
    index: 0,
    isFirst: false,
    isLast: false,
    completedSets: 0,
    currentVolume: 1500,
    previousVolume: 1400,
    isWarmupOpen: false,
    hasHistory: true,
    isResting: false,
    restSeconds: 0,
    justCompleted: null,
    restPulseTarget: null,
    progression: null,
    onCompleteSet: vi.fn(),
    onReorder: vi.fn(),
    onUpdateExercise: vi.fn(),
    onShowWarmup: vi.fn(),
    onShowHistory: vi.fn(),
    onShowEdit: vi.fn(),
    onShowSwap: vi.fn(),
    onShowHowTo: vi.fn(),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ExerciseCard', () => {
  describe('renders exercise information', () => {
    it('renders the exercise name', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.getByText('Back Squat')).toBeInTheDocument();
    });

    it('renders the muscle group tag', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.getByText('Quads')).toBeInTheDocument();
    });

    it('renders the equipment tag when not bodyweight', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.getByText('Barbell')).toBeInTheDocument();
    });

    it('does not render equipment tag when equipment is Bodyweight', () => {
      const props = makeProps({
        exercise: makePlanExercise({
          exercise: makeExercise({ equipment: 'Bodyweight', isBodyweight: true }),
        }),
      });
      render(<ExerciseCard {...props} />);
      expect(screen.queryByText('Bodyweight')).not.toBeInTheDocument();
    });

    it('renders target sets as a fraction showing done/total', () => {
      render(<ExerciseCard {...makeProps()} />);
      // Sets are displayed as "0/3" (done/total)
      expect(screen.getByText('0/3')).toBeInTheDocument();
    });
  });

  describe('complete set button', () => {
    it('shows complete set button when exercise is not done', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.getByText('COMPLETE SET 1')).toBeInTheDocument();
    });

    it('calls onCompleteSet with the plan exercise when the button is pressed', () => {
      const onCompleteSet = vi.fn();
      const exercise = makePlanExercise();
      render(<ExerciseCard {...makeProps({ exercise, onCompleteSet })} />);
      fireEvent.click(screen.getByText('COMPLETE SET 1'));
      expect(onCompleteSet).toHaveBeenCalledOnce();
      expect(onCompleteSet).toHaveBeenCalledWith(exercise);
    });

    it('advances the set number label as sets are completed', () => {
      render(<ExerciseCard {...makeProps({ completedSets: 1 })} />);
      expect(screen.getByText('COMPLETE SET 2')).toBeInTheDocument();
    });

    it('hides the complete set button when all sets are done', () => {
      render(<ExerciseCard {...makeProps({ completedSets: 3 })} />);
      expect(screen.queryByText(/COMPLETE SET/)).not.toBeInTheDocument();
    });

    it('shows Done chip when all sets are complete', () => {
      render(<ExerciseCard {...makeProps({ completedSets: 3 })} />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('rest timer', () => {
    it('shows rest timer countdown when isResting is true', () => {
      render(<ExerciseCard {...makeProps({ isResting: true, restSeconds: 45 })} />);
      // formatTime(45) => "0:45"
      expect(screen.getByText('RESTING... 0:45')).toBeInTheDocument();
    });

    it('disables the complete set button while resting', () => {
      render(<ExerciseCard {...makeProps({ isResting: true, restSeconds: 90 })} />);
      const btn = screen.getByText('RESTING... 1:30');
      expect(btn).toBeDisabled();
    });

    it('shows zero rest time correctly', () => {
      render(<ExerciseCard {...makeProps({ isResting: true, restSeconds: 0 })} />);
      expect(screen.getByText('RESTING... 0:00')).toBeInTheDocument();
    });
  });

  describe('progression banner', () => {
    it('does not show a progression banner while sets are incomplete', () => {
      const progression: ProgressionResult = {
        exerciseId: 'squat',
        field: 'weightKg',
        oldValue: 100,
        newValue: 102.5,
        reason: 'Target reps reached, progressing weight',
      };
      // completedSets < sets → isDone is false → banner is suppressed
      render(<ExerciseCard {...makeProps({ progression, completedSets: 2 })} />);
      expect(screen.queryByText(/Next session:/)).not.toBeInTheDocument();
    });

    it('shows a weight-increase progression banner when exercise is complete', () => {
      const progression: ProgressionResult = {
        exerciseId: 'squat',
        field: 'weightKg',
        oldValue: 100,
        newValue: 102.5,
        reason: 'Target reps reached, progressing weight',
      };
      render(<ExerciseCard {...makeProps({ progression, completedSets: 3 })} />);
      // formatProgressionBanner produces: "Next session: 102.5kg (+2.5kg)"
      expect(screen.getByText(/Next session: 102\.5kg/)).toBeInTheDocument();
    });

    it('shows a hold-weight progression banner when progression is null and exercise is complete', () => {
      render(<ExerciseCard {...makeProps({ progression: null, completedSets: 3 })} />);
      // null result → "Next session: same weight"
      expect(screen.getByText('Next session: same weight')).toBeInTheDocument();
    });

    it('shows a weight-decrease banner on RPE 10 result', () => {
      const progression: ProgressionResult = {
        exerciseId: 'squat',
        field: 'weightKg',
        oldValue: 100,
        newValue: 97.5,
        reason: 'RPE 10 - reducing weight for safety',
      };
      render(<ExerciseCard {...makeProps({ progression, completedSets: 3 })} />);
      expect(screen.getByText(/Next session: 97\.5kg/)).toBeInTheDocument();
    });

    it('does not show progression banner for bodyweight exercises', () => {
      const bwExercise = makePlanExercise({
        exercise: makeExercise({ isBodyweight: true, equipment: 'Bodyweight' }),
      });
      const progression: ProgressionResult = {
        exerciseId: 'pushup',
        field: 'reps',
        oldValue: 10,
        newValue: 11,
        reason: 'RPE indicates room for more reps',
      };
      render(<ExerciseCard {...makeProps({ exercise: bwExercise, progression, completedSets: 3 })} />);
      expect(screen.queryByText(/Next session:/)).not.toBeInTheDocument();
    });
  });

  describe('reorder buttons', () => {
    it('renders both reorder buttons with correct aria-labels', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.getByRole('button', { name: 'Move Back Squat up' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Move Back Squat down' })).toBeInTheDocument();
    });

    it('disables the move-up button when isFirst is true', () => {
      render(<ExerciseCard {...makeProps({ isFirst: true })} />);
      expect(screen.getByRole('button', { name: 'Move Back Squat up' })).toBeDisabled();
    });

    it('disables the move-down button when isLast is true', () => {
      render(<ExerciseCard {...makeProps({ isLast: true })} />);
      expect(screen.getByRole('button', { name: 'Move Back Squat down' })).toBeDisabled();
    });

    it('enables both reorder buttons when not first or last', () => {
      render(<ExerciseCard {...makeProps({ isFirst: false, isLast: false })} />);
      expect(screen.getByRole('button', { name: 'Move Back Squat up' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Move Back Squat down' })).not.toBeDisabled();
    });

    it('calls onReorder(index, index - 1) when move-up button is clicked', () => {
      const onReorder = vi.fn();
      render(<ExerciseCard {...makeProps({ index: 2, onReorder })} />);
      fireEvent.click(screen.getByRole('button', { name: 'Move Back Squat up' }));
      expect(onReorder).toHaveBeenCalledWith(2, 1);
    });

    it('calls onReorder(index, index + 1) when move-down button is clicked', () => {
      const onReorder = vi.fn();
      render(<ExerciseCard {...makeProps({ index: 2, onReorder })} />);
      fireEvent.click(screen.getByRole('button', { name: 'Move Back Squat down' }));
      expect(onReorder).toHaveBeenCalledWith(2, 3);
    });
  });

  describe('action buttons', () => {
    it('shows history button when hasHistory is true', () => {
      render(<ExerciseCard {...makeProps({ hasHistory: true })} />);
      expect(screen.getByTitle('History')).toBeInTheDocument();
    });

    it('hides history button when hasHistory is false', () => {
      render(<ExerciseCard {...makeProps({ hasHistory: false })} />);
      expect(screen.queryByTitle('History')).not.toBeInTheDocument();
    });

    it('calls onShowHistory with exercise name when history button is clicked', () => {
      const onShowHistory = vi.fn();
      render(<ExerciseCard {...makeProps({ hasHistory: true, onShowHistory })} />);
      fireEvent.click(screen.getByTitle('History'));
      expect(onShowHistory).toHaveBeenCalledOnce();
      expect(onShowHistory).toHaveBeenCalledWith('Back Squat');
    });

    it('calls onShowEdit with the plan exercise when edit button is clicked', () => {
      const onShowEdit = vi.fn();
      const exercise = makePlanExercise();
      render(<ExerciseCard {...makeProps({ exercise, onShowEdit })} />);
      fireEvent.click(screen.getByTitle('Edit'));
      expect(onShowEdit).toHaveBeenCalledOnce();
      expect(onShowEdit).toHaveBeenCalledWith(exercise);
    });
  });

  describe('overflow actions', () => {
    it('reveals overflow actions when the "More" button is clicked', () => {
      render(<ExerciseCard {...makeProps()} />);
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTitle('More'));
      expect(screen.getByText('Swap')).toBeInTheDocument();
    });

    it('hides overflow actions after a second click of the "More" button', () => {
      render(<ExerciseCard {...makeProps()} />);
      fireEvent.click(screen.getByTitle('More'));
      expect(screen.getByText('Swap')).toBeInTheDocument();
      fireEvent.click(screen.getByTitle('More'));
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
    });

    it('calls onShowSwap and hides overflow when Swap is clicked', () => {
      const onShowSwap = vi.fn();
      const exercise = makePlanExercise();
      render(<ExerciseCard {...makeProps({ exercise, onShowSwap })} />);
      fireEvent.click(screen.getByTitle('More'));
      fireEvent.click(screen.getByText('Swap'));
      expect(onShowSwap).toHaveBeenCalledWith(exercise);
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
    });

    it('calls onShowHowTo and hides overflow when How-to is clicked', () => {
      const onShowHowTo = vi.fn();
      const exercise = makePlanExercise();
      render(<ExerciseCard {...makeProps({ exercise, onShowHowTo })} />);
      fireEvent.click(screen.getByTitle('More'));
      fireEvent.click(screen.getByText('How-to'));
      expect(onShowHowTo).toHaveBeenCalledWith(exercise.exercise);
      expect(screen.queryByText('How-to')).not.toBeInTheDocument();
    });

    it('shows Warm-up option for non-bodyweight exercises', () => {
      render(<ExerciseCard {...makeProps()} />);
      fireEvent.click(screen.getByTitle('More'));
      expect(screen.getByText('Warm-up')).toBeInTheDocument();
    });

    it('hides Warm-up option for bodyweight exercises', () => {
      const bwExercise = makePlanExercise({
        exercise: makeExercise({ isBodyweight: true, equipment: 'Bodyweight' }),
      });
      render(<ExerciseCard {...makeProps({ exercise: bwExercise })} />);
      fireEvent.click(screen.getByTitle('More'));
      expect(screen.queryByText('Warm-up')).not.toBeInTheDocument();
    });

    it('calls onShowWarmup with exercise id when Warm-up is clicked and warmup is closed', () => {
      const onShowWarmup = vi.fn();
      const exercise = makePlanExercise();
      render(<ExerciseCard {...makeProps({ exercise, onShowWarmup, isWarmupOpen: false })} />);
      fireEvent.click(screen.getByTitle('More'));
      fireEvent.click(screen.getByText('Warm-up'));
      expect(onShowWarmup).toHaveBeenCalledWith(exercise.id);
    });

    it('calls onShowWarmup with null to close when warmup is already open', () => {
      const onShowWarmup = vi.fn();
      render(<ExerciseCard {...makeProps({ onShowWarmup, isWarmupOpen: true })} />);
      fireEvent.click(screen.getByTitle('More'));
      fireEvent.click(screen.getByText('Warm-up'));
      expect(onShowWarmup).toHaveBeenCalledWith(null);
    });
  });

  describe('warmup section', () => {
    it('renders warmup sets when isWarmupOpen is true', () => {
      render(<ExerciseCard {...makeProps({ isWarmupOpen: true })} />);
      expect(screen.getByText('WARM-UP SETS')).toBeInTheDocument();
    });

    it('does not render warmup sets when isWarmupOpen is false', () => {
      render(<ExerciseCard {...makeProps({ isWarmupOpen: false })} />);
      expect(screen.queryByText('WARM-UP SETS')).not.toBeInTheDocument();
    });
  });

  describe('volume delta indicator', () => {
    it('shows positive volume delta when currentVolume exceeds previousVolume', () => {
      render(<ExerciseCard {...makeProps({ currentVolume: 1500, previousVolume: 1400 })} />);
      // volDelta = 100, formatVolume(100, { abbreviated: true }) = "100kg", prefix "+"
      expect(screen.getByText('+100kg')).toBeInTheDocument();
    });

    it('shows negative volume delta when currentVolume is less than previousVolume', () => {
      render(<ExerciseCard {...makeProps({ currentVolume: 1300, previousVolume: 1500 })} />);
      // volDelta = -200, abs = 200 → "200kg", no "+" prefix
      expect(screen.getByText('200kg')).toBeInTheDocument();
    });

    it('does not show volume delta when previousVolume is zero', () => {
      const { container } = render(
        <ExerciseCard {...makeProps({ currentVolume: 1500, previousVolume: 0 })} />,
      );
      // When previousVolume === 0, volDelta is null and the delta div is not rendered
      // The volume stat still shows current volume, but no delta row
      const _statLabels = container.querySelectorAll('[style*="color"]');
      // Check that no element contains "+1,500kg" (which would be wrong)
      expect(screen.queryByText('+1,500kg')).not.toBeInTheDocument();
      expect(screen.queryByText('+1.5t')).not.toBeInTheDocument();
    });

    it('shows zero delta as positive when current equals previous', () => {
      render(<ExerciseCard {...makeProps({ currentVolume: 1500, previousVolume: 1500 })} />);
      // volDelta = 0, formatVolume(0, { abbreviated: true }) = "0kg", prefix "+"
      expect(screen.getByText('+0kg')).toBeInTheDocument();
    });
  });

  describe('sets progress display', () => {
    it('renders the correct segment count matching the exercise sets', () => {
      render(<ExerciseCard {...makeProps()} />);
      // getWarmupSets is called but unrelated — segment bar has pe.sets segments
      // We look for the sets fraction display
      expect(screen.getByText('0/3')).toBeInTheDocument();
    });

    it('updates the sets fraction as sets are completed', () => {
      render(<ExerciseCard {...makeProps({ completedSets: 2 })} />);
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });
  });

  describe('bodyweight display', () => {
    it('shows BW label instead of weight input for bodyweight exercises', () => {
      const bwExercise = makePlanExercise({
        exercise: makeExercise({ isBodyweight: true, equipment: 'Bodyweight' }),
      });
      render(<ExerciseCard {...makeProps({ exercise: bwExercise })} />);
      expect(screen.getByText('BW')).toBeInTheDocument();
    });
  });
});
