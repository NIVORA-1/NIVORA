import prisma from '../src/lib/prisma';
import { signSessionToken } from '../src/lib/auth';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('🧪 Starting NIVORA Clubs & Events End-to-End Multi-User Verification...\n');

  // 1. Fetch two distinct users from DB
  const userA = await prisma.user.findFirst({
    where: { email: 'ram@123' },
  });
  const userB = await prisma.user.findFirst({
    where: { email: 'rishabh@nivora.edu' },
  });

  if (!userA || !userB) {
    throw new Error('Test requires at least two users in DB (ram@123 and rishabh@nivora.edu)');
  }

  console.log(`👤 User A: ${userA.name} (${userA.email}, ID: ${userA.id})`);
  console.log(`👤 User B: ${userB.name} (${userB.email}, ID: ${userB.id})`);

  // Generate tokens
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

  // Clean any previous test memberships/registrations for userA & userB
  await prisma.clubMembership.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });
  await prisma.eventRegistration.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });

  // Get clubs and events
  const acmClub = await prisma.club.findFirst({ where: { slug: 'acm-student-chapter' } });
  const roboticsClub = await prisma.club.findFirst({ where: { slug: 'hardware-robotics-society' } });
  const hackathon = await prisma.event.findFirst({ where: { title: { contains: 'HackCampus' } } });
  const fpgaBootcamp = await prisma.event.findFirst({ where: { title: { contains: 'FPGA' } } });

  if (!acmClub || !roboticsClub || !hackathon || !fpgaBootcamp) {
    throw new Error('Test seed data missing (clubs or events)');
  }

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

  console.log('\n--- 1. Testing Event & Club Public Browsing & Search ---');
  // GET /api/clubs
  const resClubs = await fetch(`${BASE_URL}/api/clubs`);
  const allClubs = await resClubs.json();
  assert(resClubs.ok && Array.isArray(allClubs) && allClubs.length >= 4, 'GET /api/clubs returns all campus clubs');

  // Search clubs
  const resClubSearch = await fetch(`${BASE_URL}/api/clubs?search=Robotics`);
  const searchedClubs = await resClubSearch.json();
  assert(searchedClubs.length === 1 && searchedClubs[0].slug === 'hardware-robotics-society', 'Club search filters accurately by query');

  // GET /api/events
  const resEvents = await fetch(`${BASE_URL}/api/events`);
  const allEvents = await resEvents.json();
  assert(resEvents.ok && Array.isArray(allEvents) && allEvents.length >= 4, 'GET /api/events returns campus events');

  // Filter events by category
  const resHackathons = await fetch(`${BASE_URL}/api/events?category=Hackathon`);
  const hackathons = await resHackathons.json();
  assert(hackathons.every((h: any) => h.category === 'Hackathon'), 'Event category filter returns only Hackathons');

  console.log('\n--- 2. Testing User A: Join Club & Duplicate Membership Prevention ---');
  // User A joins ACM Club
  const joinRes1 = await fetch(`${BASE_URL}/api/clubs/${acmClub.id}/join`, {
    method: 'POST',
    headers: headersA,
  });
  const joinData1 = await joinRes1.json();
  assert(joinRes1.ok && joinData1.isMember === true, 'User A successfully joined ACM Student Chapter');

  // Duplicate join attempt
  const joinRes2 = await fetch(`${BASE_URL}/api/clubs/${acmClub.id}/join`, {
    method: 'POST',
    headers: headersA,
  });
  const joinData2 = await joinRes2.json();
  assert(joinRes2.ok && joinData2.isMember === true, 'Duplicate club join handled gracefully without duplicate DB row');

  const countUserAMemberships = await prisma.clubMembership.count({
    where: { userId: userA.id, clubId: acmClub.id },
  });
  assert(countUserAMemberships === 1, 'Database enforces exactly 1 membership for User A in ACM Club');

  console.log('\n--- 3. Testing User A: Event Registration & Capacity Decrement ---');
  const initialRemaining = hackathon.capacity ? hackathon.capacity : 150;

  // User A registers for HackCampus
  const regRes1 = await fetch(`${BASE_URL}/api/events/${hackathon.id}/register`, {
    method: 'POST',
    headers: headersA,
  });
  const regData1 = await regRes1.json();
  assert(regRes1.ok && regData1.isRegistered === true, 'User A successfully registered for HackCampus \'25');
  assert(regData1.remainingSeats === initialRemaining - 1, 'Event capacity seat decremented correctly');

  // Duplicate registration attempt
  const regRes2 = await fetch(`${BASE_URL}/api/events/${hackathon.id}/register`, {
    method: 'POST',
    headers: headersA,
  });
  const regData2 = await regRes2.json();
  assert(regRes2.ok && regData2.isRegistered === true, 'Duplicate event registration handled gracefully');

  const countUserARegs = await prisma.eventRegistration.count({
    where: { userId: userA.id, eventId: hackathon.id, status: 'REGISTERED' },
  });
  assert(countUserARegs === 1, 'Database enforces exactly 1 active registration for User A');

  // Notification verification for User A
  const userANotifs = await prisma.notification.findMany({
    where: { userId: userA.id },
    orderBy: { createdAt: 'desc' },
  });
  assert(userANotifs.some((n) => n.title.includes('Registered for') || n.title.includes('Welcome to')), 'Notification created in DB for User A');

  console.log('\n--- 4. Testing Multi-User Isolation: User B Does NOT See User A Data ---');
  // Check User B's My Clubs
  const myClubsB1 = await (await fetch(`${BASE_URL}/api/clubs/my`, { headers: headersB })).json();
  assert(Array.isArray(myClubsB1) && myClubsB1.length === 0, 'User B has 0 clubs (not leaked from User A)');

  // Check User B's My Events
  const myEventsB1 = await (await fetch(`${BASE_URL}/api/events/my`, { headers: headersB })).json();
  assert(myEventsB1.upcoming.length === 0, 'User B has 0 registered events (not leaked from User A)');

  // User B queries Event A
  const eventDetailB = await (await fetch(`${BASE_URL}/api/events/${hackathon.id}`, { headers: headersB })).json();
  assert(eventDetailB.isRegistered === false, 'User B sees isRegistered = false for Event A');

  // User B queries Club A
  const clubDetailB = await (await fetch(`${BASE_URL}/api/clubs/${acmClub.id}`, { headers: headersB })).json();
  assert(clubDetailB.isMember === false, 'User B sees isMember = false for Club A');

  console.log('\n--- 5. Testing User B: Join Distinct Club & Event ---');
  // User B joins Robotics Club
  await fetch(`${BASE_URL}/api/clubs/${roboticsClub.id}/join`, { method: 'POST', headers: headersB });
  // User B registers for FPGA Bootcamp
  await fetch(`${BASE_URL}/api/events/${fpgaBootcamp.id}/register`, { method: 'POST', headers: headersB });

  const myClubsB2 = await (await fetch(`${BASE_URL}/api/clubs/my`, { headers: headersB })).json();
  assert(myClubsB2.length === 1 && myClubsB2[0].id === roboticsClub.id, 'User B has Robotics Club in My Clubs');

  const myEventsB2 = await (await fetch(`${BASE_URL}/api/events/my`, { headers: headersB })).json();
  assert(myEventsB2.upcoming.length === 1 && myEventsB2.upcoming[0].id === fpgaBootcamp.id, 'User B has FPGA Bootcamp in My Events');

  const myClubsA = await (await fetch(`${BASE_URL}/api/clubs/my`, { headers: headersA })).json();
  assert(myClubsA.length === 1 && myClubsA[0].id === acmClub.id, 'User A still has ONLY ACM Club (perfect isolation)');

  console.log('\n--- 6. Testing Cancellation: Cancel RSVP & Leave Club ---');
  // User A cancels Hackathon RSVP
  const cancelRes = await fetch(`${BASE_URL}/api/events/${hackathon.id}/cancel`, {
    method: 'POST',
    headers: headersA,
  });
  const cancelData = await cancelRes.json();
  assert(cancelRes.ok && cancelData.isRegistered === false, 'User A successfully cancelled event registration');
  assert(cancelData.remainingSeats === initialRemaining, 'Event seat restored to full capacity after cancellation');

  // User A leaves ACM Club
  const leaveRes = await fetch(`${BASE_URL}/api/clubs/${acmClub.id}/leave`, {
    method: 'POST',
    headers: headersA,
  });
  const leaveData = await leaveRes.json();
  assert(leaveRes.ok && leaveData.isMember === false, 'User A successfully left the club');

  const finalMyClubsA = await (await fetch(`${BASE_URL}/api/clubs/my`, { headers: headersA })).json();
  assert(finalMyClubsA.length === 0, 'User A My Clubs is now empty after leaving');

  console.log('\n--- 7. Testing Organizer Authorization Controls ---');
  // User A (regular student) attempts to view attendee roster for HackCampus -> should get 403 Forbidden
  const rosterRes = await fetch(`${BASE_URL}/api/events/${hackathon.id}/registrations`, {
    headers: headersA,
  });
  assert(rosterRes.status === 403, 'Regular student blocked from viewing event attendee roster (HTTP 403)');

  // User A attempts to post announcement to ACM Club without admin rights -> should get 403 Forbidden
  const annRes = await fetch(`${BASE_URL}/api/clubs/${acmClub.id}/announcements`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      title: 'Unauthorized announcement',
      content: 'This should be blocked',
    }),
  });
  assert(annRes.status === 403, 'Regular student blocked from publishing club announcements (HTTP 403)');

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
