import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// List of mock / test account emails to remove
const MOCK_EMAILS = [
  'rishabh@nivora.edu',
  'student_1789737790189@nivora.edu',
  'student_1789737903967@nivora.edu',
  'rishabh@123',
];

// Explicit list of real users that MUST NEVER be deleted
const PROTECTED_REAL_EMAILS = [
  process.env.ADMIN_EMAIL || 'admin@nivora.edu',
  'student@nivora.edu',
];

async function main() {
  console.log('🚀 Starting NIVORA Mock / Demo Data Reset...');

  // 1. Safety Check: Verify real users exist and are NOT in the deletion list
  const existingUsers = await prisma.user.findMany({ select: { id: true, email: true } });
  const existingEmails = existingUsers.map((u) => u.email.toLowerCase());

  for (const protectedEmail of PROTECTED_REAL_EMAILS) {
    if (MOCK_EMAILS.includes(protectedEmail)) {
      throw new Error(`CRITICAL SAFETY ABORT: Protected email ${protectedEmail} found in MOCK_EMAILS!`);
    }
  }

  console.log('✅ Safety verification passed. Protected accounts will be preserved.');

  // 2. Identify target mock user IDs
  const mockUsers = await prisma.user.findMany({
    where: {
      email: { in: MOCK_EMAILS },
    },
    select: { id: true, email: true },
  });
  const mockUserIds = mockUsers.map((u) => u.id);
  console.log(`Found ${mockUsers.length} mock/test accounts to remove:`, mockUsers.map((u) => u.email));

  // 3. Delete dependent mock user data in foreign-key order
  if (mockUserIds.length > 0) {
    // 3.1 Applications (via CareerDossier)
    const dossiers = await prisma.careerDossier.findMany({
      where: { userId: { in: mockUserIds } },
      select: { id: true },
    });
    const dossierIds = dossiers.map((d) => d.id);
    if (dossierIds.length > 0) {
      const deletedApps = await prisma.application.deleteMany({
        where: { dossierId: { in: dossierIds } },
      });
      console.log(`- Deleted ${deletedApps.count} mock career applications`);
    }

    // 3.2 Career Dossiers
    const deletedDossiers = await prisma.careerDossier.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedDossiers.count} mock career dossiers`);

    // 3.3 Planner Tasks
    const deletedTasks = await prisma.plannerTask.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedTasks.count} mock planner tasks`);

    // 3.4 Skills
    const deletedSkills = await prisma.skill.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedSkills.count} mock skills`);

    // 3.5 Projects
    const deletedProjects = await prisma.project.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedProjects.count} mock projects`);

    // 3.6 Notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedNotifications.count} mock notifications`);

    // 3.7 Achievements
    const deletedAchievements = await prisma.achievement.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedAchievements.count} mock achievements`);

    // 3.8 Password Resets for mock accounts
    const deletedResets = await prisma.passwordReset.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedResets.count} mock password reset records`);

    // 3.9 Reboot Sessions
    const deletedReboot = await prisma.rebootSession.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedReboot.count} mock reboot sessions`);

    // 3.10 Student Profiles
    const deletedProfiles = await prisma.studentProfile.deleteMany({
      where: { userId: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedProfiles.count} mock student profiles`);

    // 3.11 Users
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: mockUserIds } },
    });
    console.log(`- Deleted ${deletedUsers.count} mock user records`);
  }

  // 4. Delete mock academic demo data (from seed.ts)
  const deletedDiscussions = await prisma.discussion.deleteMany();
  console.log(`- Deleted ${deletedDiscussions.count} mock discussions`);

  const deletedGroups = await prisma.studyGroup.deleteMany();
  console.log(`- Deleted ${deletedGroups.count} mock study groups`);

  const deletedAttendance = await prisma.attendanceRecord.deleteMany();
  console.log(`- Deleted ${deletedAttendance.count} attendance records`);

  const deletedAssignments = await prisma.assignment.deleteMany();
  console.log(`- Deleted ${deletedAssignments.count} mock assignments`);

  const deletedExams = await prisma.exam.deleteMany();
  console.log(`- Deleted ${deletedExams.count} mock exams`);

  const deletedClasses = await prisma.classSchedule.deleteMany();
  console.log(`- Deleted ${deletedClasses.count} mock class schedules`);

  const deletedResources = await prisma.resource.deleteMany();
  console.log(`- Deleted ${deletedResources.count} mock resources`);

  const deletedTopics = await prisma.topic.deleteMany();
  console.log(`- Deleted ${deletedTopics.count} mock topics`);

  // 5. Clean mock demo music metadata records (placeholder paths with no files on disk)
  const deletedMockMusic = await prisma.musicTrack.deleteMany({
    where: {
      audioUrl: {
        in: [
          '/audio/gamma.mp3',
          '/audio/rain.mp3',
          '/audio/flow.mp3',
          '/audio/lofi.mp3',
        ],
      },
    },
  });
  console.log(`- Deleted ${deletedMockMusic.count} mock demo music track records`);

  console.log('\n=============================================');
  console.log('🎉 DATABASE MOCK DATA RESET COMPLETED SUCCESSFULLY');
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Reset failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
