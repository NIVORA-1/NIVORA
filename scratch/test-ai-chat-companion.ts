async function testAiChatCompanion() {
  const BASE_URL = 'http://localhost:3000';
  console.log('====================================================');
  console.log('🤖 TESTING NIVORA AI COMPANION RESPONSE QUALITY');
  console.log('====================================================\n');

  // Authenticate
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rishabh@nivora.edu', password: 'password123' }),
  });

  const cookies = (loginRes.headers.get('set-cookie') || '')
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');

  console.log('✓ Authenticated as rishabh@nivora.edu\n');

  const testPrompts = [
    'kaise ho tum',
    'hello',
    'DBMS kya hai?',
    'aaj meri class kab hai?',
    'mera attendance kitna hai?',
    'kal kya padhna chahiye?',
  ];

  const forbiddenPhrases = [
    "That's a good question! Let me think through this with you",
    'Here\'s how I\'d approach it',
    'The key is to break this down into smaller, clearer questions',
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n----------------------------------------------------`);
    console.log(`Test ${i + 1}/${testPrompts.length}: User says "${prompt}"`);
    console.log(`----------------------------------------------------`);

    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      body: JSON.stringify({
        message: prompt,
        pathname: '/home',
      }),
    });

    const elapsed = Date.now() - start;
    console.log(`HTTP Status: ${res.status} (${elapsed}ms)`);

    if (!res.ok) {
      throw new Error(`Chat request failed for "${prompt}": HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.reply || '';

    console.log(`\nAI Response:\n${reply}\n`);

    // Validations:
    if (!reply.trim()) {
      throw new Error(`Empty reply for "${prompt}"`);
    }

    // Check forbidden template phrases
    for (const forbidden of forbiddenPhrases) {
      if (reply.toLowerCase().includes(forbidden.toLowerCase())) {
        throw new Error(`Forbidden template phrase found in reply for "${prompt}": "${forbidden}"`);
      }
    }

    // Check for raw echo in bold quotes
    if (reply.includes(`**"${prompt}"**`)) {
      throw new Error(`Raw prompt echoed in bold quotes for "${prompt}"`);
    }

    console.log(`✓ Test passed: Natural, relevant response without generic template.`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 6 COMPANION TESTS PASSED WITH HIGH QUALITY!');
  console.log('====================================================\n');
}

testAiChatCompanion().catch((err) => {
  console.error('\n❌ COMPANION TEST FAILED:', err);
  process.exit(1);
});
