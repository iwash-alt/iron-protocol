import { describe, it, expect } from 'vitest';
import { suggestTags } from '@/shared/utils/exerciseAutoTag';

describe('suggestTags', () => {
  it('returns null fields for empty/short input', () => {
    expect(suggestTags('')).toEqual({ muscle: null, equipment: null, type: null });
    expect(suggestTags('ab')).toEqual({ muscle: null, equipment: null, type: null });
  });

  // ── Muscle detection ──

  it('detects Chest for press exercises', () => {
    expect(suggestTags('Incline Press').muscle).toBe('Chest');
    expect(suggestTags('Bench Press').muscle).toBe('Chest');
    expect(suggestTags('Decline Fly').muscle).toBe('Chest');
  });

  it('detects Back for rows', () => {
    expect(suggestTags('Meadows Row').muscle).toBe('Back');
    expect(suggestTags('Barbell Row').muscle).toBe('Back');
  });

  it('detects Shoulders for shoulder press', () => {
    expect(suggestTags('Overhead Press').muscle).toBe('Shoulders');
    expect(suggestTags('Lateral Raise').muscle).toBe('Shoulders');
  });

  it('detects Quads for squats', () => {
    expect(suggestTags('Front Squat').muscle).toBe('Quads');
    expect(suggestTags('Leg Extension').muscle).toBe('Quads');
  });

  it('detects Biceps for curls', () => {
    expect(suggestTags('Hammer Curl').muscle).toBe('Biceps');
    expect(suggestTags('Preacher Curl').muscle).toBe('Biceps');
  });

  it('detects Triceps for pushdowns', () => {
    expect(suggestTags('Tricep Pushdown').muscle).toBe('Triceps');
  });

  it('detects Core for ab exercises', () => {
    expect(suggestTags('Cable Crunch').muscle).toBe('Core');
    expect(suggestTags('Plank Hold').muscle).toBe('Core');
  });

  // ── Equipment detection ──

  it('detects Dumbbell equipment', () => {
    expect(suggestTags('Dumbbell Bench Press').equipment).toBe('Dumbbell');
  });

  it('detects Cable equipment', () => {
    expect(suggestTags('Cable Fly').equipment).toBe('Cable');
  });

  it('detects Barbell for barbell exercises', () => {
    expect(suggestTags('Barbell Row').equipment).toBe('Barbell');
  });

  it('detects Smith Machine specifically', () => {
    expect(suggestTags('Smith Machine Squat').equipment).toBe('Smith Machine');
  });

  it('detects Bodyweight equipment', () => {
    expect(suggestTags('Push-Up Variation').equipment).toBe('None');
  });

  // ── Type detection ──

  it('detects compound type for presses and squats', () => {
    expect(suggestTags('Overhead Press').type).toBe('compound');
    expect(suggestTags('Front Squat').type).toBe('compound');
  });

  it('detects isolation for curls and raises', () => {
    expect(suggestTags('Cable Lateral Raise').type).toBe('isolation');
  });

  it('detects bodyweight type for bodyweight exercises', () => {
    expect(suggestTags('Push-Up').type).toBe('bodyweight');
  });

  // ── Full auto-tag scenarios (the task verification examples) ──

  it('auto-tags "Incline Press" → Chest', () => {
    const result = suggestTags('Incline Press');
    expect(result.muscle).toBe('Chest');
    expect(result.type).toBe('compound');
  });

  it('auto-tags "Weighted Dip" → Chest / compound', () => {
    const result = suggestTags('Weighted Dip');
    expect(result.muscle).toBe('Chest');
    expect(result.type).toBe('compound');
  });

  it('auto-tags "Cable Lateral Raise" → Shoulders / Cable / isolation', () => {
    const result = suggestTags('Cable Lateral Raise');
    expect(result.muscle).toBe('Shoulders');
    expect(result.equipment).toBe('Cable');
    expect(result.type).toBe('isolation');
  });
});
