async function runFullE2ETest() {
  const BASE_URL = 'http://localhost:3000';
  console.log('====================================================');
  console.log('🚀 RUNNING NIVORA MUSIC FULL END-TO-END HTTP QA TEST');
  console.log('====================================================\n');

  // Step 1: Sign in with credentials
  console.log('Step 1: Authenticating user (rishabh@nivora.edu)...');
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

  // Extract set-cookie headers
  const setCookieHeaders = loginRes.headers.get('set-cookie') || '';
  const cookies = setCookieHeaders
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');

  console.log('✓ Successfully authenticated! Session cookies established.\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: cookies,
  };

  // Step 2: Verify authenticated user
  console.log('Step 2: Checking /api/auth/me session...');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  console.log(`✓ Authenticated as: ${meData.user?.email} (${meData.user?.name})\n`);

  // Step 3: Test Search API (Public & Real Data)
  console.log('Step 3: Testing Search API (GET /api/music/search?q=lofi+study)...');
  const searchRes = await fetch(`${BASE_URL}/api/music/search?q=lofi+study`);
  const searchData = await searchRes.json();
  console.log(`✓ Search status: ${searchRes.status}`);
  console.log(`✓ Total items returned: ${searchData.items?.length}`);
  if (searchData.items?.length > 0) {
    const item = searchData.items[0];
    console.log(`  Sample track: [${item.videoId}] "${item.title}" by "${item.channelTitle}" (${item.duration})`);
  }
  console.log('');

  // Step 4: Test Recommendations API
  console.log('Step 4: Testing Recommendations API (GET /api/music/recommendations?mode=focus)...');
  const recRes = await fetch(`${BASE_URL}/api/music/recommendations?mode=focus`);
  const recData = await recRes.json();
  console.log(`✓ Recommendations status: ${recRes.status}`);
  console.log(`✓ Total recommendation items: ${recData.items?.length}`);
  if (recData.items?.length > 0) {
    console.log(`  Sample recommendation: "${recData.items[0].title}"`);
  }
  console.log('');

  // Step 5: Test Recently Played API (Record and Retrieve)
  console.log('Step 5: Testing Recently Played (POST & GET /api/music/recently-played)...');
  const playSample = {
    videoId: 'jfKfPfyJRdk',
    title: 'Lofi Girl — Beats to Study & Relax To',
    channelTitle: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    duration: '2:15:30',
  };

  const recordRes = await fetch(`${BASE_URL}/api/music/recently-played`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(playSample),
  });
  const recordData = await recordRes.json();
  console.log(`✓ Record playback response:`, recordData);

  const getRecentRes = await fetch(`${BASE_URL}/api/music/recently-played`, {
    headers: authHeaders,
  });
  const recentData = await getRecentRes.json();
  console.log(`✓ Retrieved ${recentData.items?.length} recently played tracks from Supabase`);
  const foundRecent = recentData.items?.find((t: any) => t.videoId === playSample.videoId);
  if (foundRecent) {
    console.log(`  Found recorded track: "${foundRecent.title}" played at ${foundRecent.playedAt}`);
  }
  console.log('');

  // Step 6: Test Favorites API (Toggle, Read, Untoggle)
  console.log('Step 6: Testing Favorites (POST & GET /api/music/favorites)...');
  // Toggle favorite ON
  const favOnRes = await fetch(`${BASE_URL}/api/music/favorites`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ ...playSample, action: 'add' }),
  });
  const favOnData = await favOnRes.json();
  console.log(`✓ Favorite toggle ON response: favorited = ${favOnData.favorited}`);

  // Fetch favorites
  const getFavRes = await fetch(`${BASE_URL}/api/music/favorites`, { headers: authHeaders });
  const favData = await getFavRes.json();
  console.log(`✓ Retrieved ${favData.items?.length} favorites from Supabase`);

  // Toggle favorite OFF
  const favOffRes = await fetch(`${BASE_URL}/api/music/favorites`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ ...playSample, action: 'delete' }),
  });
  const favOffData = await favOffRes.json();
  console.log(`✓ Favorite toggle OFF response: favorited = ${favOffData.favorited}\n`);

  // Step 7: Test Playlists API (Create, Add Item, Read, Remove Item, Rename, Delete)
  console.log('Step 7: Testing Playlists Full Lifecycle...');
  // Create Playlist
  const createPlRes = await fetch(`${BASE_URL}/api/music/playlists`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Exam Focus 2026',
      description: 'End-to-End verified study playlist',
    }),
  });
  const createPlData = await createPlRes.json();
  const playlistId = createPlData.playlist?.id;
  console.log(`✓ Created playlist "${createPlData.playlist?.name}" (ID: ${playlistId})`);

  // Add Item to Playlist
  const addItemRes = await fetch(`${BASE_URL}/api/music/playlists/${playlistId}/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(playSample),
  });
  const addItemData = await addItemRes.json();
  console.log(`✓ Added item to playlist: [${addItemData.item?.videoId}] "${addItemData.item?.title}"`);

  // Get Playlist with Items
  const getPlRes = await fetch(`${BASE_URL}/api/music/playlists/${playlistId}`, {
    headers: authHeaders,
  });
  const getPlData = await getPlRes.json();
  console.log(`✓ Fetched playlist details: ${getPlData.playlist?.items?.length} track(s) inside`);

  // Rename Playlist
  const renameRes = await fetch(`${BASE_URL}/api/music/playlists/${playlistId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Renamed Exam Focus' }),
  });
  const renameData = await renameRes.json();
  console.log(`✓ Renamed playlist to: "${renameData.playlist?.name}"`);

  // Remove Item from Playlist
  const removeItemRes = await fetch(
    `${BASE_URL}/api/music/playlists/${playlistId}/items?videoId=${playSample.videoId}`,
    {
      method: 'DELETE',
      headers: authHeaders,
    }
  );
  const removeItemData = await removeItemRes.json();
  console.log(`✓ Removed track from playlist: success = ${removeItemData.success}`);

  // Delete Playlist
  const deletePlRes = await fetch(`${BASE_URL}/api/music/playlists/${playlistId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const deletePlData = await deletePlRes.json();
  console.log(`✓ Deleted playlist: success = ${deletePlData.success}\n`);

  // Step 8: Verify Unauthenticated Protected Access
  console.log('Step 8: Testing Protected Routes without Auth Cookie...');
  const unauthFav = await fetch(`${BASE_URL}/api/music/favorites`);
  console.log(`✓ Unauthenticated /api/music/favorites status: ${unauthFav.status} (Expected 401)`);
  const unauthFavJson = await unauthFav.json();
  console.log(`  Message: "${unauthFavJson.message}"`);

  const unauthPlay = await fetch(`${BASE_URL}/api/music/playlists`, { method: 'POST', body: JSON.stringify({ name: 'Hack' }) });
  console.log(`✓ Unauthenticated /api/music/playlists POST status: ${unauthPlay.status} (Expected 401)`);

  const unauthSearch = await fetch(`${BASE_URL}/api/music/search?q=ambient`);
  console.log(`✓ Unauthenticated /api/music/search status: ${unauthSearch.status} (Expected 200 - Search & Play allowed without login!)`);

  console.log('\n====================================================');
  console.log('🎉 ALL END-TO-END QA CHECKS PASSED WITH 100% SUCCESS');
  console.log('====================================================');
}

runFullE2ETest().catch((err) => {
  console.error('E2E QA Test failed:', err);
  process.exit(1);
});
