
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  name: 'name',
  avatar: 'avatar',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  college: 'college',
  collegeId: 'collegeId',
  branchId: 'branchId',
  regulation: 'regulation',
  degree: 'degree',
  stream: 'stream',
  streamCode: 'streamCode',
  specialization: 'specialization',
  year: 'year',
  semester: 'semester',
  cgpa: 'cgpa',
  streakDays: 'streakDays',
  modulesVerified: 'modulesVerified',
  totalModules: 'totalModules',
  hoursPacedWeek: 'hoursPacedWeek',
  focusScore: 'focusScore',
  reelsToday: 'reelsToday',
  reelThreshold: 'reelThreshold',
  doomscrollMins: 'doomscrollMins',
  doomscrollCap: 'doomscrollCap',
  careerGoal: 'careerGoal',
  bio: 'bio',
  onboardingCompleted: 'onboardingCompleted',
  onboardingStep: 'onboardingStep',
  academicGoals: 'academicGoals',
  targetCgpa: 'targetCgpa',
  studyDuration: 'studyDuration',
  preferredStudyTime: 'preferredStudyTime',
  studyStyle: 'studyStyle',
  dailyStudyGoal: 'dailyStudyGoal',
  interests: 'interests',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubjectScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  streamCode: 'streamCode',
  credits: 'credits',
  semester: 'semester',
  instructor: 'instructor',
  room: 'room',
  attendanceRate: 'attendanceRate',
  safeMissesLeft: 'safeMissesLeft',
  projectedGrade: 'projectedGrade',
  activeModules: 'activeModules',
  totalModules: 'totalModules',
  color: 'color'
};

exports.Prisma.TopicScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  unitNumber: 'unitNumber',
  unitName: 'unitName',
  title: 'title',
  description: 'description',
  order: 'order',
  masteryPercent: 'masteryPercent',
  status: 'status',
  isWeak: 'isWeak'
};

exports.Prisma.ResourceScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  topicId: 'topicId',
  title: 'title',
  description: 'description',
  type: 'type',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  channel: 'channel',
  duration: 'duration',
  fileSize: 'fileSize',
  author: 'author',
  downloads: 'downloads',
  tags: 'tags',
  createdAt: 'createdAt'
};

exports.Prisma.AssignmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjectId: 'subjectId',
  title: 'title',
  code: 'code',
  description: 'description',
  deadline: 'deadline',
  estimatedMins: 'estimatedMins',
  weightage: 'weightage',
  status: 'status',
  score: 'score',
  maxScore: 'maxScore',
  testCasesPassed: 'testCasesPassed',
  totalTestCases: 'totalTestCases',
  submissionUrl: 'submissionUrl',
  submittedAt: 'submittedAt',
  source: 'source',
  externalId: 'externalId',
  externalCourseId: 'externalCourseId',
  externalUrl: 'externalUrl',
  dueDate: 'dueDate',
  dueTime: 'dueTime',
  priority: 'priority',
  workType: 'workType',
  lastSyncedAt: 'lastSyncedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GoogleClassroomConnectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  googleAccountId: 'googleAccountId',
  googleEmail: 'googleEmail',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  expiresAt: 'expiresAt',
  scopes: 'scopes',
  connectedAt: 'connectedAt',
  updatedAt: 'updatedAt',
  lastSyncedAt: 'lastSyncedAt',
  status: 'status'
};

exports.Prisma.GoogleClassroomCourseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  googleCourseId: 'googleCourseId',
  courseName: 'courseName',
  courseSection: 'courseSection',
  courseDescription: 'courseDescription',
  courseState: 'courseState',
  nivoraSubjectId: 'nivoraSubjectId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassScheduleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjectId: 'subjectId',
  academicSubjectId: 'academicSubjectId',
  dayOfWeek: 'dayOfWeek',
  dayName: 'dayName',
  startTime: 'startTime',
  endTime: 'endTime',
  subjectName: 'subjectName',
  subjectCode: 'subjectCode',
  instructor: 'instructor',
  room: 'room',
  type: 'type',
  section: 'section',
  meetingUrl: 'meetingUrl',
  notes: 'notes',
  needsReview: 'needsReview',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TimetableUploadScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  imageUrl: 'imageUrl',
  fileName: 'fileName',
  fileSize: 'fileSize',
  entriesCount: 'entriesCount',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjectId: 'subjectId',
  title: 'title',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  durationHours: 'durationHours',
  room: 'room',
  proctor: 'proctor',
  weightage: 'weightage',
  seatNumber: 'seatNumber',
  syllabusMastery: 'syllabusMastery',
  status: 'status',
  examType: 'examType',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceRecordScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  date: 'date',
  status: 'status',
  notes: 'notes'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjectId: 'subjectId',
  subjectCode: 'subjectCode',
  subjectName: 'subjectName',
  attendedClasses: 'attendedClasses',
  totalClasses: 'totalClasses',
  absentClasses: 'absentClasses',
  attendancePercentage: 'attendancePercentage',
  lastUpdated: 'lastUpdated',
  source: 'source',
  sourceRecordId: 'sourceRecordId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlannerTaskScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  category: 'category',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  isCompleted: 'isCompleted',
  priority: 'priority',
  relatedSubjectCode: 'relatedSubjectCode',
  meetingUrl: 'meetingUrl',
  createdAt: 'createdAt'
};

exports.Prisma.RebootSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  durationMins: 'durationMins',
  focusScoreDelta: 'focusScoreDelta',
  completedAt: 'completedAt'
};

exports.Prisma.MusicTrackScalarFieldEnum = {
  id: 'id',
  title: 'title',
  subtitle: 'subtitle',
  artist: 'artist',
  album: 'album',
  genre: 'genre',
  category: 'category',
  duration: 'duration',
  durationSec: 'durationSec',
  audioUrl: 'audioUrl',
  artworkUrl: 'artworkUrl',
  fileName: 'fileName',
  fileSize: 'fileSize',
  fileSizeBytes: 'fileSizeBytes',
  fileHash: 'fileHash',
  mimeType: 'mimeType',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SkillScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  category: 'category',
  level: 'level',
  progress: 'progress',
  evidenceCount: 'evidenceCount',
  verified: 'verified'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  repoUrl: 'repoUrl',
  techStack: 'techStack',
  role: 'role',
  progress: 'progress',
  commitsCount: 'commitsCount',
  verifiedAudit: 'verifiedAudit',
  jepsenPassed: 'jepsenPassed'
};

exports.Prisma.CareerDossierScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  targetRole: 'targetRole',
  atsScore: 'atsScore',
  dossierNumber: 'dossierNumber',
  targetPercentile: 'targetPercentile'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  dossierId: 'dossierId',
  companyName: 'companyName',
  role: 'role',
  status: 'status',
  nextEvent: 'nextEvent',
  timingNotice: 'timingNotice',
  compensation: 'compensation',
  location: 'location'
};

exports.Prisma.StudyGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subjectCode: 'subjectCode',
  membersCount: 'membersCount',
  lastActive: 'lastActive',
  description: 'description'
};

exports.Prisma.DiscussionScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  authorName: 'authorName',
  title: 'title',
  content: 'content',
  repliesCount: 'repliesCount',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  type: 'type',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  icon: 'icon',
  unlockedAt: 'unlockedAt'
};

exports.Prisma.PasswordResetScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  codeHash: 'codeHash',
  resetToken: 'resetToken',
  expiresAt: 'expiresAt',
  attempts: 'attempts',
  verifiedAt: 'verifiedAt',
  usedAt: 'usedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ClubScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  category: 'category',
  logo: 'logo',
  bannerImage: 'bannerImage',
  leaderId: 'leaderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClubMembershipScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  clubId: 'clubId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  date: 'date',
  eventDate: 'eventDate',
  startTime: 'startTime',
  endTime: 'endTime',
  venue: 'venue',
  organizerName: 'organizerName',
  clubId: 'clubId',
  capacity: 'capacity',
  registrationDeadline: 'registrationDeadline',
  prizePool: 'prizePool',
  isCancelled: 'isCancelled',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventRegistrationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  status: 'status',
  registeredAt: 'registeredAt'
};

exports.Prisma.ClubAnnouncementScalarFieldEnum = {
  id: 'id',
  clubId: 'clubId',
  authorId: 'authorId',
  title: 'title',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.TopicProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  topicId: 'topicId',
  subjectId: 'subjectId',
  isCompleted: 'isCompleted',
  completedAt: 'completedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SavedResourceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  resourceId: 'resourceId',
  savedAt: 'savedAt'
};

exports.Prisma.LearningActivityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subjectId: 'subjectId',
  topicId: 'topicId',
  resourceId: 'resourceId',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.HealthProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  waterGoalMl: 'waterGoalMl',
  sleepGoalHours: 'sleepGoalHours',
  weeklyWorkoutGoal: 'weeklyWorkoutGoal',
  dailyCalorieGoal: 'dailyCalorieGoal',
  heightCm: 'heightCm',
  weightKg: 'weightKg',
  activityLevel: 'activityLevel',
  fitnessGoal: 'fitnessGoal',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkoutPlanScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  goal: 'goal',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkoutPlanDayScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  dayOfWeek: 'dayOfWeek',
  name: 'name',
  muscleGroups: 'muscleGroups',
  isRestDay: 'isRestDay',
  estimatedDuration: 'estimatedDuration'
};

exports.Prisma.PlanExerciseScalarFieldEnum = {
  id: 'id',
  planDayId: 'planDayId',
  exerciseName: 'exerciseName',
  muscleGroup: 'muscleGroup',
  targetSets: 'targetSets',
  targetReps: 'targetReps',
  targetWeightKg: 'targetWeightKg',
  restSeconds: 'restSeconds',
  order: 'order',
  notes: 'notes'
};

exports.Prisma.WorkoutSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  planId: 'planId',
  planName: 'planName',
  title: 'title',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  durationMinutes: 'durationMinutes',
  totalVolumeKg: 'totalVolumeKg',
  totalSets: 'totalSets',
  totalReps: 'totalReps',
  status: 'status',
  notes: 'notes'
};

exports.Prisma.WorkoutSessionExerciseScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  exerciseName: 'exerciseName',
  muscleGroup: 'muscleGroup',
  order: 'order'
};

exports.Prisma.WorkoutSetScalarFieldEnum = {
  id: 'id',
  sessionExerciseId: 'sessionExerciseId',
  setNumber: 'setNumber',
  reps: 'reps',
  weightKg: 'weightKg',
  isCompleted: 'isCompleted'
};

exports.Prisma.WaterLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  amountMl: 'amountMl',
  loggedAt: 'loggedAt'
};

exports.Prisma.SleepLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  bedtime: 'bedtime',
  wakeTime: 'wakeTime',
  durationMinutes: 'durationMinutes',
  quality: 'quality',
  notes: 'notes',
  loggedAt: 'loggedAt'
};

exports.Prisma.MealLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  mealType: 'mealType',
  name: 'name',
  calories: 'calories',
  proteinGrams: 'proteinGrams',
  carbsGrams: 'carbsGrams',
  fatGrams: 'fatGrams',
  notes: 'notes',
  loggedAt: 'loggedAt'
};

exports.Prisma.HealthGoalScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  target: 'target',
  unit: 'unit',
  frequency: 'frequency',
  category: 'category',
  currentProgress: 'currentProgress',
  startDate: 'startDate',
  endDate: 'endDate',
  isCompleted: 'isCompleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DailyCheckInScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  energyLevel: 'energyLevel',
  workoutCompleted: 'workoutCompleted',
  waterIntakeMl: 'waterIntakeMl',
  sleepHours: 'sleepHours',
  mealsCount: 'mealsCount',
  mood: 'mood',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.StudentConnectionScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  status: 'status',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcademicUniversityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicCollegeScalarFieldEnum = {
  id: 'id',
  externalCollegeId: 'externalCollegeId',
  name: 'name',
  universityId: 'universityId',
  state: 'state',
  district: 'district',
  website: 'website',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicBranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  normalizedName: 'normalizedName',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicCollegeBranchScalarFieldEnum = {
  collegeId: 'collegeId',
  branchId: 'branchId',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicSyllabusVersionScalarFieldEnum = {
  id: 'id',
  universityId: 'universityId',
  branchId: 'branchId',
  regulation: 'regulation',
  academicYear: 'academicYear',
  sourceUrl: 'sourceUrl',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicSubjectScalarFieldEnum = {
  id: 'id',
  syllabusId: 'syllabusId',
  semester: 'semester',
  code: 'code',
  name: 'name',
  subjectType: 'subjectType',
  credits: 'credits',
  lectureHours: 'lectureHours',
  tutorialHours: 'tutorialHours',
  practicalHours: 'practicalHours',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  StudentProfile: 'StudentProfile',
  Subject: 'Subject',
  Topic: 'Topic',
  Resource: 'Resource',
  Assignment: 'Assignment',
  GoogleClassroomConnection: 'GoogleClassroomConnection',
  GoogleClassroomCourse: 'GoogleClassroomCourse',
  ClassSchedule: 'ClassSchedule',
  TimetableUpload: 'TimetableUpload',
  Exam: 'Exam',
  AttendanceRecord: 'AttendanceRecord',
  Attendance: 'Attendance',
  PlannerTask: 'PlannerTask',
  RebootSession: 'RebootSession',
  MusicTrack: 'MusicTrack',
  Skill: 'Skill',
  Project: 'Project',
  CareerDossier: 'CareerDossier',
  Application: 'Application',
  StudyGroup: 'StudyGroup',
  Discussion: 'Discussion',
  Notification: 'Notification',
  Achievement: 'Achievement',
  PasswordReset: 'PasswordReset',
  Club: 'Club',
  ClubMembership: 'ClubMembership',
  Event: 'Event',
  EventRegistration: 'EventRegistration',
  ClubAnnouncement: 'ClubAnnouncement',
  TopicProgress: 'TopicProgress',
  SavedResource: 'SavedResource',
  LearningActivity: 'LearningActivity',
  HealthProfile: 'HealthProfile',
  WorkoutPlan: 'WorkoutPlan',
  WorkoutPlanDay: 'WorkoutPlanDay',
  PlanExercise: 'PlanExercise',
  WorkoutSession: 'WorkoutSession',
  WorkoutSessionExercise: 'WorkoutSessionExercise',
  WorkoutSet: 'WorkoutSet',
  WaterLog: 'WaterLog',
  SleepLog: 'SleepLog',
  MealLog: 'MealLog',
  HealthGoal: 'HealthGoal',
  DailyCheckIn: 'DailyCheckIn',
  StudentConnection: 'StudentConnection',
  AcademicUniversity: 'AcademicUniversity',
  AcademicCollege: 'AcademicCollege',
  AcademicBranch: 'AcademicBranch',
  AcademicCollegeBranch: 'AcademicCollegeBranch',
  AcademicSyllabusVersion: 'AcademicSyllabusVersion',
  AcademicSubject: 'AcademicSubject'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
