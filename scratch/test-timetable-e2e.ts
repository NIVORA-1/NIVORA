import fs from 'fs';
import path from 'path';

async function testTimetableE2E() {
  const BASE_URL = 'http://localhost:3000';
  console.log('====================================================');
  console.log('🧪 RUNNING FULL NIVORA TIMETABLE OCR E2E QA SUITE');
  console.log('====================================================\n');

  // Step 1: Read sample timetable image
  const imgPath = path.join(process.cwd(), 'scratch', 'sample_timetable.jpg');
  if (!fs.existsSync(imgPath)) {
    throw new Error(`Sample timetable image not found at: ${imgPath}`);
  }
  const fileBuffer = fs.readFileSync(imgPath);
  console.log(`✓ Loaded sample timetable image (${fileBuffer.length} bytes)\n`);

  // Step 2: Sign in to obtain session
  console.log('Step 2: Authenticating student user (rishabh@nivora.edu)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rishabh@nivora.edu',
      password: 'password123',
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookies = setCookie
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');

  console.log('✓ Successfully authenticated! Cookies acquired.\n');

  // Step 3: Test POST /api/classes/upload with multipart/form-data
  console.log('Step 3: Sending timetable image to POST /api/classes/upload (multipart/form-data)...');
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'sample_timetable.jpg');

  const uploadStart = Date.now();
  const uploadRes = await fetch(`${BASE_URL}/api/classes/upload`, {
    method: 'POST',
    headers: {
      Cookie: cookies,
    },
    body: formData,
  });
  const uploadDuration = Date.now() - uploadStart;

  console.log(`✓ Upload HTTP Status: ${uploadRes.status} (${uploadDuration}ms)`);
  const uploadData = await uploadRes.json();

  if (!uploadRes.ok || !uploadData.success) {
    console.error('❌ Upload failed! Response:', JSON.stringify(uploadData, null, 2));
    throw new Error(`OCR Upload failed with status ${uploadRes.status}: ${uploadData.error}`);
  }

  console.log(`✓ OCR extraction successful!`);
  console.log(`✓ Extracted entries count: ${uploadData.entries?.length}`);
  console.log(`✓ Detected days: ${uploadData.detectedDays}`);
  console.log('\n--- EXTRACTED TIMETABLE ENTRIES ---');
  console.log(JSON.stringify(uploadData.entries, null, 2));
  console.log('-----------------------------------\n');

  // Verify structure of entries
  for (const entry of uploadData.entries) {
    if (!entry.day) throw new Error(`Missing 'day' in entry: ${JSON.stringify(entry)}`);
    if (!entry.startTime) throw new Error(`Missing 'startTime' in entry: ${JSON.stringify(entry)}`);
    if (!entry.endTime) throw new Error(`Missing 'endTime' in entry: ${JSON.stringify(entry)}`);
    if (!entry.subjectCode) console.warn(`Note: missing 'subjectCode' in entry: ${JSON.stringify(entry)}`);
    if (!entry.subject && !entry.subjectName) throw new Error(`Missing subject name in entry: ${JSON.stringify(entry)}`);
  }
  console.log('✓ Schema and fields validation passed for all entries.\n');

  // Step 4: Test Preview & Edit confirmation flow (POST /api/classes/confirm)
  console.log('Step 4: Simulating student confirmation & save (POST /api/classes/confirm)...');
  const confirmRes = await fetch(`${BASE_URL}/api/classes/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({
      entries: uploadData.entries,
      mode: 'replace',
      fileName: 'sample_timetable.jpg',
      fileSize: fileBuffer.length,
    }),
  });

  console.log(`✓ Confirm HTTP Status: ${confirmRes.status}`);
  const confirmData = await confirmRes.json();

  if (!confirmRes.ok || !confirmData.success) {
    console.error('❌ Confirm failed! Response:', JSON.stringify(confirmData, null, 2));
    throw new Error(`Confirm failed: ${confirmData.error}`);
  }

  console.log(`✓ Classes saved to database: ${confirmData.count} classes`);
  console.log(`✓ Message: ${confirmData.message}\n`);

  // Step 5: Verify classes via GET /api/classes
  console.log('Step 5: Verifying saved schedule via GET /api/classes...');
  const classesRes = await fetch(`${BASE_URL}/api/classes`, {
    headers: { Cookie: cookies },
  });
  const classesData = await classesRes.json();
  console.log(`✓ GET /api/classes HTTP Status: ${classesRes.status}`);
  console.log(`✓ Total classes found in personal schedule: ${classesData.totalClasses || classesData.schedules?.length || 0}`);
  if ((classesData.totalClasses || classesData.schedules?.length || 0) < 3) {
    throw new Error('Expected at least 3 classes in schedule');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL TIMETABLE OCR E2E TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

testTimetableE2E().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
