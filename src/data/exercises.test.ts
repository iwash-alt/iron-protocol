import { filterExercises, exercises } from './exercises';

describe('filterExercises', () => {
  describe('equipment filter', () => {
    it('filters Barbell exercises (includes Bar equipment)', () => {
      const results = filterExercises({ equipment: 'Barbell' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Barbell', 'Bar']).toContain(ex.equipment);
      });
    });

    it('filters Dumbbell exercises (includes Dumbbells equipment)', () => {
      const results = filterExercises({ equipment: 'Dumbbell' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Dumbbell', 'Dumbbells']).toContain(ex.equipment);
      });
    });

    it('filters Machine exercises (includes all machine variants)', () => {
      const results = filterExercises({ equipment: 'Machine' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.equipment.toLowerCase()).toContain('machine');
      });
    });

    it('filters Bodyweight exercises (includes None equipment)', () => {
      const results = filterExercises({ equipment: 'Bodyweight' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Bodyweight', 'None']).toContain(ex.equipment);
      });
    });

    it('filters Band exercises (includes Resistance Band)', () => {
      const results = filterExercises({ equipment: 'Band' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Band', 'Resistance Band']).toContain(ex.equipment);
      });
    });

    it('filters Cable exercises', () => {
      const results = filterExercises({ equipment: 'Cable' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.equipment).toBe('Cable');
      });
    });

    it('filters EZ Bar exercises', () => {
      const results = filterExercises({ equipment: 'EZ Bar' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.equipment).toBe('EZ Bar');
      });
    });

    it('returns all exercises when equipment is All', () => {
      const results = filterExercises({ equipment: 'All' });
      expect(results.length).toBe(exercises.length);
    });
  });

  describe('muscle filter', () => {
    it('filters Back exercises (includes Lats)', () => {
      const results = filterExercises({ muscle: 'Back' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Back', 'Lats']).toContain(ex.muscle);
      });
      // Verify Lats are actually included
      const latExercises = results.filter(ex => ex.muscle === 'Lats');
      expect(latExercises.length).toBeGreaterThan(0);
    });

    it('filters Shoulders exercises (includes Rear Delts)', () => {
      const results = filterExercises({ muscle: 'Shoulders' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(['Shoulders', 'Rear Delts']).toContain(ex.muscle);
      });
      // Verify Rear Delts are actually included
      const rearDeltExercises = results.filter(ex => ex.muscle === 'Rear Delts');
      expect(rearDeltExercises.length).toBeGreaterThan(0);
    });

    it('filters Chest exercises', () => {
      const results = filterExercises({ muscle: 'Chest' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.muscle).toBe('Chest');
      });
    });

    it('returns all exercises when muscle is All', () => {
      const results = filterExercises({ muscle: 'All' });
      expect(results.length).toBe(exercises.length);
    });
  });

  describe('AND logic (equipment + muscle)', () => {
    it('filters Cable + Back exercises', () => {
      const results = filterExercises({ equipment: 'Cable', muscle: 'Back' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.equipment).toBe('Cable');
        expect(['Back', 'Lats']).toContain(ex.muscle);
      });
    });

    it('returns empty for impossible combination', () => {
      const results = filterExercises({ equipment: 'EZ Bar', muscle: 'Calves' });
      expect(results).toHaveLength(0);
    });
  });

  describe('search + filter', () => {
    it('combines search with equipment filter', () => {
      const results = filterExercises({ search: 'bench', equipment: 'Barbell' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.name.toLowerCase()).toContain('bench');
        expect(['Barbell', 'Bar']).toContain(ex.equipment);
      });
    });

    it('combines search with muscle filter', () => {
      const results = filterExercises({ search: 'curl', muscle: 'Biceps' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.name.toLowerCase()).toContain('curl');
        expect(ex.muscle).toBe('Biceps');
      });
    });

    it('combines search with both filters', () => {
      const results = filterExercises({ search: 'press', equipment: 'Barbell', muscle: 'Chest' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(ex => {
        expect(ex.name.toLowerCase()).toContain('press');
        expect(['Barbell', 'Bar']).toContain(ex.equipment);
        expect(ex.muscle).toBe('Chest');
      });
    });
  });

  describe('no filters', () => {
    it('returns all exercises when no filters applied', () => {
      const results = filterExercises({});
      expect(results.length).toBe(exercises.length);
    });
  });
});
