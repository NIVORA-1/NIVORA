import prisma from '../src/lib/prisma';
import { signSessionToken } from '../src/lib/auth';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('🧪 Starting NIVORA Learning Workspace Multi-User E2E Verification...\n');

  // 1. Fetch two distinct users: User A (Ram, Sem 1) & User B (Rishabh, Sem 5)
  const userA = await prisma.user.findFirst({
    where: { email: 'ram@123' },
    include: { profile: true },
  });
  const userB = await prisma.user.findFirst({
    where: { email: 'rishabh@nivora.edu' },
    include: { profile: true },
  });

  if (!userA || !userB) {
    throw new Error('Test requires ram@123 and rishabh@nivora.edu in DB');
  }

  // Ensure Student B has semester 5 to test multi-semester isolation (Sem 1 vs Sem 5)
  await prisma.studentProfile.update({
    where: { userId: userB.id },
    data: { semester: 5, year: 3 },
  });

  console.log(`👤 Student A: ${userA.name} (${userA.email}, Semester 1)`);
  console.log(`👤 Student B: ${userB.name} (${userB.email}, Semester 5)`);

  const tokenA = signSessionToken({ userId: userA.id, email: userA.email, name: userA.name });
  const tokenB = signSessionToken({ userId: userB.id, email: userB.email, name: userB.name });

  const headersA = {
    'Content-Type': 'application/json',
    Cookie: `nivora_session_token=${tokenA}`,
  };

  const headersB = {
    'Content-Type': 'application/json',
    Cookie: `nivora_session_token=${tokenB}`,
  };

  // Clean previous test learning progress/saves for test users
  await prisma.topicProgress.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });
  await prisma.savedResource.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });
  await prisma.learningActivity.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  console.log('\n--- 1. Testing Academic Profile Connection & Semester Subjects ---');
  // Student A (Sem 1) queries /api/learning
  const resA = await fetch(`${BASE_URL}/api/learning`, { headers: headersA });
  const dataA = await resA.json();
  assert(resA.ok, 'Student A fetches learning workspace successfully');
  assert(dataA.student.semester === 1, 'Student A active semester matches profile (Semester 1)');
  assert(dataA.subjects.length > 0, `Student A has ${dataA.subjects.length} subjects in Semester 1`);
  assert(
    dataA.subjects.every((s: any) => s.semester === 1),
    'All subjects returned belong strictly to Semester 1 (no unrelated semesters)'
  );

  // Student B (Sem 5) queries /api/learning
  const resB = await fetch(`${BASE_URL}/api/learning`, { headers: headersB });
  const dataB = await resB.json();
  assert(resB.ok, 'Student B fetches learning workspace successfully');
  assert(dataB.student.semester === 5, 'Student B active semester matches profile (Semester 5)');
  assert(
    dataB.subjects.every((s: any) => s.semester === 5),
    'All subjects returned for Student B belong strictly to Semester 5'
  );

  console.log('\n--- 2. Testing Subject Topics & Educational Resources ---');
  const pythonSubj = dataA.subjects.find((s: any) => s.code.includes('CSE101') || s.name.includes('Python'));
  assert(Boolean(pythonSubj), 'Found Python Programming subject for Student A');
  assert(pythonSubj.topics.length >= 4, `Python subject contains ${pythonSubj.topics.length} syllabus topics`);
  assert(pythonSubj.status === 'Not started', 'Initial subject status is "Not started" (no fake progress)');

  const testTopic = pythonSubj.topics[0];
  console.log(`   Selected topic for testing: "${testTopic.title}" (ID: ${testTopic.id})`);

  console.log('\n--- 3. Testing Mark as Complete & Real Progress Calculation ---');
  // Student A marks topic as complete
  const compRes1 = await fetch(`${BASE_URL}/api/learning/topics/${testTopic.id}/complete`, {
    method: 'POST',
    headers: headersA,
  });
  const compData1 = await compRes1.json();
  assert(compRes1.ok && compData1.isCompleted === true, 'Topic marked complete successfully for Student A');
  assert(compData1.completedTopics === 1, 'Subject completed topic count incremented to 1');
  assert(compData1.progressPercent > 0, `Subject progress recalculated to ${compData1.progressPercent}%`);

  // Verify in DB
  const dbProgressA = await prisma.topicProgress.findUnique({
    where: { userId_topicId: { userId: userA.id, topicId: testTopic.id } },
  });
  assert(Boolean(dbProgressA && dbProgressA.isCompleted), 'TopicProgress record correctly persisted in PostgreSQL');

  // Verify notification was created
  const notifA = await prisma.notification.findFirst({
    where: { userId: userA.id, title: { contains: 'Topic Completed' } },
  });
  assert(Boolean(notifA), 'In-app notification created for topic completion');

  console.log('\n--- 4. Testing Multi-User Data Isolation ---');
  // Student B queries /api/learning for Semester 1 to check topic status
  const resB_Sem1 = await fetch(`${BASE_URL}/api/learning?semester=1`, { headers: headersB });
  const dataB_Sem1 = await resB_Sem1.json();
  const pythonSubjB = dataB_Sem1.subjects.find((s: any) => s.id === pythonSubj.id);
  const testTopicB = pythonSubjB.topics.find((t: any) => t.id === testTopic.id);
  assert(testTopicB.isCompleted === false, 'Student B sees isCompleted = false for same topic (isolated data)');
  assert(pythonSubjB.status === 'Not started', 'Student B sees subject as "Not started"');

  console.log('\n--- 5. Testing Save Resource & Saved Vault ---');
  // Find a resource in the database
  const targetResource = await prisma.resource.findFirst({
    where: { type: 'video' },
  });
  if (!targetResource) throw new Error('No video resource in DB');

  // Student A saves resource
  const saveRes1 = await fetch(`${BASE_URL}/api/learning/resources/${targetResource.id}/save`, {
    method: 'POST',
    headers: headersA,
  });
  const saveData1 = await saveRes1.json();
  assert(saveRes1.ok && saveData1.isSaved === true, 'Student A saved video resource');

  // Check Student A saved vault
  const vaultA = await (await fetch(`${BASE_URL}/api/learning/saved`, { headers: headersA })).json();
  assert(vaultA.length === 1 && vaultA[0].id === targetResource.id, 'Resource appears in Student A saved vault');

  // Check Student B saved vault (isolation check)
  const vaultB = await (await fetch(`${BASE_URL}/api/learning/saved`, { headers: headersB })).json();
  assert(vaultB.length === 0, 'Student B saved vault is empty (no data leakage)');

  // Student A removes resource from saved
  const saveRes2 = await fetch(`${BASE_URL}/api/learning/resources/${targetResource.id}/save`, {
    method: 'POST',
    headers: headersA,
  });
  const saveData2 = await saveRes2.json();
  assert(saveRes2.ok && saveData2.isSaved === false, 'Student A removed resource from saved vault');

  const vaultA2 = await (await fetch(`${BASE_URL}/api/learning/saved`, { headers: headersA })).json();
  assert(vaultA2.length === 0, 'Student A saved vault is now empty after removal');

  console.log('\n--- 6. Testing Search & Filtering Across Curriculum ---');
  // Search query
  const searchRes = await fetch(`${BASE_URL}/api/learning?search=python`, { headers: headersA });
  const searchData = await searchRes.json();
  assert(searchRes.ok && Boolean(searchData.searchResults), 'Search endpoint executed successfully');
  assert(
    searchData.searchResults.topics.length > 0 || searchData.searchResults.resources.length > 0,
    'Search returned matching topics or resources for "python"'
  );

  // Type filter
  const filterRes = await fetch(`${BASE_URL}/api/learning?type=video`, { headers: headersA });
  const filterData = await filterRes.json();
  assert(
    filterData.subjects.every((s: any) => s.resources.every((r: any) => r.type.toLowerCase() === 'video')),
    'Filter by type "video" returned only video resources'
  );

  console.log('\n--- 7. Testing Study Session Activity Tracking ---');
  const actRes = await fetch(`${BASE_URL}/api/learning/activity`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      subjectId: pythonSubj.id,
      topicId: testTopic.id,
    }),
  });
  assert(actRes.ok, 'Study session recorded in LearningActivity');

  const learningDataAfterAct = await (await fetch(`${BASE_URL}/api/learning`, { headers: headersA })).json();
  assert(
    learningDataAfterAct.continueLearning.length > 0 &&
      learningDataAfterAct.continueLearning[0].subjectId === pythonSubj.id,
    'Recently Studied / Continue Learning includes the active study session'
  );

  console.log(`\n========================================`);
  console.log(`🎉 VERIFICATION RESULT: ${passed}/${total} ASSERTIONS PASSED!`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
