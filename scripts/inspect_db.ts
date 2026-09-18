import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          degree: true,
          stream: true,
          streamCode: true,
          year: true,
          onboardingCompleted: true,
        }
      }
    }
  });
  console.log('=== USERS ===');
  console.log(JSON.stringify(users, null, 2));

  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.studentProfile.count(),
    plannerTasks: await prisma.plannerTask.count(),
    rebootSessions: await prisma.rebootSession.count(),
    skills: await prisma.skill.count(),
    projects: await prisma.project.count(),
    careerDossiers: await prisma.careerDossier.count(),
    applications: await prisma.application.count(),
    notifications: await prisma.notification.count(),
    achievements: await prisma.achievement.count(),
    passwordResets: await prisma.passwordReset.count(),
    subjects: await prisma.subject.count(),
    topics: await prisma.topic.count(),
    resources: await prisma.resource.count(),
    assignments: await prisma.assignment.count(),
    classes: await prisma.classSchedule.count(),
    exams: await prisma.exam.count(),
    attendanceRecords: await prisma.attendanceRecord.count(),
    studyGroups: await prisma.studyGroup.count(),
    discussions: await prisma.discussion.count(),
    musicTracks: await prisma.musicTrack.count()
  };
  console.log('=== TABLE COUNTS ===');
  console.log(JSON.stringify(counts, null, 2));

  for (const u of users) {
    const pCount = await prisma.plannerTask.count({ where: { userId: u.id } });
    const sCount = await prisma.skill.count({ where: { userId: u.id } });
    const prCount = await prisma.project.count({ where: { userId: u.id } });
    const cCount = await prisma.careerDossier.count({ where: { userId: u.id } });
    const nCount = await prisma.notification.count({ where: { userId: u.id } });
    const aCount = await prisma.achievement.count({ where: { userId: u.id } });
    console.log(`User ${u.email} (${u.name}, id=${u.id}): planner=${pCount}, skills=${sCount}, projects=${prCount}, dossier=${cCount}, notifications=${nCount}, achievements=${aCount}`);
  }

  const musicTracks = await prisma.musicTrack.findMany();
  console.log('=== MUSIC TRACKS ===');
  console.log(JSON.stringify(musicTracks, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  const subjects = await prisma.subject.findMany({ select: { id: true, code: true, name: true, streamCode: true } });
  console.log('=== SUBJECTS ===');
  console.log(JSON.stringify(subjects, null, 2));

  const resets = await prisma.passwordReset.findMany({ include: { user: { select: { email: true } } } });
  console.log('=== PASSWORD RESETS ===');
  console.log(JSON.stringify(resets, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
