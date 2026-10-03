async function testRender() {
  console.log('Testing GET http://localhost:3000/music...');
  const res = await fetch('http://localhost:3000/music');
  console.log('HTTP Status:', res.status);
  const html = await res.text();
  console.log('HTML Length:', html.length);

  const containsHeader = html.includes('Music') || html.includes('Nivora');
  console.log('Contains Nivora Music Branding:', containsHeader);

  // Check for any legacy local audio paths in rendered HTML
  const localMusicMatches = html.match(/\/music\/[a-zA-Z0-9_-]+\.mp3/g) || [];
  const localAudioMatches = html.match(/\/audio\/[a-zA-Z0-9_-]+\.mp3/g) || [];
  console.log('Local /music/*.mp3 in HTML:', localMusicMatches);
  console.log('Local /audio/*.mp3 in HTML:', localAudioMatches);

  // Check for external HTTPS stream URLs
  const externalMatches = html.match(/https:\/\/[^\s"'<>]+\.mp3/g) || [];
  console.log(`Found ${externalMatches.length} external HTTPS audio stream URLs in SSR page.`);
  if (externalMatches.length > 0) {
    console.log('Sample external stream in HTML:', externalMatches[0]);
  }

  // Also test /music/tracks API
  const apiRes = await fetch('http://localhost:3000/api/music/tracks');
  const apiData = await apiRes.json();
  console.log('API /api/music/tracks success:', apiData.success, 'tracks count:', apiData.tracks?.length);

  if (res.status === 200 && localMusicMatches.length === 0 && localAudioMatches.length === 0) {
    console.log('✨ All SSR HTML checks PASSED with zero local audio references!');
  } else {
    console.error('❌ SSR check failed!');
    process.exit(1);
  }
}

testRender().catch(console.error);
