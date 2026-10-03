import prisma from '../src/lib/prisma';
import { signSessionToken } from '../src/lib/auth';
import {
  universities,
  searchUniversities,
  isValidUniversity,
  findUniversity,
} from '../src/lib/universities';

async function runE2ETests() {
  console.log('====================================================');
  console.log('NIVORA ONBOARDING STEP 01 — FULL VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}${detail ? ` -> ${detail}` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. DATASET INTEGRITY
  console.log('--- 1. Authoritative University Dataset from PDF ---');
  assert(universities.length === 1074, 'Dataset contains exactly 1074 UGC universities', `Count = ${universities.length}`);
  const galgotias = universities.find(u => u.name === 'Galgotias University');
  assert(Boolean(galgotias), 'Found "Galgotias University" in UGC dataset', `ID: ${galgotias?.id}, State: ${galgotias?.state}`);
  assert(galgotias?.sNo === 898, 'Galgotias University matches S.No 898 from page 40 of PDF');

  // 2. SEARCH & MATCHING
  console.log('\n--- 2. Search & Autocomplete Matching ---');
  const searchGal = searchUniversities('gal', 10);
  assert(searchGal.length > 0, 'Search "gal" returns results', `Found ${searchGal.length} items`);
  assert(searchGal[0]?.name === 'Galgotias University', 'Search "gal" prioritizes "Galgotias University" first', searchGal[0]?.name);

  const searchUpper = searchUniversities(' GALGOTIAS ', 10);
  assert(searchUpper.some(u => u.name === 'Galgotias University'), 'Search " GALGOTIAS " (case & whitespace tolerant) finds Galgotias University');

  const searchPartial = searchUniversities('galg', 10);
  assert(searchPartial.some(u => u.name === 'Galgotias University'), 'Search "galg" (partial match) finds Galgotias University');

  const searchDelhi = searchUniversities('delhi', 5);
  assert(searchDelhi.length > 0, 'Search "delhi" finds universities in Delhi', searchDelhi[0]?.name);

  // 3. VALIDATION FUNCTIONS
  console.log('\n--- 3. University Validation Logic ---');
  assert(isValidUniversity('Galgotias University'), 'isValidUniversity("Galgotias University") is true');
  assert(isValidUniversity(' galgotias university '), 'isValidUniversity(" galgotias university ") is true');
  assert(isValidUniversity('GALGOTIAS UNIVERSITY'), 'isValidUniversity("GALGOTIAS UNIVERSITY") is true');
  assert(!isValidUniversity('Random Fake Mars University'), 'isValidUniversity("Random Fake Mars University") is false');
  assert(!isValidUniversity(''), 'isValidUniversity("") is false');
  assert(!isValidUniversity('   '), 'isValidUniversity("   ") is false');
  assert(isValidUniversity('University of Delhi'), 'isValidUniversity("University of Delhi") is true');

  // 4. SERVER-SIDE VALIDATION VIA API
  console.log('\n--- 4. Client & Server-Side API Validation ---');
  const dbUser = await prisma.user.findUnique({ where: { email: 'ram@123' } });
  if (!dbUser) throw new Error('ram@123 user not found');

  const testToken = signSessionToken({
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
  });

  // Test A: Both empty
  const resA = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `nivora_session_token=${testToken}`,
    },
    body: JSON.stringify({
      step: 2,
      name: '',
      college: '',
    }),
  });
  const dataA = await resA.json();
  assert(resA.status === 400, 'Test A: Both fields empty -> status 400', `Status: ${resA.status}`);
  assert(Boolean(dataA.fieldErrors?.name), 'Test A: Shows "Full name is required."', dataA.fieldErrors?.name);
  assert(Boolean(dataA.fieldErrors?.college), 'Test A: Shows "Please select your university."', dataA.fieldErrors?.college);

  // Test B: Name empty + university selected
  const resB = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `nivora_session_token=${testToken}`,
    },
    body: JSON.stringify({
      step: 2,
      name: '   ',
      college: 'Galgotias University',
    }),
  });
  const dataB = await resB.json();
  assert(resB.status === 400, 'Test B: Name empty + university selected -> status 400', `Status: ${resB.status}`);
  assert(dataB.fieldErrors?.name === 'Full name is required.', 'Test B: Inline error "Full name is required."', dataB.fieldErrors?.name);

  // Test C: Name filled + university empty
  const resC = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `nivora_session_token=${testToken}`,
    },
    body: JSON.stringify({
      step: 2,
      name: 'Ram Sharma',
      college: '  ',
    }),
  });
  const dataC = await resC.json();
  assert(resC.status === 400, 'Test C: Name filled + university empty -> status 400', `Status: ${resC.status}`);
  assert(dataC.fieldErrors?.college === 'Please select your university.', 'Test C: Inline error "Please select your university."', dataC.fieldErrors?.college);

  // Test D: Name filled + invalid university
  const resD = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `nivora_session_token=${testToken}`,
    },
    body: JSON.stringify({
      step: 2,
      name: 'Ram Sharma',
      college: 'Random Fake Mars University',
    }),
  });
  const dataD = await resD.json();
  assert(resD.status === 400, 'Test D: Name filled + invalid university -> status 400', `Status: ${resD.status}`);
  assert(dataD.fieldErrors?.college === 'Please select a valid university from the list.', 'Test D: Inline error "Please select a valid university from the list."', dataD.fieldErrors?.college);

  // Test E: Both valid -> Success!
  const resE = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `nivora_session_token=${testToken}`,
    },
    body: JSON.stringify({
      step: 2,
      name: ' Ram Sharma ',
      college: ' Galgotias University ',
    }),
  });
  const dataE = await resE.json();
  assert(resE.status === 200, 'Test E: Both valid -> status 200 OK', `Status: ${resE.status}`);
  assert(dataE.profile?.college === 'Galgotias University', 'Test E: Trimmed university stored in profile.college', dataE.profile?.college);
  assert(dataE.profile?.onboardingStep === 2, 'Test E: Onboarding advances to Step 2', `Step: ${dataE.profile?.onboardingStep}`);

  // Test H: Revisit / retrieve onboarding
  const getRes = await fetch('http://localhost:3000/api/onboarding', {
    method: 'GET',
    headers: {
      Cookie: `nivora_session_token=${testToken}`,
    },
  });
  const getData = await getRes.json();
  assert(getRes.status === 200, 'Test H: Revisit onboarding -> GET returns saved profile');
  assert(getData.user?.name === 'Ram Sharma', 'Test H: User name is trimmed & persisted', getData.user?.name);
  assert(getData.user?.profile?.college === 'Galgotias University', 'Test H: Profile college is saved properly', getData.user?.profile?.college);

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');
}

runE2ETests().catch(console.error);
