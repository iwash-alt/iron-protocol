export const FRONT_MUSCLE_PATHS: Record<string, string> = {
  chest: 'M50 42 C60 36 72 36 82 42 L82 60 C72 66 60 66 50 60 Z',
  front_delts: 'M38 44 C44 38 48 44 48 52 C46 60 40 60 36 54 Z M84 52 C84 44 88 38 94 44 L96 54 C92 60 86 60 84 52 Z',
  biceps: 'M34 56 C38 52 44 56 44 66 C42 74 36 76 32 70 Z M88 66 C88 56 94 52 98 56 L100 70 C96 76 90 74 88 66 Z',
  forearms: 'M30 72 C34 68 38 70 38 82 C36 90 30 90 26 84 Z M94 82 C94 70 98 68 102 72 L106 84 C102 90 96 90 94 82 Z',
  abs: 'M56 66 L76 66 L80 98 L52 98 Z',
  obliques: 'M46 66 L54 68 L50 100 L40 92 Z M78 68 L86 66 L92 92 L82 100 Z',
  quadriceps: 'M52 102 L66 102 L66 142 L50 142 Z M68 102 L82 102 L84 142 L68 142 Z',
  hip_flexors: 'M54 96 L66 96 L66 106 L52 106 Z M68 96 L80 96 L82 106 L68 106 Z',
  tibialis: 'M56 142 L66 142 L64 174 L54 174 Z M70 142 L80 142 L82 174 L72 174 Z',
};

export const BACK_MUSCLE_PATHS: Record<string, string> = {
  traps: 'M54 36 L78 36 L84 54 L48 54 Z',
  rear_delts: 'M36 48 C42 40 50 46 48 56 C44 62 38 60 34 54 Z M84 56 C82 46 90 40 96 48 L98 54 C94 60 88 62 84 56 Z',
  lats: 'M44 56 L56 56 L52 102 L38 96 Z M78 56 L90 56 L96 96 L82 102 Z',
  rhomboids: 'M58 54 L74 54 L72 80 L60 80 Z',
  lower_back: 'M58 82 L74 82 L76 112 L56 112 Z',
  triceps: 'M34 58 L44 58 L42 84 L32 84 Z M88 58 L98 58 L100 84 L90 84 Z',
  glutes: 'M52 108 L66 108 L66 126 L50 126 Z M68 108 L82 108 L84 126 L68 126 Z',
  hamstrings: 'M52 126 L66 126 L64 158 L50 158 Z M68 126 L82 126 L84 158 L70 158 Z',
  calves: 'M54 158 L64 158 L66 178 L56 178 Z M72 158 L82 158 L80 178 L70 178 Z',
};

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Pectorals', front_delts: 'Front Deltoids', biceps: 'Biceps', forearms: 'Forearms', abs: 'Rectus Abdominis', obliques: 'Obliques', quadriceps: 'Quadriceps', hip_flexors: 'Hip Flexors', tibialis: 'Tibialis',
  traps: 'Trapezius', rear_delts: 'Rear Deltoids', lats: 'Lats', rhomboids: 'Rhomboids', lower_back: 'Lower Back', triceps: 'Triceps', glutes: 'Glutes', hamstrings: 'Hamstrings', calves: 'Calves',
};
