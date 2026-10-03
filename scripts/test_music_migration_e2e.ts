import prisma from '../src/lib/prisma';
import { validateAudioUrl, validateCoverUrl } from '../src/lib/audioUrlValidator';
import { TRACKS, mapDbTrackToTrack } from '../src/lib/musicData';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('===========================================================');
  console.log('🎵 NIVORA MUSIC — EXTERNAL AUDIO URL MIGRATION VERIFICATION');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: API Endpoint & Track Data Model (STEP 1 & 2)
  // -------------------------------------------------------------
  console.log('📋 Test Suite 1: API Route & Target Architecture Data Model');

  const res = await fetch(`${BASE_URL}/api/music/tracks`);
  assert(res.ok, `GET /api/music/tracks returned HTTP ${res.status}`);

  const data = await res.json();
  assert(data.success === true, 'API returned success: true');
  assert(Array.isArray(data.tracks) && data.tracks.length > 0, `Returned ${data.tracks?.length} tracks`);

  // Verify target architecture fields on every single returned track
  let allHaveValidFields = true;
  let allAudioUrlsAreExternal = true;
  let zeroLocalAudioPaths = true;

  for (const track of data.tracks) {
    if (!track.id || !track.title || !track.artist || typeof track.durationSec !== 'number') {
      allHaveValidFields = false;
    }
    const audioUrl = track.audioUrl || '';
    if (audioUrl.startsWith('/music') || audioUrl.startsWith('/audio') || audioUrl.startsWith('file://')) {
      zeroLocalAudioPaths = false;
    }
    if (!audioUrl.startsWith('https://') && !audioUrl.startsWith('internal://synthesize/')) {
      allAudioUrlsAreExternal = false;
    }
  }

  assert(allHaveValidFields, 'Every track contains required metadata: id, title, artist, durationSec');
  assert(zeroLocalAudioPaths, 'Zero tracks reference local /music/ or /audio/ paths');
  assert(allAudioUrlsAreExternal, 'All track audioUrls use external HTTPS URLs or internal synthesizer protocol');

  // -------------------------------------------------------------
  // TEST SUITE 2: External URL Streaming & Range Requests (STEP 3 & 4)
  // -------------------------------------------------------------
  console.log('\n🌐 Test Suite 2: External Audio URL Streaming & Range Support');

  const sampleTrack = data.tracks.find((t: any) => t.audioUrl && t.audioUrl.startsWith('https://'));
  assert(Boolean(sampleTrack), `Found external audio track: "${sampleTrack?.title}"`);

  if (sampleTrack) {
    console.log(`    Testing external URL: ${sampleTrack.audioUrl.slice(0, 75)}...`);
    try {
      const headRes = await fetch(sampleTrack.audioUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NivoraMusic/1.0',
        },
      });

      assert(
        headRes.status === 200 || headRes.status === 206,
        `External stream responds with HTTP ${headRes.status}`
      );

      const contentType = headRes.headers.get('content-type') || '';
      assert(
        contentType.includes('audio') || contentType.includes('mpeg') || contentType.includes('octet-stream'),
        `Content-Type is audio stream (${contentType})`
      );

      const acceptRanges = headRes.headers.get('accept-ranges');
      assert(
        acceptRanges === 'bytes',
        'External server supports HTTP 206 partial content range requests'
      );
    } catch (err: any) {
      assert(false, `External audio URL check failed: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: Audio & Cover URL Validation (STEP 4 & 6)
  // -------------------------------------------------------------
  console.log('\n🔒 Test Suite 3: URL Validation & Security Rules');

  // HTTPS requirement
  const validHttps = validateAudioUrl('https://upload.wikimedia.org/wikipedia/commons/1/1e/Audionautix.mp3');
  assert(validHttps.isValid === true && Boolean(validHttps.cleanUrl), 'Accepts valid HTTPS URL');

  const whitespaceUrl = validateAudioUrl('   https://upload.wikimedia.org/audio.mp3   \n');
  assert(whitespaceUrl.isValid === true && whitespaceUrl.cleanUrl === 'https://upload.wikimedia.org/audio.mp3', 'Trims leading/trailing whitespace correctly');

  const insecureHttp = validateAudioUrl('http://insecure-domain.com/audio.mp3');
  assert(insecureHttp.isValid === false, 'Rejects insecure http:// URL');

  const localPath1 = validateAudioUrl('/music/song.mp3');
  assert(localPath1.isValid === false, 'Rejects local /music/song.mp3 path');

  const localPath2 = validateAudioUrl('/audio/library/track.mp3');
  assert(localPath2.isValid === false, 'Rejects local /audio/library/ path');

  const emptyUrl = validateAudioUrl('');
  assert(emptyUrl.isValid === false, 'Rejects empty audio URL');

  const malformedUrl = validateAudioUrl('https://not-a-valid-domain');
  assert(malformedUrl.isValid === false, 'Rejects malformed domain structure');

  // Cover image validation
  const validCover = validateCoverUrl('https://images.unsplash.com/photo-1518709268805');
  assert(validCover.isValid === true, 'Accepts valid HTTPS cover URL');

  const insecureCover = validateCoverUrl('http://insecure-cover.com/pic.jpg');
  assert(insecureCover.isValid === false, 'Rejects insecure HTTP cover image URL');

  // -------------------------------------------------------------
  // TEST SUITE 4: Music Admin & Database Persistence (STEP 6)
  // -------------------------------------------------------------
  console.log('\n💾 Test Suite 4: Music Admin & Database Persistence (POST/PATCH/DELETE)');

  const testTrackPayload = {
    title: 'E2E Automated Study Soundscape',
    artist: 'Antigravity Test Artist',
    album: 'Nivora Test Vol. 1',
    genre: 'Lo-Fi Focus',
    category: 'lofi',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chill_Wave_%28ISRC_USUAN1600048%29.mp3',
    duration: '04:00',
  };

  const createRes = await fetch(`${BASE_URL}/api/music/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testTrackPayload),
  });

  assert(createRes.ok, `POST /api/music/tracks returned HTTP ${createRes.status}`);
  const createData = await createRes.json();
  assert(createData.success === true, 'Track created successfully with success: true');
  assert(Boolean(createData.track?.id), `Created track ID: ${createData.track?.id}`);

  const createdId = createData.track?.id;

  if (createdId) {
    // Verify persistence in PostgreSQL directly via Prisma
    const dbRecord = await prisma.musicTrack.findUnique({
      where: { id: createdId },
    });

    assert(Boolean(dbRecord), 'Track record exists in PostgreSQL database');
    assert(dbRecord?.title === testTrackPayload.title, 'Database record matches title');
    assert(dbRecord?.audioUrl === testTrackPayload.audioUrl, 'Database record persists external HTTPS audioUrl');
    assert(dbRecord?.artworkUrl === testTrackPayload.coverUrl, 'Database record persists external coverUrl');

    // Test PATCH category update
    const patchRes = await fetch(`${BASE_URL}/api/music/tracks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [createdId], category: 'ambient' }),
    });
    assert(patchRes.ok, 'PATCH category update returned 200 OK');

    const updatedRecord = await prisma.musicTrack.findUnique({ where: { id: createdId } });
    assert(updatedRecord?.category === 'ambient', 'Category was updated in database to "ambient"');

    // Test DELETE
    const deleteRes = await fetch(`${BASE_URL}/api/music/tracks?id=${encodeURIComponent(createdId)}`, {
      method: 'DELETE',
    });
    assert(deleteRes.ok, 'DELETE returned 200 OK');

    const deletedRecord = await prisma.musicTrack.findUnique({ where: { id: createdId } });
    assert(deletedRecord === null, 'Track was deleted cleanly from database');
  }

  // -------------------------------------------------------------
  // TEST SUITE 5: Rejection of Invalid Injections & File Uploads
  // -------------------------------------------------------------
  console.log('\n🛡️ Test Suite 5: Rejecting Local MP3 Hosting / Insecure Inputs');

  const badUrlRes = await fetch(`${BASE_URL}/api/music/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Bad URL Track',
      audioUrl: 'http://not-secure.com/track.mp3',
    }),
  });
  assert(badUrlRes.status === 400, `Rejects insecure HTTP audio URL with HTTP 400 (got ${badUrlRes.status})`);

  const localFileRes = await fetch(`${BASE_URL}/api/music/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Local MP3 Track',
      audioUrl: '/music/focus/local.mp3',
    }),
  });
  assert(localFileRes.status === 400, `Rejects local MP3 path with HTTP 400 (got ${localFileRes.status})`);

  const emptyTitleRes = await fetch(`${BASE_URL}/api/music/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '',
      audioUrl: 'https://upload.wikimedia.org/audio.mp3',
    }),
  });
  assert(emptyTitleRes.status === 400, `Rejects empty title with HTTP 400 (got ${emptyTitleRes.status})`);

  // -------------------------------------------------------------
  // TEST SUITE 6: Client Seed Data & Mapper Integrity (STEP 7)
  // -------------------------------------------------------------
  console.log('\n🎼 Test Suite 6: Curated Built-in Track Data & Mapper Integrity');

  assert(TRACKS.length > 0, `Built-in TRACKS catalog contains ${TRACKS.length} tracks`);

  let allPresetTracksExternal = true;
  for (const t of TRACKS) {
    const src = t.audioUrl || t.audioSrc;
    if (src && (src.startsWith('/music') || src.startsWith('/audio') || src.startsWith('file://'))) {
      allPresetTracksExternal = false;
      console.error(`Preset track has local path: ${t.id} -> ${src}`);
    }
  }
  assert(allPresetTracksExternal, 'All built-in preset tracks use external HTTPS URLs or procedural soundscapes');

  // Verify mapDbTrackToTrack function
  const mapped = mapDbTrackToTrack({
    id: 'test-123',
    title: 'Mapper Test',
    artist: 'Test Artist',
    audioUrl: 'https://upload.wikimedia.org/sample.mp3',
    coverUrl: 'https://images.unsplash.com/sample.jpg',
    durationSec: 210,
    category: 'focus',
  });

  assert(mapped.audioUrl === 'https://upload.wikimedia.org/sample.mp3', 'mapDbTrackToTrack maps audioUrl correctly');
  assert(mapped.audioSrc === 'https://upload.wikimedia.org/sample.mp3', 'mapDbTrackToTrack populates audioSrc alias');
  assert(mapped.coverUrl === 'https://images.unsplash.com/sample.jpg', 'mapDbTrackToTrack maps coverUrl correctly');
  assert(mapped.duration === 210, 'mapDbTrackToTrack preserves duration in seconds');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n===========================================================');
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
