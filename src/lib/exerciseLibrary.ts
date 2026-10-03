export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Core' | 'Cardio' | 'Full Body';
  secondaryMuscles: string[];
  equipment: 'Barbell' | 'Dumbbell' | 'Cables' | 'Machine' | 'Bodyweight' | 'Kettlebell' | 'Bands' | 'None';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  instructions: string[];
  tips: string;
}

export const EXERCISE_CATEGORIES: ExerciseItem['muscleGroup'][] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
];

export const EXERCISE_LIBRARY: ExerciseItem[] = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Barbell Flat Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    instructions: [
      'Lie flat on bench with eyes directly below bar.',
      'Grip the bar slightly wider than shoulder-width with wrists straight.',
      'Unrack and lower with control to mid-chest, keeping elbows at ~45-degree angle.',
      'Press explosively back up, contracting the pectorals at the top.',
    ],
    tips: 'Retract your shoulder blades and keep feet firmly planted for full body stability.',
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    instructions: [
      'Set bench to 30-45 degree incline.',
      'Kick dumbbells up to shoulder height and sit back.',
      'Press upward in a natural arc without clacking the weights together.',
      'Lower under control until you feel a deep stretch in the upper pectorals.',
    ],
    tips: 'Avoid too steep of an angle (>45°) which shifts load away from the chest to shoulders.',
  },
  {
    id: 'ex-cable-crossover',
    name: 'Cable Crossover Flyes',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Inner Chest', 'Front Delts'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    instructions: [
      'Set pulleys at shoulder or high position with single D-handles.',
      'Step forward with one foot staggered for balance, slight bend in elbows.',
      'Bring hands together in a sweeping hugging arc.',
      'Squeeze chest at peak contraction for 1 second, then return slowly.',
    ],
    tips: 'Maintain the exact same elbow flexion throughout the movement.',
  },
  {
    id: 'ex-pushups',
    name: 'Standard Push-Ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Core', 'Triceps', 'Delts'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    instructions: [
      'Start in high plank position with hands slightly outside shoulders.',
      'Engage glutes and core so body forms a straight line from heels to head.',
      'Lower chest until 2 inches off floor, keeping elbows tucked ~45 degrees.',
      'Drive through palms to return to starting plank.',
    ],
    tips: 'Do not let your lower back sag; keep core braced throughout.',
  },
  {
    id: 'ex-chest-dips',
    name: 'Parallel Bar Chest Dips',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Delts'],
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 90,
    instructions: [
      'Mount the parallel bars and lock elbows.',
      'Lean torso forward ~30 degrees and flare elbows slightly.',
      'Lower until shoulders are below elbows or comfortable depth.',
      'Press back up, focusing on pushing inward through palms.',
    ],
    tips: 'Leaning forward emphasizes lower chest; remaining upright targets triceps.',
  },

  // BACK
  {
    id: 'ex-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultReps: '5-6',
    defaultRestSeconds: 120,
    instructions: [
      'Stand with midfoot directly under bar, feet hip-width.',
      'Hinge at hips, grip bar just outside knees.',
      'Drop hips until shins touch bar, pull chest up, lock lats.',
      'Drive through floor with legs, extending hips and knees simultaneously.',
    ],
    tips: 'Keep the bar glued close to shins and thighs. Never round your lumbar spine.',
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    instructions: [
      'Sit facing machine, secure thigh pads snugly.',
      'Grip wide overhand bar, lean back very slightly (10-15 degrees).',
      'Drive elbows down and back towards your hip pockets.',
      'Touch upper chest, hold for 1 second, and control the ascent.',
    ],
    tips: 'Initiate by pulling shoulder blades down before bending the elbows.',
  },
  {
    id: 'ex-bent-over-row',
    name: 'Barbell Bent-Over Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Rhomboids', 'Lats', 'Biceps', 'Lower Back'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    instructions: [
      'Hold bar overhand, hinge hips back until torso is ~45 degrees.',
      'Keep back flat, knees softly bent.',
      'Pull bar to lower sternum/belly button, driving elbows back.',
      'Squeeze scapulae together at top, then lower with control.',
    ],
    tips: 'Keep neck neutral looking 3-4 feet ahead, not straight up at a mirror.',
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Lats', 'Rhomboids', 'Biceps'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    instructions: [
      'Sit with knees slightly bent, feet on footplates.',
      'Grip V-bar handle, keep spine tall and upright.',
      'Pull handle into abdomen, squeezing shoulder blades together.',
      'Extend arms slowly under resistance without leaning excessively forward.',
    ],
    tips: 'Avoid rocking back and forth with momentum; isolate the mid-back.',
  },
  {
    id: 'ex-pullups',
    name: 'Bodyweight Pull-Ups',
    muscleGroup: 'Back',
    secondaryMuscles: ['Lats', 'Biceps', 'Forearms'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '6-10',
    defaultRestSeconds: 90,
    instructions: [
      'Hang from bar with hands slightly wider than shoulders, palms facing away.',
      'Depress scapulae, pull chin over the bar.',
      'Pause briefly, then lower with control to full dead hang.',
    ],
    tips: 'Cross feet behind you and engage abs to prevent swinging.',
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Standing Barbell Overhead Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSeconds: 90,
    instructions: [
      'Rack bar at collarbone height. Grip slightly outside shoulders.',
      'Tighten glutes, quads, and abs.',
      'Press straight overhead, tilting head back slightly to clear chin.',
      'Push head forward through the window once bar passes forehead.',
    ],
    tips: 'Lock out overhead with bar stacked directly over shoulders and midfoot.',
  },
  {
    id: 'ex-lateral-raises',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Lateral Delts', 'Traps'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    instructions: [
      'Stand with dumbbells at sides, slight forward torso tilt.',
      'Lead with elbows, raising arms out to sides until parallel to floor.',
      'Pour water slightly with pinkies at the top for maximum side-delt activation.',
      'Lower slowly over 2 seconds.',
    ],
    tips: 'Use moderate weight. Heavy swinging uses traps rather than lateral deltoids.',
  },
  {
    id: 'ex-face-pulls',
    name: 'Cable Face Pulls',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Rear Delts', 'Rotator Cuff', 'Rhomboids'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    instructions: [
      'Attach rope to cable pulley set at eye level.',
      'Grip rope ends with thumbs pointing backwards.',
      'Pull rope towards bridge of nose while externally rotating hands back.',
      'Squeeze rear shoulders and hold for 1 second.',
    ],
    tips: 'Crucial exercise for counteracting student desk slouch and posture.',
  },
  {
    id: 'ex-dumbbell-arnold-press',
    name: 'Seated Arnold Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Front Delts', 'Side Delts', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    instructions: [
      'Sit upright on bench holding dumbbells at chest height, palms facing you.',
      'As you press upward, rotate wrists 180 degrees until palms face forward at top.',
      'Reverse rotation smoothly as you lower back to chin.',
    ],
    tips: 'Offers complete 360-degree shoulder recruitment.',
  },

  // LEGS
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSeconds: 120,
    instructions: [
      'Rest bar comfortably on upper traps, step back into shoulder-width stance.',
      'Take a deep belly breath, brace core tight.',
      'Break at hips and knees together, descending until thighs are parallel or below.',
      'Drive aggressively through midfoot and heels back to standing.',
    ],
    tips: 'Keep knees tracking in line with your second toe. Do not collapse knees inward.',
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    instructions: [
      'Hold bar at thighs with knees soft but fixed in place.',
      'Push hips back horizontally as if closing a car door with your glutes.',
      'Lower bar along thighs and shins until deep hamstring stretch is felt.',
      'Drive hips forward to return to standing position.',
    ],
    tips: 'Keep spine completely neutral; movement is a hip hinge, not a squat.',
  },
  {
    id: 'ex-leg-press',
    name: '45-Degree Leg Press',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quads', 'Glutes'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 90,
    instructions: [
      'Sit comfortably with back and head flat against pads.',
      'Place feet shoulder-width on sled platform.',
      'Release safety handles and lower sled until knees form 90-degree angle.',
      'Press through full foot back up, stopping just short of locking knees.',
    ],
    tips: 'Never allow lower back or tailbone to round off the seat pad.',
  },
  {
    id: 'ex-walking-lunges',
    name: 'Dumbbell Walking Lunges',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Quads', 'Glutes', 'Calves', 'Balance'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '12 per leg',
    defaultRestSeconds: 75,
    instructions: [
      'Hold dumbbells by sides, step forward with right leg.',
      'Lower back knee until it hovers 1 inch above floor.',
      'Push through right heel to step forward directly into next stride.',
    ],
    tips: 'Keep torso upright and proud. Do not let lead knee drift wildly past toes.',
  },
  {
    id: 'ex-standing-calf-raises',
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Gastrocnemius', 'Soleus'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    instructions: [
      'Place balls of feet on platform ledge, heels hanging off.',
      'Lower heels for a deep 2-second calf stretch.',
      'Explode upward onto tiptoes, holding peak contraction for 1 second.',
    ],
    tips: 'Calves respond best to full range of motion and deliberate pauses.',
  },

  // BICEPS
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Biceps Curl',
    muscleGroup: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    instructions: [
      'Hold bar with palms forward, elbows pinned to sides.',
      'Curl bar up toward shoulders without swinging hips or elbows.',
      'Squeeze biceps at the top, lower slowly back to full extension.',
    ],
    tips: 'Keep elbows tucked at your sides to isolate biceps and eliminate shoulder cheat.',
  },
  {
    id: 'ex-incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    muscleGroup: 'Biceps',
    secondaryMuscles: ['Biceps Long Head'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    instructions: [
      'Sit on 45-60 degree incline bench, letting arms hang straight down.',
      'Curl dumbbells up while keeping elbows behind torso.',
      'Supinate wrists at top for maximum contraction.',
      'Lower slowly over 2 seconds to full stretch.',
    ],
    tips: 'Provides tremendous stretch on the long head of the bicep.',
  },
  {
    id: 'ex-hammer-curls',
    name: 'Dumbbell Hammer Curls',
    muscleGroup: 'Biceps',
    secondaryMuscles: ['Brachioradialis', 'Brachialis'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    instructions: [
      'Stand holding dumbbells with neutral grip (palms facing each other).',
      'Curl weights upward without rotating wrists.',
      'Squeeze forearms and outer arm peak at top.',
    ],
    tips: 'Builds arm thickness and forearm grip strength.',
  },

  // TRICEPS
  {
    id: 'ex-tricep-pushdown',
    name: 'Cable Rope Tricep Pushdown',
    muscleGroup: 'Triceps',
    secondaryMuscles: ['Triceps Lateral Head'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    instructions: [
      'Stand before cable pulley with rope attachment at high height.',
      'Pin elbows to sides, press rope downwards.',
      'Spread rope tips apart at bottom for peak triceps squeeze.',
      'Let hands return to 90 degrees under control.',
    ],
    tips: 'Only forearms should move; keep upper arms locked in place.',
  },
  {
    id: 'ex-skull-crushers',
    name: 'Lying EZ-Bar Skull Crushers',
    muscleGroup: 'Triceps',
    secondaryMuscles: ['Triceps Long Head'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    instructions: [
      'Lie on flat bench holding EZ bar with narrow overhand grip.',
      'Angle upper arms slightly back past vertical toward head.',
      'Hinge at elbows to lower bar toward hairline/forehead.',
      'Extend elbows back up, flexing triceps at top.',
    ],
    tips: 'Angle arms slightly backward to keep continuous tension on triceps at lockout.',
  },
  {
    id: 'ex-overhead-tricep-extension',
    name: 'Seated Dumbbell Overhead Tricep Extension',
    muscleGroup: 'Triceps',
    secondaryMuscles: ['Triceps Long Head'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    instructions: [
      'Sit on low-back bench, cup dumbbell under inner top plates with both hands.',
      'Press dumbbell overhead with arms fully extended.',
      'Bend elbows behind head until forearms are below horizontal.',
      'Drive dumbbell back overhead.',
    ],
    tips: 'Keep elbows pointing forward as much as possible, not excessively flared out.',
  },

  // CORE
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Knee & Leg Raises',
    muscleGroup: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Lower Abs', 'Grip'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    instructions: [
      'Hang from pull-up bar with overhand grip.',
      'Curl pelvis up, lifting knees or straight legs toward chest.',
      'Hold at top for half second, lower slowly without swinging.',
    ],
    tips: 'Focus on curling the hips forward rather than just swinging the legs.',
  },
  {
    id: 'ex-plank',
    name: 'Forearm Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Transverse Abdominis', 'Glutes', 'Shoulders'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: '45-60s hold',
    defaultRestSeconds: 60,
    instructions: [
      'Rest on forearms with elbows directly under shoulders.',
      'Extend legs back, tuck pelvis, squeeze glutes and abs.',
      'Maintain flat horizontal line from head to heels.',
    ],
    tips: 'Pull elbows toward toes isometrically to amplify core tension.',
  },
  {
    id: 'ex-cable-woodchopper',
    name: 'Cable Oblique Woodchopper',
    muscleGroup: 'Core',
    secondaryMuscles: ['Obliques', 'Rotational Core'],
    equipment: 'Cables',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '12 per side',
    defaultRestSeconds: 60,
    instructions: [
      'Set cable handle high. Stand sideways with arms extended.',
      'Rotate torso downward diagonally across body toward opposite knee.',
      'Pivot back foot as you twist, then return under control.',
    ],
    tips: 'Power the twist from your core and hips, not arms alone.',
  },

  // CARDIO
  {
    id: 'ex-treadmill-incline',
    name: 'Treadmill Incline Ruck Walk',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Calves', 'Glutes', 'Cardiovascular System'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    defaultSets: 1,
    defaultReps: '20-30 min',
    defaultRestSeconds: 0,
    instructions: [
      'Set incline to 10-12% and speed to 4.5-5.5 km/h.',
      'Walk with upright posture without holding onto rails.',
      'Maintain steady breathing rhythm in Zone 2 aerobic threshold.',
    ],
    tips: 'Zero joint impact while providing outstanding caloric burn and stamina.',
  },
  {
    id: 'ex-rowing-intervals',
    name: 'Concept2 Rowing Ergometer Intervals',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Full Body', 'Lats', 'Legs', 'Heart'],
    equipment: 'Machine',
    difficulty: 'Intermediate',
    defaultSets: 5,
    defaultReps: '500m sprint / 60s rest',
    defaultRestSeconds: 60,
    instructions: [
      'Strap feet securely into pedals.',
      'Drive with legs first, lean back slightly, then pull handle to ribs.',
      'Reverse in sequence: arms forward, hinge hips, slide knees.',
    ],
    tips: 'Power generation is 60% legs, 20% core, and 20% arms.',
  },
  {
    id: 'ex-jump-rope',
    name: 'Speed Jump Rope',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Calves', 'Coordination', 'Shoulders'],
    equipment: 'None',
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultReps: '2 min rounds',
    defaultRestSeconds: 45,
    instructions: [
      'Hold handles with elbows tucked close to hips.',
      'Rotate rope using wrist snaps rather than full arm circles.',
      'Jump just high enough for rope to pass under (1-2 inches).',
    ],
    tips: 'Stay light on the balls of your feet with knees softly sprung.',
  },

  // FULL BODY
  {
    id: 'ex-kettlebell-swing',
    name: 'Russian Kettlebell Swing',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lats', 'Core'],
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    instructions: [
      'Stand with feet shoulder-width, kettlebell 1 foot in front.',
      'Hike kettlebell back between legs with high hip hinge.',
      'Snap hips forward violently, swinging kettlebell to chest height.',
      'Guide kettlebell back into the hinge without squatting.',
    ],
    tips: 'The bell moves from hip snap energy, not by lifting with your arms.',
  },
  {
    id: 'ex-clean-and-press',
    name: 'Dumbbell Clean and Press',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Shoulders', 'Traps', 'Legs', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    instructions: [
      'Hold dumbbells at sides, hinge hips back.',
      'Explode upward, shrugging weights and catching them at shoulders.',
      'Immediately dip knees slightly and press weights overhead.',
      'Lower under control to hips.',
    ],
    tips: 'Combines dynamic power, coordination, and upper-body pressing.',
  },
];

export function getExercises(filter?: {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  query?: string;
}): ExerciseItem[] {
  let list = [...EXERCISE_LIBRARY];

  if (filter?.muscleGroup && filter.muscleGroup !== 'All') {
    list = list.filter((e) => e.muscleGroup.toLowerCase() === filter.muscleGroup!.toLowerCase());
  }

  if (filter?.equipment && filter.equipment !== 'All') {
    list = list.filter((e) => e.equipment.toLowerCase() === filter.equipment!.toLowerCase());
  }

  if (filter?.difficulty && filter.difficulty !== 'All') {
    list = list.filter((e) => e.difficulty.toLowerCase() === filter.difficulty!.toLowerCase());
  }

  if (filter?.query && filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup.toLowerCase().includes(q) ||
        e.secondaryMuscles.some((m) => m.toLowerCase().includes(q)) ||
        e.equipment.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getExerciseById(id: string): ExerciseItem | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

export function getExercisesByMuscleGroup(group: string): ExerciseItem[] {
  return EXERCISE_LIBRARY.filter((e) => e.muscleGroup.toLowerCase() === group.toLowerCase());
}
