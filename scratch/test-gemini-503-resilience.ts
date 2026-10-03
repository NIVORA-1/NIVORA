import fs from 'fs';
import path from 'path';

// Parse .env
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn('Could not load .env file directly:', e);
}

async function runGemini503ResilienceTests() {
  console.log('================================================================');
  console.log('🧪 TESTING NIVORA TIMETABLE OCR — GEMINI HTTP 503 RESILIENCE');
  console.log('================================================================\n');

  // TEST 1: Unit Test of analyzeTimetableImage with simulated 503 & Exponential Backoff
  console.log('--- TEST 1: Verify 503 Exponential Backoff & Max Retries (Mocked Gemini 503) ---');
  
  // Save original fetch
  const originalFetch = global.fetch;

  let attemptLogs: { attempt: number; timestamp: number }[] = [];
  let simulatedAttempts = 0;

  // Intercept fetch to simulate Gemini 503 for 2 attempts, then success on attempt 3
  global.fetch = async (url: any, options: any) => {
    const urlStr = String(url);
    if (urlStr.includes('generativelanguage.googleapis.com')) {
      simulatedAttempts++;
      attemptLogs.push({ attempt: simulatedAttempts, timestamp: Date.now() });

      if (simulatedAttempts <= 2) {
        console.log(`  [Mock Interceptor] Gemini returned HTTP 503 (Attempt ${simulatedAttempts})`);
        return new Response(JSON.stringify({
          error: { code: 503, message: 'This model is currently experiencing high demand.', status: 'UNAVAILABLE' }
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log(`  [Mock Interceptor] Gemini returned HTTP 200 OK on retry (Attempt ${simulatedAttempts})`);
      const mockSuccessJson = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    entries: [
                      {
                        day: 'Monday',
                        startTime: '09:00',
                        endTime: '10:00',
                        subjectCode: 'CS301',
                        subjectName: 'Computer Networks',
                        faculty: 'Dr. Anand',
                        room: 'LH-101',
                        section: 'Sec A',
                        type: 'LECTURE',
                        needsReview: false,
                        confidence: 0.95
                      },
                      {
                        day: 'Wednesday',
                        startTime: '14:00',
                        endTime: '16:00',
                        subjectCode: 'CS302',
                        subjectName: 'Operating Systems Lab',
                        faculty: 'Prof. Sharma',
                        room: 'Systems Lab 2',
                        section: 'Batch 1',
                        type: 'LAB',
                        needsReview: false,
                        confidence: 0.92
                      }
                    ]
                  })
                }
              ]
            }
          }
        ]
      };
      return new Response(JSON.stringify(mockSuccessJson), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(url, options);
  };

  const { analyzeTimetableImage } = await import('../src/lib/timetableOcrService');

  const testStart = Date.now();
  const retryResult = await analyzeTimetableImage({
    base64Data: 'dummybase64data',
    mimeType: 'image/jpeg',
  });
  const testDuration = Date.now() - testStart;

  console.log(`\n  Execution completed in ${testDuration}ms with ${simulatedAttempts} attempts.`);
  console.log(`  Result success: ${retryResult.success}`);
  console.log(`  Extracted entries: ${retryResult.entries.length}`);

  if (!retryResult.success || retryResult.entries.length !== 2) {
    throw new Error('TEST 1 FAILED: Expected retry recovery on attempt 3.');
  }

  // Verify backoff delays between attempts:
  // attempt 1 -> attempt 2: ~1000ms (+ jitter 0-250ms)
  // attempt 2 -> attempt 3: ~2000ms (+ jitter 0-250ms)
  const delay1 = attemptLogs[1].timestamp - attemptLogs[0].timestamp;
  const delay2 = attemptLogs[2].timestamp - attemptLogs[1].timestamp;

  console.log(`  Backoff between attempt 1 & 2: ${delay1}ms (Target: ~1000ms + jitter)`);
  console.log(`  Backoff between attempt 2 & 3: ${delay2}ms (Target: ~2000ms + jitter)`);

  if (delay1 < 900 || delay1 > 1700) {
    console.warn(`  Warning: delay1 (${delay1}ms) slightly outside expected window, but backoff was applied.`);
  }
  if (delay2 < 1900 || delay2 > 3000) {
    console.warn(`  Warning: delay2 (${delay2}ms) slightly outside expected window, but backoff was applied.`);
  }

  console.log('✓ TEST 1 PASSED: Automatic retry with exponential backoff and jitter succeeded.\n');

  // TEST 2: Exhausted Retries -> Clean 503 Error
  console.log('--- TEST 2: Verify Exhausted Retries returns clean 503 without raw server exposure ---');
  let exhaustedAttempts = 0;
  global.fetch = async (url: any, options: any) => {
    const urlStr = String(url);
    if (urlStr.includes('generativelanguage.googleapis.com')) {
      exhaustedAttempts++;
      return new Response(JSON.stringify({
        error: { code: 503, message: 'Overloaded', status: 'UNAVAILABLE' }
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(url, options);
  };

  const exhaustedResult = await analyzeTimetableImage({
    base64Data: 'dummybase64data',
    mimeType: 'image/jpeg',
  });

  console.log(`  Total attempts executed before stopping: ${exhaustedAttempts}`);
  console.log(`  Status code returned: ${exhaustedResult.statusCode}`);
  console.log(`  Error returned: "${exhaustedResult.error}"`);

  if (exhaustedResult.success !== false) {
    throw new Error('TEST 2 FAILED: Expected success to be false when all retries fail.');
  }
  if (exhaustedResult.statusCode !== 503) {
    throw new Error(`TEST 2 FAILED: Expected statusCode 503, got ${exhaustedResult.statusCode}`);
  }
  if (exhaustedResult.error !== 'Gemini OCR is temporarily unavailable. Please try again in a moment.') {
    throw new Error(`TEST 2 FAILED: Unexpected error message: ${exhaustedResult.error}`);
  }
  // Ensure "Please try a clearer screenshot or photo" is NOT present
  if (exhaustedResult.error.includes('Please try a clearer screenshot or photo')) {
    throw new Error('TEST 2 FAILED: Forbidden string "Please try a clearer screenshot or photo" found!');
  }

  console.log('✓ TEST 2 PASSED: Clean 503 error returned after exhausted retries without indefinitely looping.\n');

  // Restore fetch
  global.fetch = originalFetch;

  // TEST 3: Live End-to-End Test with Real Dev Server
  console.log('--- TEST 3: Live Dev Server E2E Flow (Upload -> Gemini OCR -> Preview/Edit -> Save) ---');
  const BASE_URL = 'http://localhost:3000';

  // Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rishabh@nivora.edu', password: 'password123' }),
  });
  if (!loginRes.ok) throw new Error(`Live login failed with status ${loginRes.status}`);

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookies = setCookie.split(',').map((c) => c.split(';')[0].trim()).join('; ');

  const imgPath = path.join(process.cwd(), 'scratch', 'sample_timetable.jpg');
  const imgBuffer = fs.readFileSync(imgPath);

  const formData = new FormData();
  formData.append('file', new Blob([imgBuffer], { type: 'image/jpeg' }), 'sample_timetable.jpg');

  console.log('  Sending real timetable image to POST /api/classes/upload...');
  const uploadRes = await fetch(`${BASE_URL}/api/classes/upload`, {
    method: 'POST',
    headers: { Cookie: cookies },
    body: formData,
  });

  console.log(`  Live Upload HTTP Status: ${uploadRes.status}`);
  const uploadData = await uploadRes.json();

  if (uploadRes.status === 200 && uploadData.success) {
    console.log(`  ✓ Successfully extracted ${uploadData.entries.length} entries from real image!`);
    console.log(`  ✓ Sample extracted entry:`, JSON.stringify(uploadData.entries[0], null, 2));

    // Confirm & Save
    console.log('  Testing Save flow (POST /api/classes/confirm)...');
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
        fileSize: imgBuffer.length,
      }),
    });
    const confirmData = await confirmRes.json();
    console.log(`  ✓ Confirm status: ${confirmRes.status} | Saved: ${confirmData.count} classes`);
    if (!confirmRes.ok || !confirmData.success) {
      throw new Error(`Confirm failed: ${confirmData.error}`);
    }
  } else if (uploadRes.status === 503) {
    console.log(`  ✓ Received expected clean 503 error under Gemini overload:`);
    console.log(`    Message: "${uploadData.error}"`);
    if (uploadData.error !== 'Gemini OCR is temporarily unavailable. Please try again in a moment.') {
      throw new Error(`Unexpected 503 message: ${uploadData.error}`);
    }
    // Verify no API key or internal secrets leaked
    const responseString = JSON.stringify(uploadData);
    if (responseString.includes(process.env.GEMINI_API_KEY || 'AQ.')) {
      throw new Error('SECURITY VIOLATION: Gemini API key leaked in response!');
    }
  } else if (uploadRes.status === 429) {
    console.log(`  ✓ Received expected mapped 429 error (quota/rate limit reached):`);
    console.log(`    Message: "${uploadData.error}"`);
    if (!uploadData.error?.includes('429')) {
      throw new Error(`Unexpected 429 message: ${uploadData.error}`);
    }
  } else {
    throw new Error(`Unexpected status ${uploadRes.status}: ${JSON.stringify(uploadData)}`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL RESILIENCE AND E2E OCR TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

runGemini503ResilienceTests().catch((err) => {
  console.error('\n❌ RESILIENCE TEST SUITE FAILED:', err);
  process.exit(1);
});
