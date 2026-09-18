import fs from 'fs';
import path from 'path';
import { SeedCategory, SeededTrackMetadata, CandidateTrack, SeedSummary } from './types';
import { sanitizeFilename, computeFileHash, isValidAudioFile, checkDuplicate } from './validator';
import { downloadFile } from './downloader';
import { fetchWikimediaTracks, getBinauralDefinitions } from './sources';
import { generateBinauralWavFile } from './binauralGenerator';

// Target categories and desired track counts (~65 total)
const CATEGORY_TARGETS: Record<SeedCategory, number> = {
  focus: 10,
  lofi: 10,
  ambient: 10,
  classical: 10,
  nature: 10,
  binaural: 10,
  campus: 5,
};

// High-resolution curated cover artwork mapped by category for zero broken images
const CATEGORY_ARTWORK: Record<SeedCategory, string> = {
  focus: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  lofi: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  ambient: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
  classical: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  nature: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
  binaural: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  campus: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
};

const MUSIC_DIR_NAME = 'nivora-music';
const LIBRARY_FILE_NAME = 'library.json';

/**
 * Main Nivora Music Seeder entry point
 */
export async function runMusicSeeder(options: { updateOnly?: boolean } = {}) {
  const startTime = Date.now();
  const cwd = process.cwd();
  const rootMusicDir = path.join(cwd, MUSIC_DIR_NAME);
  const libraryPath = path.join(rootMusicDir, LIBRARY_FILE_NAME);

  console.log('====================================================');
  console.log(`🎶 Starting Nivora Music Seeder [${options.updateOnly ? 'UPDATE MODE' : 'SEED MODE'}]`);
  console.log('====================================================');

  // 1. Create base and category directories
  if (!fs.existsSync(rootMusicDir)) {
    fs.mkdirSync(rootMusicDir, { recursive: true });
  }

  const categories = Object.keys(CATEGORY_TARGETS) as SeedCategory[];
  for (const cat of categories) {
    const catDir = path.join(rootMusicDir, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
  }

  // Also ensure public/music/<category> mirrors exist for direct static serving
  const publicMusicDir = path.join(cwd, 'public', 'music');
  if (!fs.existsSync(publicMusicDir)) {
    fs.mkdirSync(publicMusicDir, { recursive: true });
  }
  for (const cat of categories) {
    const pubCatDir = path.join(publicMusicDir, cat);
    if (!fs.existsSync(pubCatDir)) {
      fs.mkdirSync(pubCatDir, { recursive: true });
    }
  }

  // 2. Load existing library.json if present
  let existingLibrary: SeededTrackMetadata[] = [];
  if (fs.existsSync(libraryPath)) {
    try {
      const raw = fs.readFileSync(libraryPath, 'utf8');
      existingLibrary = JSON.parse(raw);
      if (!Array.isArray(existingLibrary)) existingLibrary = [];
      console.log(`Loaded ${existingLibrary.length} existing tracks from ${LIBRARY_FILE_NAME}`);
    } catch {
      console.warn(`Could not parse existing ${LIBRARY_FILE_NAME}, starting fresh.`);
    }
  }

  const updatedLibrary: SeededTrackMetadata[] = [...existingLibrary];
  const summary: SeedSummary = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    categoryCounts: {
      focus: 0,
      lofi: 0,
      ambient: 0,
      classical: 0,
      nature: 0,
      binaural: 0,
      campus: 0,
    },
  };

  // Count existing valid tracks per category
  for (const cat of categories) {
    const catDir = path.join(rootMusicDir, cat);
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir).filter((f) => isValidAudioFile(path.join(catDir, f)));
      summary.categoryCounts[cat] = files.length;
    }
  }

  // 3. Process each category
  for (const category of categories) {
    const targetCount = CATEGORY_TARGETS[category];
    const currentCount = summary.categoryCounts[category] || 0;
    const needed = Math.max(0, targetCount - currentCount);

    console.log(`\n📁 Category: [${category.toUpperCase()}] — Have: ${currentCount}, Target: ${targetCount}, Needed: ${needed}`);

    if (needed === 0 && options.updateOnly) {
      console.log(`   ✓ Category already satisfied. Skipping.`);
      continue;
    }

    // Fetch candidate tracks from legal sources
    const candidates = await gatherCandidatesForCategory(category, targetCount + 6);
    console.log(`   Found ${candidates.length} legal candidates from approved APIs`);

    for (const candidate of candidates) {
      if (summary.categoryCounts[category] >= targetCount) {
        break; // Target reached
      }

      const safeFilename = sanitizeFilename(
        candidate.suggestedFilename || `${candidate.title}-${candidate.artist}`,
        path.extname(candidate.suggestedFilename) || (category === 'binaural' ? '.wav' : '.mp3')
      );

      const targetPath = path.join(rootMusicDir, category, safeFilename);
      const publicTargetPath = path.join(publicMusicDir, category, safeFilename);

      // Check duplicate
      const dupCheck = checkDuplicate(candidate, updatedLibrary, targetPath);
      if (dupCheck.isDuplicate) {
        summary.skipped++;
        // If file exists on disk but wasn't in updatedLibrary, ensure metadata record is added
        const alreadyInLib = updatedLibrary.some((t) => t.audio === `/music/${category}/${safeFilename}`);
        if (!alreadyInLib && fs.existsSync(targetPath) && isValidAudioFile(targetPath)) {
          const stat = fs.statSync(targetPath);
          updatedLibrary.push({
            id: candidate.id,
            title: candidate.title,
            artist: candidate.artist,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            audio: `/music/${category}/${safeFilename}`,
            source: candidate.source,
            sourceUrl: candidate.sourceUrl,
            audioUrl: candidate.audioUrl,
            license: candidate.license,
            licenseUrl: candidate.licenseUrl,
            downloadedAt: new Date().toISOString(),
            localPath: `${MUSIC_DIR_NAME}/${category}/${safeFilename}`,
            duration: candidate.duration || 180,
            fileSizeBytes: stat.size,
            fileHash: computeFileHash(targetPath),
            artwork: candidate.artwork || CATEGORY_ARTWORK[category],
          });
        }
        continue;
      }

      console.log(`   ⬇ Downloading/Generating: "${candidate.title}" by ${candidate.artist}`);
      console.log(`     License: ${candidate.license} (${candidate.licenseUrl})`);

      try {
        let fileSizeBytes = 0;

        if (category === 'binaural' && candidate.audioUrl.startsWith('internal://synthesize')) {
          // Pure synthesized binaural carrier wave
          fileSizeBytes = generateBinauralWavFile(
            targetPath,
            60, // 60 seconds loopable tone
            candidate.baseTone || 216,
            candidate.freq || 40
          );
        } else {
          // Download remote audio
          const dlResult = await downloadFile(candidate.audioUrl, targetPath);
          if (!dlResult.success) {
            console.warn(`     ✕ Failed: ${dlResult.error}`);
            summary.failed++;
            continue;
          }
          fileSizeBytes = dlResult.bytesWritten;
        }

        // Copy/mirror to public/music for direct static zero-latency serving
        try {
          fs.copyFileSync(targetPath, publicTargetPath);
        } catch {}

        const fileHash = computeFileHash(targetPath);
        const relativeAudioUrl = `/music/${category}/${safeFilename}`;

        const metadataItem: SeededTrackMetadata = {
          id: candidate.id,
          title: candidate.title,
          artist: candidate.artist,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          audio: relativeAudioUrl,
          source: candidate.source,
          sourceUrl: candidate.sourceUrl,
          audioUrl: candidate.audioUrl,
          license: candidate.license,
          licenseUrl: candidate.licenseUrl,
          downloadedAt: new Date().toISOString(),
          localPath: `${MUSIC_DIR_NAME}/${category}/${safeFilename}`,
          duration: candidate.duration || 180,
          fileSizeBytes,
          fileHash,
          artwork: candidate.artwork || CATEGORY_ARTWORK[category],
        };

        updatedLibrary.push(metadataItem);
        summary.downloaded++;
        summary.categoryCounts[category]++;
        console.log(`     ✓ Success: Saved to ${metadataItem.localPath} (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
      } catch (err: any) {
        console.error(`     ✕ Unexpected error: ${err.message}`);
        summary.failed++;
      }
    }
  }

  // 4. Write updated library.json
  fs.writeFileSync(libraryPath, JSON.stringify(updatedLibrary, null, 2), 'utf8');

  // Also write library.json to public/music/library.json so client can fetch directly
  try {
    fs.writeFileSync(path.join(publicMusicDir, LIBRARY_FILE_NAME), JSON.stringify(updatedLibrary, null, 2), 'utf8');
  } catch {}

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // 5. Output exact summary report
  console.log('\n====================================================');
  console.log('Music Seed Complete');
  console.log('====================================================');
  console.log(`Downloaded: ${summary.downloaded}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
  console.log('');
  console.log(`Focus: ${summary.categoryCounts.focus}`);
  console.log(`Lo-Fi: ${summary.categoryCounts.lofi}`);
  console.log(`Ambient: ${summary.categoryCounts.ambient}`);
  console.log(`Classical: ${summary.categoryCounts.classical}`);
  console.log(`Nature: ${summary.categoryCounts.nature}`);
  console.log(`Binaural: ${summary.categoryCounts.binaural}`);
  console.log(`Campus: ${summary.categoryCounts.campus}`);
  console.log('----------------------------------------------------');
  console.log(`Total Library Tracks: ${updatedLibrary.length}`);
  console.log(`Completed in ${durationSec}s`);
  console.log(`Library file generated at: ${path.relative(cwd, libraryPath)}`);
  console.log('====================================================\n');

  return summary;
}

/**
 * Gathers permitted candidate tracks from approved legal sources
 */
async function gatherCandidatesForCategory(
  category: SeedCategory,
  limit: number
): Promise<CandidateTrack[]> {
  switch (category) {
    case 'binaural':
      return getBinauralDefinitions().slice(0, limit);

    case 'classical': {
      // Wikimedia Commons: Musopen and Incompetech classical public domain recordings
      return fetchWikimediaTracks(
        category,
        'classical OR mozart OR beethoven OR tchaikovsky OR bach OR vivaldi OR chopin OR sonata',
        limit
      );
    }

    case 'nature': {
      // Wikimedia Commons: Rain, ocean surf, water, thunderstorm, nature field recordings
      return fetchWikimediaTracks(category, 'rain OR ocean OR river OR birdsong OR thunder', limit);
    }

    case 'campus': {
      // Wikimedia Commons: Church bells, college chimes, organ sonatas
      return fetchWikimediaTracks(category, 'chimes OR carillon OR organ OR glockenspiel', limit);
    }

    case 'ambient': {
      // Wikimedia Commons: Ambient synthesizers, atmospheric drones, space soundscapes
      return fetchWikimediaTracks(category, 'ambient OR synth OR drone OR "dewdrop"', limit);
    }

    case 'lofi': {
      // Wikimedia Commons: Jazz, chill beats, downtempo rhythmics
      return fetchWikimediaTracks(category, 'jazz OR chill OR downtempo OR "synth beat"', limit);
    }

    case 'focus': {
      // Wikimedia Commons: Instrumental focus, piano, acoustic
      return fetchWikimediaTracks(category, 'instrumental OR piano OR acoustic OR orchestra', limit);
    }

    default:
      return [];
  }
}

// CLI runner check
if (require.main === module || process.argv[1]?.includes('music-seeder')) {
  const isUpdate = process.argv.includes('--update');
  runMusicSeeder({ updateOnly: isUpdate }).catch((err) => {
    console.error('Fatal seeder error:', err);
    process.exit(1);
  });
}
