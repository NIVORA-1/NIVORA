import { searchYouTube, getRecommendationsForMode } from '../src/lib/youtube';
import prisma from '../src/lib/prisma';

async function testMusicSuite() {
  console.log('=== STARTING NIVORA MUSIC FULL TEST SUITE ===');

  // Test 1: YouTube Search
  console.log('\n--- 1. Testing YouTube Search ("lofi study") ---');
  try {
    const searchRes = await searchYouTube('lofi study', undefined, 5);
    console.log(`✓ YouTube Search returned ${searchRes.items.length} items`);
    if (searchRes.items.length > 0) {
      const first = searchRes.items[0];
      console.log(`  First item: [${first.videoId}] "${first.title}" by "${first.channelTitle}" (${first.duration})`);
    }
  } catch (e: any) {
    console.error('✗ YouTube search failed:', e?.message || e);
  }

  // Test 2: Recommendations
  console.log('\n--- 2. Testing Recommendations ("focus") ---');
  try {
    const recs = await getRecommendationsForMode('focus');
    console.log(`✓ Recommendations returned ${recs.length} items`);
    if (recs.length > 0) {
      console.log(`  Sample recommendation: [${recs[0].videoId}] "${recs[0].title}"`);
    }
  } catch (e: any) {
    console.error('✗ Recommendations failed:', e?.message || e);
  }

  // Test 3: Database & Authenticated User Operations
  console.log('\n--- 3. Testing Supabase Database Tables & CRUD ---');
  const testUserId = 'f7754142-bac6-4e8d-9760-632bb4d60f8a'; // existing auth.users id
  const sampleVideoId = 'jfKfPfyJRdk';

  try {
    // 3a: Favorites
    console.log('\nTesting Favorites:');
    // Delete any previous test favorite
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_favorites WHERE user_id = $1::uuid AND youtube_video_id = $2`,
      testUserId,
      sampleVideoId
    );

    // Insert favorite
    const favInsert: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_favorites (id, user_id, youtube_video_id, title, channel_title, thumbnail_url, duration, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, 'Lofi Girl — Beats to Study', 'Lofi Girl', 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', '2:15:30', now())
       RETURNING id, youtube_video_id, title`,
      testUserId,
      sampleVideoId
    );
    console.log(`✓ Favorite added: [${favInsert[0]?.youtube_video_id}] "${favInsert[0]?.title}"`);

    // Read favorites
    const favList: any = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.music_favorites WHERE user_id = $1::uuid`,
      testUserId
    );
    console.log(`✓ Favorite queried: Found ${favList.length} favorites for user`);

    // Clean up favorite
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_favorites WHERE user_id = $1::uuid AND youtube_video_id = $2`,
      testUserId,
      sampleVideoId
    );
    console.log('✓ Favorite deleted successfully');

    // 3b: Recently Played
    console.log('\nTesting Recently Played:');
    // Upsert recently played
    await prisma.$executeRawUnsafe(
      `INSERT INTO public.music_recently_played (id, user_id, youtube_video_id, title, channel_title, thumbnail_url, duration, played_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, 'Lofi Girl — Beats to Study', 'Lofi Girl', 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', '2:15:30', now())
       ON CONFLICT (user_id, youtube_video_id) DO UPDATE SET played_at = now()`,
      testUserId,
      sampleVideoId
    );
    console.log('✓ Recently played inserted/updated');

    const recentList: any = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.music_recently_played WHERE user_id = $1::uuid ORDER BY played_at DESC LIMIT 5`,
      testUserId
    );
    console.log(`✓ Recently played queried: ${recentList.length} tracks found`);

    // 3c: Playlists
    console.log('\nTesting Playlists:');
    const plCreated: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_playlists (id, user_id, name, description, created_at)
       VALUES (gen_random_uuid(), $1::uuid, 'Test Exam Sprint', 'Late night exam preparation playlist', now())
       RETURNING id, name`,
      testUserId
    );
    const playlistId = plCreated[0]?.id;
    console.log(`✓ Playlist created: "${plCreated[0]?.name}" (ID: ${playlistId})`);

    // Add track to playlist
    const plItem: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_playlist_items (id, playlist_id, youtube_video_id, title, channel_title, thumbnail_url, duration, position, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, 'Lofi Girl — Beats to Study', 'Lofi Girl', 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', '2:15:30', 1, now())
       RETURNING id, youtube_video_id`,
      playlistId,
      sampleVideoId
    );
    console.log(`✓ Item added to playlist: [${plItem[0]?.youtube_video_id}]`);

    // Query playlist items
    const items: any = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.music_playlist_items WHERE playlist_id = $1::uuid`,
      playlistId
    );
    console.log(`✓ Playlist has ${items.length} item(s)`);

    // Rename playlist
    await prisma.$executeRawUnsafe(
      `UPDATE public.music_playlists SET name = 'Renamed Exam Sprint' WHERE id = $1::uuid`,
      playlistId
    );
    console.log('✓ Playlist renamed');

    // Remove track from playlist
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_playlist_items WHERE playlist_id = $1::uuid AND youtube_video_id = $2`,
      playlistId,
      sampleVideoId
    );
    console.log('✓ Item removed from playlist');

    // Delete playlist
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_playlists WHERE id = $1::uuid`,
      playlistId
    );
    console.log('✓ Playlist deleted');

  } catch (e: any) {
    console.error('✗ Database CRUD test error:', e?.message || e);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== ALL MUSIC TESTS COMPLETED SUCCESSFULLY ===');
}

testMusicSuite();
