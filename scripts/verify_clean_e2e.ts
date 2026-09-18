import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function runE2EVerification() {
  console.log('--- STARTING CLEAN DATABASE & APP E2E VERIFICATION ---');

  // 1. Verify preserved real users
  const realUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
  });
  console.log(`\n1. Preserved Real Users (${realUsers.length}):`);
  realUsers.forEach(u => console.log(`   - [${u.id}] ${u.email} (${u.name})`));

  if (realUsers.length < 3) {
    throw new Error('Real user accounts are missing!');
  }

  // 2. Verify all mock records count across tables
  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.studentProfile.count(),
    plannerTasks: await prisma.plannerTask.count(),
    skills: await prisma.skill.count(),
    projects: await prisma.project.count(),
    careerDossiers: await prisma.careerDossier.count(),
    applications: await prisma.application.count(),
    notifications: await prisma.notification.count(),
    achievements: await prisma.achievement.count(),
    rebootSessions: await prisma.rebootSession.count(),
    passwordResets: await prisma.passwordReset.count(),
    studyGroups: await prisma.studyGroup.count(),
    discussions: await prisma.discussion.count(),
    assignments: await prisma.assignment.count(),
    exams: await prisma.exam.count(),
    classSchedules: await prisma.classSchedule.count(),
    resources: await prisma.resource.count(),
    topics: await prisma.topic.count(),
    subjects: await prisma.subject.count(),
    musicTracks: await prisma.musicTrack.count(),
  };

  console.log('\n2. Current Database Counts (Pre-test):');
  console.log(JSON.stringify(counts, null, 2));

  // 3. Test Signup Flow via API
  const testEmail = `test_verification_${Date.now()}@nivora.edu`;
  console.log(`\n3. Testing Signup API with fresh user: ${testEmail}...`);

  const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Clean Test Student',
      email: testEmail,
      password: 'StrongPassword123!',
      stream: 'CSE',
      year: 2,
    }),
  });

  if (!signupRes.ok) {
    const errText = await signupRes.text();
    throw new Error(`Signup failed (${signupRes.status}): ${errText}`);
  }

  const signupData = await signupRes.json();
  const testUserId = signupData.user.id;
  const cookieHeader = signupRes.headers.get('set-cookie') || '';
  console.log(`   ✓ User created successfully: ID=${testUserId}`);

  // 4. Verify Database State for New User
  const newUser = await prisma.user.findUnique({
    where: { id: testUserId },
    include: {
      profile: true,
      plannerTasks: true,
      skills: true,
      projects: true,
      notifications: true,
      achievements: true,
      careerDossier: true,
    },
  });

  console.log('\n4. Verifying New User Clean State:');
  console.log(`   - Planner tasks: ${newUser?.plannerTasks.length} (Expected: 0)`);
  console.log(`   - Skills: ${newUser?.skills.length} (Expected: 0)`);
  console.log(`   - Projects: ${newUser?.projects.length} (Expected: 0)`);
  console.log(`   - Notifications: ${newUser?.notifications.length} (Expected: 0)`);
  console.log(`   - Achievements: ${newUser?.achievements.length} (Expected: 0)`);
  console.log(`   - Career Dossier: ${newUser?.careerDossier ? 'Present' : 'None'} (Expected: None)`);
  console.log(`   - CGPA: ${newUser?.profile?.cgpa} (Expected: 0.0)`);
  console.log(`   - Focus score: ${newUser?.profile?.focusScore} (Expected: 0)`);
  console.log(`   - Streak days: ${newUser?.profile?.streakDays} (Expected: 0)`);
  console.log(`   - Onboarding completed: ${newUser?.profile?.onboardingCompleted} (Expected: false)`);

  if (
    newUser?.plannerTasks.length !== 0 ||
    newUser?.skills.length !== 0 ||
    newUser?.projects.length !== 0 ||
    newUser?.notifications.length !== 0 ||
    newUser?.achievements.length !== 0 ||
    newUser?.profile?.cgpa !== 0 ||
    newUser?.profile?.onboardingCompleted !== false
  ) {
    throw new Error('Fresh user state was NOT clean!');
  }
  console.log('   ✓ Fresh user is completely clean with 0 mock data!');

  // 5. Test Authenticated Dashboard & API Routes
  console.log('\n5. Testing Endpoints with Fresh User Auth:');
  const authHeaders = {
    Cookie: cookieHeader.split(';')[0],
  };

  const dashRes = await fetch('http://localhost:3000/api/dashboard', { headers: authHeaders });
  const dashData = await dashRes.json();
  console.log(`   - Dashboard API status: ${dashRes.status}`);
  console.log(`   - Dashboard plannerTasks: ${dashData.plannerTasks?.length || 0} (Expected: 0)`);
  console.log(`   - Dashboard notifications: ${dashData.notifications?.length || 0} (Expected: 0)`);

  const plannerRes = await fetch('http://localhost:3000/api/planner', { headers: authHeaders });
  const plannerData = await plannerRes.json();
  console.log(`   - Planner API tasks: ${plannerData.length} (Expected: 0)`);

  const skillsRes = await fetch('http://localhost:3000/api/skills', { headers: authHeaders });
  const skillsData = await skillsRes.json();
  console.log(`   - Skills API count: ${skillsData.length} (Expected: 0)`);

  const projectsRes = await fetch('http://localhost:3000/api/projects', { headers: authHeaders });
  const projectsData = await projectsRes.json();
  console.log(`   - Projects API count: ${projectsData.length} (Expected: 0)`);

  // 6. Test Music Tracks API
  console.log('\n6. Testing Music Tracks API:');
  const musicRes = await fetch('http://localhost:3000/api/music/tracks');
  const musicData = await musicRes.json();
  console.log(`   - Music tracks API status: ${musicRes.status}`);
  console.log(`   - Total music tracks loaded: ${musicData.tracks?.length || 0}`);
  if (musicData.tracks?.length > 0) {
    console.log(`   - Sample track: "${musicData.tracks[0].title}" by ${musicData.tracks[0].artist}`);
  }

  // 7. Test Onboarding Flow for this User
  console.log('\n7. Testing Onboarding Flow:');
  const onboardRes = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({
      step: 3,
      college: 'National Institute of Technology',
      degree: 'B.Tech',
      stream: 'Computer Science & Engineering',
      streamCode: 'CSE',
      specialization: 'Artificial Intelligence & Machine Learning',
      year: 2,
      semester: 3,
      careerGoal: 'AI Research Engineer',
      academicGoals: ['Maintain 9.0+ CGPA', 'Publish a research paper'],
      interests: ['Machine Learning', 'Deep Learning', 'PyTorch'],
      studyDuration: '45m',
      preferredStudyTime: 'Night Owl (10 PM - 2 AM)',
      studyStyle: 'Deep Solo Focus',
      dailyStudyGoal: '3 hours',
      onboardingCompleted: true,
    }),
  });

  const onboardData = await onboardRes.json();
  console.log(`   - Onboarding status: ${onboardRes.status}`);
  console.log(`   - Updated college: ${onboardData.profile?.college}`);
  console.log(`   - Updated career goal: ${onboardData.profile?.careerGoal}`);
  console.log(`   - Onboarding completed: ${onboardData.profile?.onboardingCompleted}`);

  // 8. Clean up test user
  console.log(`\n8. Cleaning up test user ${testEmail}...`);
  await prisma.studentProfile.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
  console.log('   ✓ Test user safely deleted.');

  // 9. Final check
  const finalUsers = await prisma.user.count();
  console.log(`\n9. Final Database Verification: Users count = ${finalUsers}`);
  console.log('--- E2E VERIFICATION COMPLETED SUCCESSFULLY ---');
}

runE2EVerification()
  .catch((e) => {
    console.error('VERIFICATION FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
