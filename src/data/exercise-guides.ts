export interface ExerciseGuide {
  /** Primary and secondary muscles worked */
  muscles: string[];
  /** 2-3 evidence-based form cues */
  cues: string[];
  /** 1-2 common mistakes to avoid */
  mistakes: string[];
}

/** Keyed by exercise name (must match Exercise.name exactly) */
export const exerciseGuides: Record<string, ExerciseGuide> = {
  // ── Chest ──────────────────────────────────────────────────────────

  'Barbell Bench Press': {
    muscles: ['Chest', 'Front Delts', 'Triceps'],
    cues: [
      'Retract shoulder blades before unracking',
      'Lower bar to mid-chest, elbows at 45°',
      'Drive feet into floor, squeeze glutes',
    ],
    mistakes: [
      'Flaring elbows to 90° (shoulder injury risk)',
      'Bouncing bar off chest (removes tension, rib injury risk)',
    ],
  },

  'Push Ups': {
    muscles: ['Chest', 'Front Delts', 'Triceps', 'Serratus Anterior'],
    cues: [
      'Hands shoulder-width apart, fingers spread',
      'Keep body in a straight line from head to heels',
      'Lower until chest nearly touches floor, elbows at 45°',
    ],
    mistakes: [
      'Sagging hips (lumbar hyperextension, lower back strain)',
      'Flaring elbows straight out (shoulder impingement risk)',
    ],
  },

  'Diamond Push Ups': {
    muscles: ['Triceps', 'Inner Chest', 'Front Delts'],
    cues: [
      'Form a diamond shape with thumbs and index fingers',
      'Keep elbows tucked close to torso throughout',
      'Lower chest to hands, pause briefly at bottom',
    ],
    mistakes: [
      'Placing hands too far forward (shifts load off triceps)',
      'Letting elbows flare wide (defeats triceps emphasis)',
    ],
  },

  'Incline Push Ups': {
    muscles: ['Lower Chest', 'Front Delts', 'Triceps'],
    cues: [
      'Place hands on elevated surface at shoulder width',
      'Maintain rigid plank from head to heels',
      'Lower chest to edge of surface, press back explosively',
    ],
    mistakes: [
      'Hips sagging below shoulder line (lower back stress)',
      'Using a surface that is unstable (fall and wrist injury risk)',
    ],
  },

  // ── Shoulders ──────────────────────────────────────────────────────

  'Overhead Press': {
    muscles: ['Front Delts', 'Lateral Delts', 'Triceps', 'Upper Chest', 'Serratus Anterior'],
    cues: [
      'Brace core hard, squeeze glutes to protect lumbar spine',
      'Press bar in a slight arc around the face, lock out overhead',
      'Shrug traps at the top to clear the shoulder joint',
    ],
    mistakes: [
      'Excessive lumbar arch (spinal compression, herniation risk)',
      'Pressing the bar forward of midfoot (inefficient lever, shoulder strain)',
    ],
  },

  'Pike Push Ups': {
    muscles: ['Front Delts', 'Lateral Delts', 'Triceps', 'Upper Chest'],
    cues: [
      'Set up in a high pike with hips as high as possible',
      'Lower the top of your head toward the floor between hands',
      'Keep elbows tracking at roughly 45° from torso',
    ],
    mistakes: [
      'Insufficient hip angle (turns it into a regular push up)',
      'Letting head drift forward past hands (excess neck/shoulder stress)',
    ],
  },

  'Lateral Raises': {
    muscles: ['Lateral Delts', 'Upper Traps', 'Supraspinatus'],
    cues: [
      'Lead with elbows, slight bend in arms throughout',
      'Raise to shoulder height — no higher — with thumbs neutral or slightly down',
      'Control the eccentric for 2-3 seconds on every rep',
    ],
    mistakes: [
      'Using momentum or swinging torso (reduces delt activation)',
      'Raising above shoulder height with internal rotation (subacromial impingement risk)',
    ],
  },

  // ── Triceps ────────────────────────────────────────────────────────

  'Tricep Pushdown': {
    muscles: ['Triceps (all three heads)', 'Anconeus'],
    cues: [
      'Pin elbows to sides, only forearms move',
      'Squeeze triceps hard at full lockout',
      'Control the negative — 2 seconds up minimum',
    ],
    mistakes: [
      'Leaning over the bar and using bodyweight (reduces isolation)',
      'Letting elbows drift forward (shifts load to shoulders)',
    ],
  },

  'Tricep Dips': {
    muscles: ['Triceps', 'Lower Chest', 'Front Delts'],
    cues: [
      'Keep torso upright to emphasize triceps over chest',
      'Lower until upper arm is parallel to floor, no deeper',
      'Lock out fully at the top, squeezing triceps',
    ],
    mistakes: [
      'Going too deep (anterior shoulder capsule strain)',
      'Flaring elbows outward (shifts stress to shoulder joint)',
    ],
  },

  // ── Back ───────────────────────────────────────────────────────────

  'Deadlift': {
    muscles: ['Spinal Erectors', 'Glutes', 'Hamstrings', 'Lats', 'Traps', 'Forearms'],
    cues: [
      'Bar over mid-foot, shins touch bar, wedge hips into position',
      'Brace hard, push the floor away rather than pulling the bar up',
      'Lock out with glutes — do not hyperextend the lumbar spine',
    ],
    mistakes: [
      'Rounding the lower back under load (disc herniation risk)',
      'Jerking the bar off the floor (bicep tear risk, loss of back tightness)',
    ],
  },

  'Pull Ups': {
    muscles: ['Lats', 'Biceps', 'Lower Traps', 'Rhomboids', 'Rear Delts', 'Forearms'],
    cues: [
      'Start from a dead hang, depress and retract scapulae to initiate',
      'Drive elbows down and back, chin over bar',
      'Lower under control to full extension each rep',
    ],
    mistakes: [
      'Kipping or swinging (reduces muscle stimulus, shoulder injury risk)',
      'Half reps — not reaching full hang (limits lat stretch and growth)',
    ],
  },

  'Inverted Rows': {
    muscles: ['Mid Traps', 'Rhomboids', 'Lats', 'Rear Delts', 'Biceps'],
    cues: [
      'Set bar at hip height, hang underneath with body straight',
      'Pull chest to bar, squeezing shoulder blades together at top',
      'Keep hips extended — no sagging or piking',
    ],
    mistakes: [
      'Letting hips sag (reduces core engagement, lower back stress)',
      'Shrugging shoulders toward ears (upper trap dominance, less rhomboid work)',
    ],
  },

  'Barbell Row': {
    muscles: ['Lats', 'Mid Traps', 'Rhomboids', 'Rear Delts', 'Biceps', 'Spinal Erectors'],
    cues: [
      'Hinge at hips to ~45°, brace core, maintain neutral spine',
      'Pull bar to lower ribcage, drive elbows behind you',
      'Squeeze shoulder blades for one second at peak contraction',
    ],
    mistakes: [
      'Excessive torso rise/body English (turns it into a cheat curl, lower back risk)',
      'Pulling bar to waist instead of lower ribs (shifts load to upper traps)',
    ],
  },

  'Lat Pulldown': {
    muscles: ['Lats', 'Teres Major', 'Biceps', 'Lower Traps', 'Rhomboids'],
    cues: [
      'Grip just outside shoulder width, lean back slightly',
      'Pull bar to upper chest, driving elbows down and into your sides',
      'Control the return — let lats stretch fully at the top',
    ],
    mistakes: [
      'Pulling bar behind the neck (shoulder impingement and cervical spine risk)',
      'Using excessive momentum / leaning too far back (reduces lat isolation)',
    ],
  },

  'Face Pulls': {
    muscles: ['Rear Delts', 'Mid Traps', 'Rhomboids', 'External Rotators'],
    cues: [
      'Set cable at upper-chest to face height, use rope attachment',
      'Pull toward forehead, separating rope ends past ears',
      'Externally rotate at the end — finish with a double-bicep pose',
    ],
    mistakes: [
      'Using too much weight (recruits upper traps, defeats rotator cuff work)',
      'Pulling to the chin or neck instead of forehead (less external rotation)',
    ],
  },

  // ── Biceps ─────────────────────────────────────────────────────────

  'Barbell Curl': {
    muscles: ['Biceps (long and short head)', 'Brachialis', 'Forearms'],
    cues: [
      'Pin elbows at your sides, curl with a controlled tempo',
      'Supinate fully and squeeze hard at the top',
      'Lower on a 2-3 second eccentric, do not let the bar drop',
    ],
    mistakes: [
      'Swinging torso to heave weight up (reduces bicep stimulus, lower back risk)',
      'Cutting range of motion short at the bottom (limits long head stretch)',
    ],
  },

  // ── Quads / Lower Body ─────────────────────────────────────────────

  'Squat': {
    muscles: ['Quads', 'Glutes', 'Adductors', 'Spinal Erectors', 'Core'],
    cues: [
      'Bar on upper traps, brace core, break at hips and knees simultaneously',
      'Knees track over toes, descend to at least parallel',
      'Drive up by pushing floor away, keep chest tall',
    ],
    mistakes: [
      'Knees caving inward (ACL/meniscus risk, especially under load)',
      'Excessive forward lean / "good-morning" squat (overloads lower back)',
    ],
  },

  'Bodyweight Squats': {
    muscles: ['Quads', 'Glutes', 'Adductors', 'Core'],
    cues: [
      'Feet shoulder-width apart, toes turned out 15-30°',
      'Sit hips back and down, keep weight in mid-foot to heels',
      'Descend until hip crease is below knee, arms forward for balance',
    ],
    mistakes: [
      'Heels rising off the floor (poor ankle mobility, knee shear stress)',
      'Rounding lower back at the bottom (disc stress under fatigue)',
    ],
  },

  'Jump Squats': {
    muscles: ['Quads', 'Glutes', 'Calves', 'Hamstrings', 'Core'],
    cues: [
      'Descend into a quarter to half squat, then explode upward',
      'Swing arms to generate momentum, fully extend hips at takeoff',
      'Land softly on mid-foot with bent knees to absorb force',
    ],
    mistakes: [
      'Landing with straight legs (extreme joint impact on knees and ankles)',
      'Landing on toes only (Achilles overload, ankle sprain risk)',
    ],
  },

  'Lunges': {
    muscles: ['Quads', 'Glutes', 'Hamstrings', 'Adductors', 'Core'],
    cues: [
      'Take a long enough step that both knees reach ~90° at the bottom',
      'Keep torso upright, front knee tracking over second toe',
      'Push through the heel of the front foot to return to standing',
    ],
    mistakes: [
      'Front knee shooting past toes with heel rising (patellar tendon overload)',
      'Narrow stance width causing balance issues (hip adductor strain risk)',
    ],
  },

  'Bulgarian Split Squat': {
    muscles: ['Quads', 'Glutes', 'Hamstrings', 'Hip Flexors (rear leg stretch)', 'Core'],
    cues: [
      'Rear foot laces-down on bench, most weight on front leg',
      'Descend until rear knee nearly touches floor, front shin near vertical',
      'Drive up through front heel, squeeze glute at the top',
    ],
    mistakes: [
      'Standing too close to bench (knee travels excessively forward, patellar stress)',
      'Leaning torso far forward (shifts emphasis away from quads, lower back load)',
    ],
  },

  'Leg Press': {
    muscles: ['Quads', 'Glutes', 'Hamstrings', 'Adductors'],
    cues: [
      'Place feet shoulder-width on platform, mid to upper position',
      'Lower sled until knees reach 90°, keep lower back pressed into pad',
      'Press through full foot, do not lock knees at the top',
    ],
    mistakes: [
      'Letting lower back round off the pad ("butt wink") at depth (lumbar disc risk)',
      'Locking knees fully at the top (hyperextension injury risk)',
    ],
  },

  // ── Hamstrings ─────────────────────────────────────────────────────

  'Romanian Deadlift': {
    muscles: ['Hamstrings', 'Glutes', 'Spinal Erectors', 'Lats (isometric)'],
    cues: [
      'Soft knee bend, hinge at hips pushing them straight back',
      'Keep bar dragging along thighs, feel deep hamstring stretch',
      'Drive hips forward to stand, squeeze glutes at lockout',
    ],
    mistakes: [
      'Rounding the lower back (disc injury risk under load)',
      'Bending knees too much (turns it into a conventional deadlift, less hamstring emphasis)',
    ],
  },

  // ── Glutes ─────────────────────────────────────────────────────────

  'Glute Bridge': {
    muscles: ['Glutes', 'Hamstrings', 'Core'],
    cues: [
      'Feet flat, knees bent ~90°, drive through heels',
      'Squeeze glutes hard at the top, hold for 1-2 seconds',
      'Maintain posterior pelvic tilt — do not hyperextend the lumbar spine',
    ],
    mistakes: [
      'Pushing through toes instead of heels (hamstring dominance, less glute activation)',
      'Overarching lower back at the top (lumbar compression instead of glute contraction)',
    ],
  },

  // ── Calves ─────────────────────────────────────────────────────────

  'Calf Raises': {
    muscles: ['Gastrocnemius', 'Soleus'],
    cues: [
      'Rise onto balls of feet, pause and squeeze at peak contraction',
      'Lower slowly past neutral for a full stretch at the bottom',
      'Keep knees straight to target gastrocnemius (bend slightly for soleus emphasis)',
    ],
    mistakes: [
      'Bouncing at the bottom (Achilles tendon overload, reduces time under tension)',
      'Cutting range of motion short (calves respond best to full ROM)',
    ],
  },

  // ── Core ───────────────────────────────────────────────────────────

  'Plank': {
    muscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Obliques', 'Spinal Erectors', 'Glutes'],
    cues: [
      'Elbows under shoulders, forearms parallel, fists or palms flat',
      'Brace core as if about to be punched, squeeze glutes',
      'Maintain straight line from head to heels — no sagging or piking',
    ],
    mistakes: [
      'Hips sagging toward the floor (lumbar hyperextension, lower back pain)',
      'Holding breath (increases blood pressure; breathe steadily throughout)',
    ],
  },

  'Mountain Climbers': {
    muscles: ['Core', 'Hip Flexors', 'Shoulders (isometric)', 'Quads'],
    cues: [
      'Start in a high plank position, hands under shoulders',
      'Drive one knee toward chest, then switch rapidly',
      'Keep hips level and core braced — minimize bounce',
    ],
    mistakes: [
      'Letting hips pike up high (reduces core demand, less effective)',
      'Bouncing the upper body (wastes energy, increases shoulder fatigue)',
    ],
  },

  'Bicycle Crunches': {
    muscles: ['Obliques', 'Rectus Abdominis', 'Hip Flexors'],
    cues: [
      'Hands lightly behind head, lift shoulder blades off floor',
      'Rotate torso to bring elbow toward opposite knee',
      'Fully extend the straight leg, keep it off the ground',
    ],
    mistakes: [
      'Pulling on the neck with hands (cervical spine strain)',
      'Moving only the elbows instead of rotating the ribcage (reduces oblique activation)',
    ],
  },

  // ── Full Body / Cardio ─────────────────────────────────────────────

  'Burpees': {
    muscles: ['Chest', 'Shoulders', 'Triceps', 'Quads', 'Hip Flexors', 'Core'],
    cues: [
      'Squat down, place hands on floor, jump feet back to plank',
      'Perform a push up, then jump feet forward to hands',
      'Explode upward into a jump, reach arms overhead',
    ],
    mistakes: [
      'Skipping the push up or not reaching full plank (less upper body stimulus)',
      'Landing with a rounded back on the jump-back (lower back strain risk)',
    ],
  },

  'High Knees': {
    muscles: ['Hip Flexors', 'Quads', 'Calves', 'Core'],
    cues: [
      'Drive knees to hip height alternately at a fast pace',
      'Stay on balls of feet, pump arms opposite to legs',
      'Keep torso tall and core engaged throughout',
    ],
    mistakes: [
      'Leaning too far back (reduces hip flexor engagement, lower back strain)',
      'Knees not reaching hip height (diminishes cardio and muscular benefit)',
    ],
  },
};
