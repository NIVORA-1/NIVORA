
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
  title: 'title',
  description: 'description',
  type: 'type',
  url: 'url',
  fileSize: 'fileSize',
  author: 'author',
  downloads: 'downloads',
  tags: 'tags',
  createdAt: 'createdAt'
};

exports.Prisma.AssignmentScalarFieldEnum = {
  id: 'id',
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
  submittedAt: 'submittedAt'
};

exports.Prisma.ClassScheduleScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  dayOfWeek: 'dayOfWeek',
  startTime: 'startTime',
  endTime: 'endTime',
  room: 'room',
  instructor: 'instructor',
  meetingUrl: 'meetingUrl',
  type: 'type'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  title: 'title',
  date: 'date',
  startTime: 'startTime',
  durationHours: 'durationHours',
  room: 'room',
  proctor: 'proctor',
  weightage: 'weightage',
  seatNumber: 'seatNumber',
  syllabusMastery: 'syllabusMastery',
  status: 'status'
};

exports.Prisma.AttendanceRecordScalarFieldEnum = {
  id: 'id',
  subjectId: 'subjectId',
  date: 'date',
  status: 'status',
  notes: 'notes'
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
  ClassSchedule: 'ClassSchedule',
  Exam: 'Exam',
  AttendanceRecord: 'AttendanceRecord',
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
  PasswordReset: 'PasswordReset'
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
