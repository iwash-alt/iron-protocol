import {
  volumePointSchema,
  rpeDistributionSchema,
  muscleGroupVolumeSchema,
  progressionPointSchema,
} from './schemas';

// ── VolumePoint ───────────────────────────────────────────────

describe('volumePointSchema', () => {
  it('parses a valid VolumePoint', () => {
    const result = volumePointSchema.parse({
      date: '2024-01-08',
      volume: 5400,
      sessionCount: 3,
    });
    expect(result.volume).toBe(5400);
    expect(result.sessionCount).toBe(3);
  });

  it('accepts zero volume and zero sessionCount', () => {
    const result = volumePointSchema.parse({
      date: '2024-01-08',
      volume: 0,
      sessionCount: 0,
    });
    expect(result.volume).toBe(0);
    expect(result.sessionCount).toBe(0);
  });

  it('rejects missing date', () => {
    expect(() =>
      volumePointSchema.parse({ volume: 100, sessionCount: 1 }),
    ).toThrow();
  });

  it('rejects negative volume', () => {
    expect(() =>
      volumePointSchema.parse({ date: '2024-01-08', volume: -1, sessionCount: 1 }),
    ).toThrow();
  });

  it('rejects fractional sessionCount', () => {
    expect(() =>
      volumePointSchema.parse({ date: '2024-01-08', volume: 100, sessionCount: 1.5 }),
    ).toThrow();
  });
});

// ── RPEDistribution ───────────────────────────────────────────

describe('rpeDistributionSchema', () => {
  it('parses a valid RPEDistribution', () => {
    const result = rpeDistributionSchema.parse({ rpe: 8, count: 12 });
    expect(result.rpe).toBe(8);
    expect(result.count).toBe(12);
  });

  it('accepts RPE=10 (edge maximum)', () => {
    const result = rpeDistributionSchema.parse({ rpe: 10, count: 5 });
    expect(result.rpe).toBe(10);
  });

  it('accepts RPE=1 (edge minimum)', () => {
    const result = rpeDistributionSchema.parse({ rpe: 1, count: 0 });
    expect(result.rpe).toBe(1);
  });

  it('accepts count=0', () => {
    const result = rpeDistributionSchema.parse({ rpe: 7, count: 0 });
    expect(result.count).toBe(0);
  });

  it('rejects missing rpe', () => {
    expect(() => rpeDistributionSchema.parse({ count: 3 })).toThrow();
  });

  it('rejects missing count', () => {
    expect(() => rpeDistributionSchema.parse({ rpe: 8 })).toThrow();
  });

  it('rejects rpe above 10', () => {
    expect(() => rpeDistributionSchema.parse({ rpe: 11, count: 1 })).toThrow();
  });

  it('rejects rpe below 1', () => {
    expect(() => rpeDistributionSchema.parse({ rpe: 0, count: 1 })).toThrow();
  });

  it('rejects negative count', () => {
    expect(() => rpeDistributionSchema.parse({ rpe: 8, count: -1 })).toThrow();
  });
});

// ── MuscleGroupVolume ─────────────────────────────────────────

describe('muscleGroupVolumeSchema', () => {
  it('parses a valid MuscleGroupVolume', () => {
    const result = muscleGroupVolumeSchema.parse({
      group: 'Chest',
      sets: 12,
      percentage: 25.5,
    });
    expect(result.group).toBe('Chest');
    expect(result.sets).toBe(12);
    expect(result.percentage).toBe(25.5);
  });

  it('accepts sets=0 (empty week)', () => {
    const result = muscleGroupVolumeSchema.parse({
      group: 'Calves',
      sets: 0,
      percentage: 0,
    });
    expect(result.sets).toBe(0);
  });

  it('accepts percentage=100 (edge maximum)', () => {
    const result = muscleGroupVolumeSchema.parse({
      group: 'Back',
      sets: 20,
      percentage: 100,
    });
    expect(result.percentage).toBe(100);
  });

  it('accepts percentage=0 (edge minimum)', () => {
    const result = muscleGroupVolumeSchema.parse({
      group: 'Traps',
      sets: 0,
      percentage: 0,
    });
    expect(result.percentage).toBe(0);
  });

  it('rejects empty group string', () => {
    expect(() =>
      muscleGroupVolumeSchema.parse({ group: '', sets: 5, percentage: 10 }),
    ).toThrow();
  });

  it('rejects missing group', () => {
    expect(() =>
      muscleGroupVolumeSchema.parse({ sets: 5, percentage: 10 }),
    ).toThrow();
  });

  it('rejects percentage above 100', () => {
    expect(() =>
      muscleGroupVolumeSchema.parse({ group: 'Chest', sets: 5, percentage: 101 }),
    ).toThrow();
  });

  it('rejects negative percentage', () => {
    expect(() =>
      muscleGroupVolumeSchema.parse({ group: 'Chest', sets: 5, percentage: -1 }),
    ).toThrow();
  });

  it('rejects fractional sets', () => {
    expect(() =>
      muscleGroupVolumeSchema.parse({ group: 'Chest', sets: 2.5, percentage: 10 }),
    ).toThrow();
  });
});

// ── ProgressionPoint ──────────────────────────────────────────

describe('progressionPointSchema', () => {
  it('parses a valid ProgressionPoint', () => {
    const result = progressionPointSchema.parse({
      date: '2024-03-15',
      weight: 142.5,
      exercise: 'Back Squat',
    });
    expect(result.weight).toBe(142.5);
    expect(result.exercise).toBe('Back Squat');
  });

  it('accepts weight=0 (bodyweight baseline)', () => {
    const result = progressionPointSchema.parse({
      date: '2024-03-15',
      weight: 0,
      exercise: 'Pull-up',
    });
    expect(result.weight).toBe(0);
  });

  it('rejects missing date', () => {
    expect(() =>
      progressionPointSchema.parse({ weight: 100, exercise: 'Squat' }),
    ).toThrow();
  });

  it('rejects negative weight', () => {
    expect(() =>
      progressionPointSchema.parse({ date: '2024-03-15', weight: -5, exercise: 'Squat' }),
    ).toThrow();
  });

  it('rejects empty exercise string', () => {
    expect(() =>
      progressionPointSchema.parse({ date: '2024-03-15', weight: 100, exercise: '' }),
    ).toThrow();
  });

  it('rejects missing exercise', () => {
    expect(() =>
      progressionPointSchema.parse({ date: '2024-03-15', weight: 100 }),
    ).toThrow();
  });
});
