export type SoundType = 'binaural' | 'rain' | 'drone' | 'lofi' | 'noise' | 'nature' | 'ambient' | 'focus';
export type MusicCategory = 'focus' | 'lofi' | 'ambient' | 'binaural' | 'classical' | 'nature' | 'campus';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  artwork: string;
  coverUrl?: string;
  duration: number; // in seconds
  category: MusicCategory;
  mood?: string;
  genre?: string;
  freq?: number; // binaural delta in Hz (e.g. 40 for Gamma, 10 for Alpha)
  baseTone?: number; // carrier frequency (e.g. 216Hz)
  soundType: SoundType;
  videoId?: string;
  channelTitle?: string;
  channelId?: string;
  durationFormatted?: string;
  whyThisTrack?: string;
  description?: string;
  tags?: string[];
  audioUrl?: string;
  audioSrc?: string;
  lyricsOrNotes?: string;
  isUnavailable?: boolean;
}

export function parseFormattedDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 210;
  if (!durationStr.includes(':')) {
    const parsed = parseInt(durationStr, 10);
    return isNaN(parsed) ? 210 : parsed;
  }
  const parts = durationStr.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 210;
}

export function youtubeItemToTrack(item: any, category: MusicCategory = 'focus'): Track {
  const videoId = item.videoId || item.id;
  const durationSec = typeof item.durationSec === 'number'
    ? item.durationSec
    : parseFormattedDurationToSeconds(item.duration);

  return {
    id: videoId,
    videoId,
    title: item.title || 'Untitled Video',
    artist: item.channelTitle || item.artist || 'YouTube Artist',
    channelTitle: item.channelTitle || item.artist || 'YouTube Artist',
    channelId: item.channelId,
    album: 'YouTube Music',
    artwork: item.thumbnail || item.artwork || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    coverUrl: item.thumbnail || item.coverUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: durationSec,
    durationFormatted: item.duration || '3:30',
    category,
    soundType: 'focus',
    description: item.description || '',
    tags: ['youtube', category, 'study'],
  };
}

export function dbRecordToTrack(record: any, category: MusicCategory = 'focus'): Track {
  const videoId = record.youtube_video_id || record.videoId || record.id;
  const durationSec = typeof record.duration === 'string' && record.duration.includes(':')
    ? parseFormattedDurationToSeconds(record.duration)
    : (typeof record.durationSec === 'number' ? record.durationSec : 210);

  return {
    id: videoId,
    videoId,
    title: record.title || 'Untitled Track',
    artist: record.channel_title || record.channelTitle || 'YouTube Artist',
    channelTitle: record.channel_title || record.channelTitle || 'YouTube Artist',
    album: 'Saved Music',
    artwork: record.thumbnail_url || record.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    coverUrl: record.thumbnail_url || record.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: durationSec,
    durationFormatted: record.duration || '3:30',
    category,
    soundType: 'focus',
  };
}

/**
 * Maps a database MusicTrack or raw API track into a typed client Track
 */
export function mapDbTrackToTrack(dbTrack: any): Track {
  const duration =
    typeof dbTrack.durationSec === 'number'
      ? dbTrack.durationSec
      : typeof dbTrack.duration === 'number'
      ? dbTrack.duration
      : 180;

  const audioUrl = dbTrack.audioUrl || dbTrack.audioSrc || '';

  const category = (dbTrack.category as MusicCategory) || 'focus';
  const categoryArtworkMap: Record<string, string> = {
    focus: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    lofi: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    ambient: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    classical: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    nature: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    binaural: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    campus: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
  };

  const artwork = dbTrack.coverUrl || dbTrack.artworkUrl || dbTrack.artwork || categoryArtworkMap[category] || categoryArtworkMap.focus;

  return {
    id: dbTrack.id,
    title: dbTrack.title || 'Untitled Track',
    artist: dbTrack.artist || 'Nivora Sounds',
    artistId: dbTrack.artistId || 'artist-nivora-sounds',
    album: dbTrack.album || 'Nivora Music',
    albumId: dbTrack.albumId || 'album-phonk-sessions',
    artwork,
    coverUrl: artwork,
    duration,
    category,
    genre: dbTrack.genre || category,
    mood: dbTrack.mood || `${category.charAt(0).toUpperCase() + category.slice(1)} Flow`,
    soundType: (dbTrack.soundType as SoundType) || 'focus',
    whyThisTrack:
      dbTrack.whyThisTrack ||
      `Study track: ${dbTrack.title || dbTrack.fileName || 'Audio Track'}`,
    description:
      dbTrack.description ||
      `Audio track ${dbTrack.fileName || ''} (${dbTrack.fileSize || ''})`,
    audioUrl,
    audioSrc: audioUrl,
    tags: Array.isArray(dbTrack.tags)
      ? dbTrack.tags
      : ['stream', dbTrack.category || 'focus', 'library', (dbTrack.title || '').toLowerCase()],
  };
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  artwork: string;
  popularTrackIds: string[];
  albumIds: string[];
  monthlyListeners: string;
  genre: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artwork: string;
  releaseYear: number;
  trackIds: string[];
  description: string;
  genre: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  artwork: string;
  trackIds: string[];
  isCustom?: boolean;
  createdAt?: string;
  contextTag?: string;
}

export interface CampusLounge {
  id: string;
  name: string;
  peers: number;
  host: string;
  trackId: string;
  description: string;
  tags: string[];
  carrierInfo: string;
}

export interface StudyContextMix {
  id: string;
  title: string;
  contextTag: string;
  description: string;
  durationMins: number;
  defaultTrackId: string;
  color: string;
  icon: string;
}

// ----------------------------------------------------
// CURATED TRACKS (20+ Contextual Academic Soundscapes)
// ----------------------------------------------------
export const TRACKS: Track[] = [
  {
    id: 'track-phonk-1',
    title: 'Redwood Trail Sprint',
    artist: 'Jason Shaw (Audionautix)',
    artistId: 'artist-audionautix',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    duration: 118,
    category: 'focus',
    mood: 'Peak Intensity Flow',
    freq: 45,
    baseTone: 180,
    soundType: 'focus',
    whyThisTrack: 'High-octane rhythmic momentum and driving acoustic pacing designed for intense coding sprints, competitive programming, and peak mental velocity.',
    description: 'High-velocity study soundscape streamed from external HTTPS audio repository for high-gear focus and low-latency cognitive pacing.',
    tags: ['focus', 'sprint', 'acoustic', 'velocity', 'audionautix', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Audionautix-com-ccby-redwoodtrail.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Audionautix-com-ccby-redwoodtrail.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 3.0 (CC BY 3.0)\nComposer: Jason Shaw (Audionautix)\nHost: Wikimedia Commons CDN (HTTPS Audio Stream)\nOptimized for: Coding Sprints, Late-night debugging, Algorithmic velocity.',
  },
  {
    id: 'track-phonk-2',
    title: 'Say It Anyway (Focus Drive)',
    artist: 'PC-ONE',
    artistId: 'artist-pcone',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    duration: 325,
    category: 'focus',
    mood: 'Dark Momentum',
    freq: 42,
    baseTone: 160,
    soundType: 'focus',
    whyThisTrack: 'Steady acoustic resonance and atmospheric chords for sustained focus through complex system architectures.',
    description: 'Atmospheric focus soundscape crafted for uninterrupted deep-state coding and late-night builds.',
    tags: ['focus', 'momentum', 'coding', 'pc-one', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/PC-ONE_-_09_-_Say_It_Anyway_Instrumental_Acoustic.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/PC-ONE_-_09_-_Say_It_Anyway_Instrumental_Acoustic.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 4.0 (CC BY 4.0)\nArtist: PC-ONE\nHost: Wikimedia Commons CDN (HTTPS Audio Stream)',
  },
  {
    id: 'track-phonk-3',
    title: 'Chill Wave Momentum',
    artist: 'Kevin MacLeod',
    artistId: 'artist-macleod',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 240,
    category: 'focus',
    mood: 'Rapid Rhythm',
    soundType: 'focus',
    whyThisTrack: 'Smooth syncopated groove for rapid mental activation and seamless problem shifts.',
    description: 'High-tempo cadence for sustained concentration and creative problem solving.',
    tags: ['focus', 'rapid', 'wave', 'macleod', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chill_Wave_%28ISRC_USUAN1600048%29.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chill_Wave_%28ISRC_USUAN1600048%29.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 3.0 (CC BY 3.0)\nComposer: Kevin MacLeod (Incompetech)',
  },
  {
    id: 'track-phonk-4',
    title: 'Jazz Brunch Study',
    artist: 'Kevin MacLeod',
    artistId: 'artist-macleod',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    duration: 323,
    category: 'focus',
    mood: 'Dynamic Drive',
    soundType: 'focus',
    whyThisTrack: 'Punchy acoustic bass and energetic synths for powering through difficult exam revisions and sprints.',
    description: 'Energetic rhythm-driven soundscape for peak performance and dynamic workflow.',
    tags: ['focus', 'jazz', 'drive', 'macleod', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Jazz_Brunch_%28ISRC_USUAN1700074%29.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Jazz_Brunch_%28ISRC_USUAN1700074%29.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 3.0 (CC BY 3.0)\nComposer: Kevin MacLeod (Incompetech)',
  },
  {
    id: 'track-phonk-5',
    title: 'Backed Vibes Clean',
    artist: 'Kevin MacLeod',
    artistId: 'artist-macleod',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: 220,
    category: 'focus',
    mood: 'Instant Activation',
    soundType: 'focus',
    whyThisTrack: 'Crisp melodic leads and driving percussion for quick resets and rapid focus realignment.',
    description: 'High-energy focus burst designed for immediate cognitive reset and sustained coding cadence.',
    tags: ['focus', 'reset', 'vibes', 'macleod', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Backed_Vibes_%28clean%29_%28ISRC_USUAN1100479%29.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Backed_Vibes_%28clean%29_%28ISRC_USUAN1100479%29.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 3.0 (CC BY 3.0)\nComposer: Kevin MacLeod (Incompetech)',
  },
  {
    id: 'track-phonk-6',
    title: 'Cool Vibes Deep Flow',
    artist: 'Kevin MacLeod',
    artistId: 'artist-macleod',
    album: 'High-Velocity Focus Sessions',
    albumId: 'album-phonk-sessions',
    artwork: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    duration: 255,
    category: 'focus',
    mood: 'Epic Cadence',
    soundType: 'focus',
    whyThisTrack: 'Smooth progression and deep rhythmic flow for overcoming massive project hurdles and hackathons.',
    description: 'Smooth focus track with rhythmic presence and melodic atmospheric clarity.',
    tags: ['focus', 'hackathon', 'flow', 'macleod', 'cc-by'],
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Cool_Vibes_%28ISRC_USUAN1100863%29.mp3',
    audioSrc: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Cool_Vibes_%28ISRC_USUAN1100863%29.mp3',
    lyricsOrNotes: 'License: Creative Commons Attribution 3.0 (CC BY 3.0)\nComposer: Kevin MacLeod (Incompetech)',
  },
  {
    id: 'track-1',
    title: '40Hz Gamma Focus',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    album: 'Synaptic Resonance Vol. 1',
    albumId: 'album-synaptic',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: 245,
    category: 'binaural',
    mood: 'Intense Cognition',
    freq: 40,
    baseTone: 216,
    soundType: 'binaural',
    whyThisTrack: 'Calibrated at 40Hz to induce gamma-band synchronization, optimizing deep algorithmic problem-solving and neural cohesion.',
    description: 'Calibrated at 40Hz to induce gamma-band synchronization, optimizing deep algorithmic problem-solving and neural cohesion.',
    tags: ['binaural', 'gamma', '40hz', 'focus', 'math', 'neuro-sync', 'cognition'],
    lyricsOrNotes: 'Carrier: 216.0 Hz • Left Channel: 196.0 Hz • Right Channel: 236.0 Hz\nRecommended: Use headphones for optimal stereo binaural interaction.\nIntended use: Advanced mathematics, systems programming, and high-load memory retention.',
  },
  {
    id: 'track-2',
    title: 'Library Rain on Glass',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    album: 'Bodleian Rainy Afternoons',
    albumId: 'album-bodleian',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    duration: 310,
    category: 'nature',
    mood: 'Calm Seclusion',
    soundType: 'rain',
    whyThisTrack: 'Filtered pink noise with soft window acoustic dispersion to mask high-frequency campus distractions.',
    description: 'Filtered pink noise with soft window acoustic dispersion to mask high-frequency campus distractions.',
    tags: ['nature', 'rain', 'water', 'library', 'bodleian', 'pink noise', 'seclusion'],
    lyricsOrNotes: 'Recorded with dual binaural microphones in the Radcliffe Camera upper gallery.\nAcoustic envelope filtered to protect speech intelligibility threshold.',
  },
  {
    id: 'track-3',
    title: 'Deep Academic Flow',
    artist: 'Cambridge Cognitive Flow',
    artistId: 'artist-cambridge',
    album: 'Quiet Library Halls',
    albumId: 'album-quiet',
    artwork: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    duration: 275,
    category: 'ambient',
    mood: 'Flow State',
    freq: 12,
    baseTone: 144,
    soundType: 'drone',
    whyThisTrack: 'A resonant 12Hz alpha drone that anchors working memory during multi-hour paper writing and thesis research.',
    description: 'A resonant 12Hz alpha drone that anchors working memory during multi-hour paper writing and thesis research.',
    tags: ['ambient', 'flow', 'deep academic flow', 'alpha', 'drone', 'cambridge', 'writing', 'focus'],
    lyricsOrNotes: 'Sub-bass warm resonance at 72Hz and 144Hz.\nGentle harmonic progression designed to avoid dopamine spikes or melodic distraction.',
  },
  {
    id: 'track-4',
    title: 'Lofi Study Companion',
    artist: 'Komorebi Tape Unit',
    artistId: 'artist-komorebi',
    album: 'Late Night Compiler Sessions',
    albumId: 'album-compiler',
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    duration: 198,
    category: 'lofi',
    mood: 'Comforting Rhythm',
    soundType: 'lofi',
    whyThisTrack: 'Low-compression analog saturation and 68 BPM gentle vinyl groove for effortless coding cadences.',
    description: 'Low-compression analog saturation and 68 BPM gentle vinyl groove for effortless coding cadences.',
    tags: ['lofi', 'chillhop', 'coding', 'beats', 'analog', 'tape', '68bpm'],
    lyricsOrNotes: '68 BPM mellow drum cadence.\nVintage tape wow-and-flutter modulation with soft Rhodes chords.',
  },
  {
    id: 'track-5',
    title: '10Hz Alpha Mindstate',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    album: 'Synaptic Resonance Vol. 1',
    albumId: 'album-synaptic',
    artwork: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    duration: 340,
    category: 'binaural',
    mood: 'Relaxed Alertness',
    freq: 10,
    baseTone: 190,
    soundType: 'binaural',
    whyThisTrack: 'Alpha brainwave pacing (10Hz) to sustain long reading sessions without mental fatigue or eye strain.',
    description: 'Alpha brainwave pacing (10Hz) to sustain long reading sessions without mental fatigue or eye strain.',
    tags: ['binaural', 'alpha', '10hz', 'reading', 'alertness', 'exam', 'memory'],
    lyricsOrNotes: 'Calibrated for textbook absorption, literature review, and conceptual synthesis.',
  },
  {
    id: 'track-6',
    title: 'Radcliffe Quad Twilight',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    album: 'Bodleian Rainy Afternoons',
    albumId: 'album-bodleian',
    artwork: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    duration: 260,
    category: 'campus',
    mood: 'Quiet Solitude',
    soundType: 'ambient',
    whyThisTrack: 'Distant footsteps on wet cobblestones, church tower overtones, and soft wind drafts.',
    description: 'Distant footsteps on wet cobblestones, church tower overtones, and soft wind drafts.',
    tags: ['campus', 'oxford', 'quad', 'bells', 'walk', 'solitude', 'ambient'],
    lyricsOrNotes: 'Ambient field recording blended with warm sub-audible pads.',
  },
  {
    id: 'track-7',
    title: 'Recursive Tree Traversal',
    artist: 'Komorebi Tape Unit',
    artistId: 'artist-komorebi',
    album: 'Late Night Compiler Sessions',
    albumId: 'album-compiler',
    artwork: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration: 215,
    category: 'lofi',
    mood: 'Algorithmic Rhythm',
    soundType: 'lofi',
    whyThisTrack: 'Minimalist rhythmic pulse structured around rhythmic 4/4 syncopation to keep syntax debugging on track.',
    description: 'Minimalist rhythmic pulse structured around rhythmic 4/4 syncopation to keep syntax debugging on track.',
    tags: ['lofi', 'algorithms', 'cs', 'coding', 'compiler', 'debugging', 'beats'],
    lyricsOrNotes: 'Tape-saturated 808 sub and warm jazz guitar stabs.',
  },
  {
    id: 'track-8',
    title: 'Soma Theta Induction',
    artist: 'Soma Synthesis',
    artistId: 'artist-soma',
    album: 'Deep Sleep & Cognitive Recovery',
    albumId: 'album-recovery',
    artwork: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    duration: 380,
    category: 'binaural',
    mood: 'Cognitive Reset',
    freq: 6,
    baseTone: 108,
    soundType: 'binaural',
    whyThisTrack: 'Sub-theta 6Hz modulation ideal for cognitive reboot sessions and transitioning from intense study to rest.',
    description: 'Sub-theta 6Hz modulation ideal for cognitive reboot sessions and transitioning from intense study to rest.',
    tags: ['binaural', 'theta', '6hz', 'reset', 'reboot', 'recovery', 'relaxation'],
    lyricsOrNotes: 'Soft resonant singing bowl harmonics tuned to 432Hz root.',
  },
  {
    id: 'track-9',
    title: 'Cathedral of Books',
    artist: 'Cambridge Cognitive Flow',
    artistId: 'artist-cambridge',
    album: 'Quiet Library Halls',
    albumId: 'album-quiet',
    artwork: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    duration: 295,
    category: 'ambient',
    mood: 'Reverent Calm',
    soundType: 'drone',
    whyThisTrack: 'Spacious 2.4s reverb chamber acoustics simulating endless arched library ceiling reflection.',
    description: 'Spacious 2.4s reverb chamber acoustics simulating endless arched library ceiling reflection.',
    tags: ['ambient', 'drone', 'library', 'cathedral', 'reading', 'reverb', 'calm'],
    lyricsOrNotes: 'Continuous organic cello drone with slow harmonic phase cancellation.',
  },
  {
    id: 'track-10',
    title: 'Nocturne in C Minor for Focus',
    artist: 'Oxford Ambient Guild',
    artistId: 'artist-oxford',
    album: 'Classical Chamber Studies',
    albumId: 'album-classical',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 240,
    category: 'classical',
    mood: 'Solemn Clarity',
    soundType: 'ambient',
    whyThisTrack: 'Minimalist felt-piano arrangement of Chopin motifs with softened transient hammer strikes.',
    description: 'Minimalist felt-piano arrangement of Chopin motifs with softened transient hammer strikes.',
    tags: ['classical', 'piano', 'felt piano', 'chopin', 'chamber', 'clarity', 'study'],
    lyricsOrNotes: 'Felt dampener applied to grand piano strings to remove jarring high-frequency attacks.',
  },
  {
    id: 'track-11',
    title: 'Pacific Dune White Noise',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    album: 'Atmospheric Elements',
    albumId: 'album-elements',
    artwork: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    duration: 360,
    category: 'nature',
    mood: 'Total Masking',
    soundType: 'noise',
    whyThisTrack: 'Full-spectrum ocean wave brown noise engineered to obliterate erratic dorm and cafe chatter.',
    description: 'Full-spectrum ocean wave brown noise engineered to obliterate erratic dorm and cafe chatter.',
    tags: ['nature', 'ocean', 'white noise', 'brown noise', 'masking', 'isolation'],
    lyricsOrNotes: 'Brownian acoustic model with 6dB per octave attenuation.',
  },
  {
    id: 'track-12',
    title: 'Memory Leaks at 3 AM',
    artist: 'Komorebi Tape Unit',
    artistId: 'artist-komorebi',
    album: 'Late Night Compiler Sessions',
    albumId: 'album-compiler',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    duration: 220,
    category: 'lofi',
    mood: 'Nocturnal Focus',
    soundType: 'lofi',
    whyThisTrack: 'Quiet, hypnotic synthesizer arpeggios that keep mental friction low during midnight debugging.',
    description: 'Quiet, hypnotic synthesizer arpeggios that keep mental friction low during midnight debugging.',
    tags: ['lofi', 'nocturnal', 'night study', 'coding', 'synthesizer', 'juno', 'debug'],
    lyricsOrNotes: 'Analog Juno-60 filter sweeps with tape saturation.',
  },
  {
    id: 'track-13',
    title: 'Bodleian Upper Reading Room',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    album: 'Quiet Library Halls',
    albumId: 'album-quiet',
    artwork: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80',
    duration: 330,
    category: 'campus',
    mood: 'Scholarly Seclusion',
    soundType: 'rain',
    whyThisTrack: 'Faint turning of heavy manuscript pages and distant Oxford bells.',
    description: 'Faint turning of heavy manuscript pages and distant Oxford bells.',
    tags: ['campus', 'library', 'bodleian', 'reading', 'manuscript', 'oxford', 'seclusion'],
    lyricsOrNotes: 'Calibrated for uninterrupted humanities and social sciences reading.',
  },
  {
    id: 'track-14',
    title: 'Euler Totient Resonance',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    album: 'Synaptic Resonance Vol. 1',
    albumId: 'album-synaptic',
    artwork: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    duration: 285,
    category: 'binaural',
    mood: 'Mathematical Precision',
    freq: 28,
    baseTone: 256,
    soundType: 'binaural',
    whyThisTrack: 'Harmonic 28Hz beta wave stimulation tailored for cryptography, discrete math, and algorithm verification.',
    description: 'Harmonic 28Hz beta wave stimulation tailored for cryptography, discrete math, and algorithm verification.',
    tags: ['binaural', 'beta', '28hz', 'math', 'precision', 'discrete', 'verification'],
    lyricsOrNotes: 'Middle C (256Hz) scientific pitch carrier.',
  },
  {
    id: 'track-15',
    title: 'Rain on Copper Rooftops',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    album: 'Bodleian Rainy Afternoons',
    albumId: 'album-bodleian',
    artwork: 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=600&auto=format&fit=crop&q=80',
    duration: 315,
    category: 'nature',
    mood: 'Deep Masking',
    soundType: 'rain',
    whyThisTrack: 'Crisp metallic rainwater drops that blend with organic earth soundscapes for study immersion.',
    description: 'Crisp metallic rainwater drops that blend with organic earth soundscapes for study immersion.',
    tags: ['nature', 'rain', 'copper', 'masking', 'immersion', 'water', 'night'],
    lyricsOrNotes: 'High-density droplet pattern recorded at 96kHz.',
  },
  {
    id: 'track-16',
    title: 'Gymnopédie No. 1 Reflection',
    artist: 'Oxford Ambient Guild',
    artistId: 'artist-oxford',
    album: 'Classical Chamber Studies',
    albumId: 'album-classical',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 210,
    category: 'classical',
    mood: 'Pensive Solitude',
    soundType: 'ambient',
    whyThisTrack: 'Erik Satie’s timeless pacing, rearranged with ambient tape delays and muted strings.',
    description: 'Erik Satie’s timeless pacing, rearranged with ambient tape delays and muted strings.',
    tags: ['classical', 'piano', 'satie', 'gymnopedie', 'chamber', 'strings', 'pensive'],
    lyricsOrNotes: 'Slow, breathing 3/4 meter for conceptual reading and essay structuring.',
  },
  {
    id: 'track-17',
    title: 'High-Altitude Forest Stream',
    artist: 'Cambridge Cognitive Flow',
    artistId: 'artist-cambridge',
    album: 'Atmospheric Elements',
    albumId: 'album-elements',
    artwork: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
    duration: 270,
    category: 'nature',
    mood: 'Organic Serenity',
    soundType: 'nature',
    whyThisTrack: 'Gentle bubbling water tones with micro-fluctuations proven to boost cognitive working memory.',
    description: 'Gentle bubbling water tones with micro-fluctuations proven to boost cognitive working memory.',
    tags: ['nature', 'stream', 'forest', 'water', 'clarity', 'morning', 'serenity'],
    lyricsOrNotes: 'Natural water frequency range creates effortless white noise masking without harshness.',
  },
  {
    id: 'track-18',
    title: 'Async Await Chillhop',
    artist: 'Komorebi Tape Unit',
    artistId: 'artist-komorebi',
    album: 'Late Night Compiler Sessions',
    albumId: 'album-compiler',
    artwork: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    duration: 205,
    category: 'lofi',
    mood: 'Fluid Coding',
    soundType: 'lofi',
    whyThisTrack: 'Relaxed side-chain compressed beats designed for frontend and full-stack development flows.',
    description: 'Relaxed side-chain compressed beats designed for frontend and full-stack development flows.',
    tags: ['lofi', 'chillhop', 'coding', 'async', 'frontend', 'guitar', 'rhythm'],
    lyricsOrNotes: '72 BPM swing groove with muted jazz guitar.',
  },
  {
    id: 'track-19',
    title: 'Radcliffe Quad Nightfall',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    album: 'Quiet Library Halls',
    albumId: 'album-quiet',
    artwork: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    duration: 320,
    category: 'campus',
    mood: 'Midnight Calm',
    soundType: 'ambient',
    whyThisTrack: 'Deep acoustic field ambience captured after hours in Oxford college cloisters.',
    description: 'Deep acoustic field ambience captured after hours in Oxford college cloisters.',
    tags: ['campus', 'nightfall', 'cloisters', 'ambient', 'quad', 'midnight', 'calm'],
    lyricsOrNotes: 'Long-decay natural stone reverberation with distant ambient hum.',
  },
  {
    id: 'track-20',
    title: 'Synaptic Ocean Waves',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    album: 'Atmospheric Elements',
    albumId: 'album-elements',
    artwork: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80',
    duration: 350,
    category: 'nature',
    mood: 'Ocean Flow',
    soundType: 'nature',
    whyThisTrack: 'Cyclical rolling wave intervals (approx 12-second crests) aligning with natural breathing cadence.',
    description: 'Cyclical rolling wave intervals (approx 12-second crests) aligning with natural breathing cadence.',
    tags: ['nature', 'ocean', 'waves', 'breathing', 'cadence', 'relaxation', 'flow'],
    lyricsOrNotes: 'Paced for stress reduction, pre-exam anxiety management, and sustained focus.',
  },
];

// ----------------------------------------------------
// CURATED ARTISTS
// ----------------------------------------------------
export const ARTISTS: Artist[] = [
  {
    id: 'artist-nivora-sounds',
    name: 'Nivora Sounds',
    bio: 'Official sound catalog featuring energetic phonk, high-velocity drift rhythmics, and intense sprint audio for rapid code deployment and peak cognitive performance.',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-phonk-1', 'track-phonk-2', 'track-phonk-3'],
    albumIds: ['album-phonk-sessions'],
    monthlyListeners: '412,050 students',
    genre: 'Drift Phonk & High-Intensity Focus',
  },
  {
    id: 'artist-nivora',
    name: 'Nivora Acoustic Labs',
    bio: 'Pioneering neuro-acoustic sound design, precision binaural carrier tones, and cognitive synchronization audio engineered specifically for high-performing students.',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-1', 'track-5', 'track-11', 'track-14', 'track-20'],
    albumIds: ['album-synaptic', 'album-elements'],
    monthlyListeners: '284,190 students',
    genre: 'Neuro-Acoustics & Binaural Flow',
  },
  {
    id: 'artist-bodleian',
    name: 'Bodleian Sound Archives',
    bio: 'Historic library field recordings, organic rain-on-stone soundscapes, and cathedral acoustics preserved from Oxford and Cambridge academic corridors.',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-2', 'track-6', 'track-13', 'track-15', 'track-19'],
    albumIds: ['album-bodleian', 'album-quiet'],
    monthlyListeners: '198,420 students',
    genre: 'Library Field Acoustics',
  },
  {
    id: 'artist-komorebi',
    name: 'Komorebi Tape Unit',
    bio: 'Analog tape-saturated lo-fi beats, gentle vinyl warmth, and melodic keyboard progressions crafted for sustained late-night engineering and coding marathons.',
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-4', 'track-7', 'track-12', 'track-18'],
    albumIds: ['album-compiler'],
    monthlyListeners: '342,800 students',
    genre: 'Lo-Fi Study & Coding Cadence',
  },
  {
    id: 'artist-cambridge',
    name: 'Cambridge Cognitive Flow',
    bio: 'Minimalist ambient drones, organic sub-bass textures, and subtle soundscapes constructed to dissolve distractions without demanding conscious attention.',
    artwork: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-3', 'track-9', 'track-17'],
    albumIds: ['album-quiet', 'album-elements'],
    monthlyListeners: '142,300 students',
    genre: 'Minimalist Ambient Flow',
  },
  {
    id: 'artist-soma',
    name: 'Soma Synthesis',
    bio: 'Deep theta recovery audio, harmonic overtone bowls, and meditative soundscapes designed for cognitive reboots between high-pressure academic sprints.',
    artwork: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-8'],
    albumIds: ['album-recovery'],
    monthlyListeners: '115,800 students',
    genre: 'Theta Waves & Restoration',
  },
  {
    id: 'artist-oxford',
    name: 'Oxford Ambient Guild',
    bio: 'Intimate felt piano studies, softened classical chamber motifs, and reverent acoustics stripped of jarring dynamics for literary reflection and thesis writing.',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    popularTrackIds: ['track-10', 'track-16'],
    albumIds: ['album-classical'],
    monthlyListeners: '167,400 students',
    genre: 'Felt Piano & Chamber Focus',
  },
];

// ----------------------------------------------------
// CURATED ALBUMS
// ----------------------------------------------------
export const ALBUMS: Album[] = [
  {
    id: 'album-phonk-sessions',
    title: 'High-Velocity Drift Sessions',
    artist: 'Nivora Sounds',
    artistId: 'artist-nivora-sounds',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    releaseYear: 2026,
    trackIds: ['track-phonk-1', 'track-phonk-2', 'track-phonk-3', 'track-phonk-4', 'track-phonk-5', 'track-phonk-6'],
    description: 'High-octane phonk and bass-boosted acoustic cadence engineered for extreme coding sprints and late-night build pipelines.',
    genre: 'Drift Phonk',
  },
  {
    id: 'album-synaptic',
    title: 'Synaptic Resonance Vol. 1',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    releaseYear: 2026,
    trackIds: ['track-1', 'track-5', 'track-14'],
    description: 'The core neuro-acoustic framework of Nivora: scientifically calibrated 40Hz Gamma and 10Hz Alpha carrier frequencies.',
    genre: 'Binaural & Cognitive Waves',
  },
  {
    id: 'album-bodleian',
    title: 'Bodleian Rainy Afternoons',
    artist: 'Bodleian Sound Archives',
    artistId: 'artist-bodleian',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=80',
    releaseYear: 2025,
    trackIds: ['track-2', 'track-6', 'track-15'],
    description: 'Immersive library rainfall, cobblestone reflections, and ambient Oxford seclusions for sustained paper writing.',
    genre: 'Library Field Acoustics',
  },
  {
    id: 'album-compiler',
    title: 'Late Night Compiler Sessions',
    artist: 'Komorebi Tape Unit',
    artistId: 'artist-komorebi',
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    releaseYear: 2026,
    trackIds: ['track-4', 'track-7', 'track-12', 'track-18'],
    description: 'Analog tape saturation, warm chords, and gentle 68-72 BPM grooves for code architecture and refactoring.',
    genre: 'Lo-Fi Coding Cadence',
  },
  {
    id: 'album-quiet',
    title: 'Quiet Library Halls',
    artist: 'Cambridge Cognitive Flow',
    artistId: 'artist-cambridge',
    artwork: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    releaseYear: 2025,
    trackIds: ['track-3', 'track-9', 'track-13', 'track-19'],
    description: 'Endless arched ceiling acoustics, organic cello drones, and cathedral silence for deep academic reading.',
    genre: 'Minimalist Ambient Flow',
  },
  {
    id: 'album-classical',
    title: 'Classical Chamber Studies',
    artist: 'Oxford Ambient Guild',
    artistId: 'artist-oxford',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    releaseYear: 2025,
    trackIds: ['track-10', 'track-16'],
    description: 'Muted felt grand piano and softened strings arranged without startling crescendos or dynamic peaks.',
    genre: 'Felt Piano & Chamber Studies',
  },
  {
    id: 'album-elements',
    title: 'Atmospheric Elements',
    artist: 'Nivora Acoustic Labs',
    artistId: 'artist-nivora',
    artwork: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    releaseYear: 2026,
    trackIds: ['track-11', 'track-17', 'track-20'],
    description: 'Organic white noise, mountain streams, and oceanic swell models for total acoustic isolation.',
    genre: 'Nature & Frequency Masking',
  },
];

// ----------------------------------------------------
// DEFAULT PLAYLISTS ("Made For Your Study")
// ----------------------------------------------------
export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-deep-focus',
    name: 'Deep Focus — 45 min',
    description: 'Engineered for sustained flow states. High-potency 40Hz binaural carriers and minimalist organic synth pads.',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-3', 'track-5', 'track-14', 'track-9'],
    contextTag: 'Deep Focus',
  },
  {
    id: 'playlist-coding-session',
    name: 'Coding Sprint — 60 min',
    description: 'Rhythmic lo-fi beats, analog tape saturation, and gentle groove for programming cadences.',
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-phonk-1', 'track-phonk-2', 'track-4', 'track-7', 'track-12', 'track-18'],
    contextTag: 'Coding Sprint',
  },
  {
    id: 'playlist-late-night',
    name: 'Night Study — 90 min',
    description: 'Gentle raindrops on glass, distant Oxford clocks, and low-energy ambient warmth for midnight study.',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-2', 'track-6', 'track-15', 'track-19'],
    contextTag: 'Night Study',
  },
  {
    id: 'playlist-reading-mode',
    name: 'Reading Session — 35 min',
    description: 'Felt piano motifs, library echoes, and muted strings that fade into the background while you read.',
    artwork: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-3', 'track-9', 'track-10', 'track-13', 'track-16'],
    contextTag: 'Reading Session',
  },
  {
    id: 'playlist-exam-prep',
    name: 'Exam Revision — 50 min',
    description: 'High-frequency retention soundscapes designed to stabilize working memory during revision.',
    artwork: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-5', 'track-11', 'track-14'],
    contextTag: 'Exam Revision',
  },
  {
    id: 'playlist-morning-campus',
    name: 'Campus Clarity — 25 min',
    description: 'Fresh natural stream acoustics and gentle morning clarity to start the academic day with intention.',
    artwork: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-17', 'track-6', 'track-20'],
    contextTag: 'Campus Walk',
  },
];

// ----------------------------------------------------
// LIVE CAMPUS LOUNGES
// ----------------------------------------------------
export const CAMPUS_LOUNGES: CampusLounge[] = [
  {
    id: 'lounge-dist-sys',
    name: 'Distributed Systems Deep Focus',
    peers: 24,
    host: 'Aditya P. (Year 3)',
    trackId: 'track-1',
    description: 'Silent sprint for distributed algorithms, consensus protocol design, and network latency problem sets.',
    tags: ['Computer Science', 'Silent Sprint', '40Hz Gamma'],
    carrierInfo: '40Hz Neuro-Sync Active • 216Hz Base',
  },
  {
    id: 'lounge-dbms',
    name: 'DBMS Normalization & B+ Trees',
    peers: 31,
    host: 'Tanvi M. (Year 3)',
    trackId: 'track-3',
    description: 'Group problem solving room focusing on relational algebra, index structures, and SQL optimization.',
    tags: ['Database Systems', 'Deep Flow', 'Alpha Wave'],
    carrierInfo: '12Hz Alpha Flow • Sub-bass 144Hz',
  },
  {
    id: 'lounge-algorithms',
    name: 'Algorithms Silent Sprint Room',
    peers: 42,
    host: 'Rohan K. (Year 4)',
    trackId: 'track-4',
    description: 'Pomodoro-synced competitive programming room. Dynamic programming and tree traversal sprints.',
    tags: ['Data Structures', 'Pomodoro', 'Lo-Fi Cadence'],
    carrierInfo: '68 BPM Tape Saturation',
  },
  {
    id: 'lounge-bodleian',
    name: 'Bodleian Library Quiet Flow',
    peers: 19,
    host: 'Sara V. (Year 2)',
    trackId: 'track-2',
    description: 'Simulated historic library seclusion. Perfect for case studies, law briefs, and extensive essay reading.',
    tags: ['All Disciplines', 'Rain Acoustics', 'Natural Seclusion'],
    carrierInfo: 'Pink Noise Rain Masking',
  },
  {
    id: 'lounge-late-night',
    name: 'Late Night Compiler Lounge',
    peers: 28,
    host: 'Dev Team Relay',
    trackId: 'track-12',
    description: 'For students burning the midnight oil across engineering, design, and architecture builds.',
    tags: ['Nocturnal Flow', 'Lo-Fi', 'Warm Synth'],
    carrierInfo: 'Juno-60 Analog Ambient Warmth',
  },
  {
    id: 'lounge-theta',
    name: 'Neuro-Acoustic Cognitive Reset',
    peers: 15,
    host: 'Wellbeing Guild',
    trackId: 'track-8',
    description: '15-25 minute cognitive decompression room. Low-frequency theta induction between exam blocks.',
    tags: ['Reboot', 'Theta Waves', 'Restoration'],
    carrierInfo: '6Hz Theta Relaxation Wave',
  },
];

// ----------------------------------------------------
// STUDY CONTEXT MIXES ("What are you doing right now?")
// ----------------------------------------------------
export const STUDY_CONTEXT_MIXES: StudyContextMix[] = [
  {
    id: 'context-focus',
    title: 'Focus Mode',
    contextTag: 'Deep Work',
    description: 'Minimal distractions with 40Hz gamma synchronization.',
    durationMins: 45,
    defaultTrackId: 'track-1',
    color: '#E85A4F',
    icon: 'psychology',
  },
  {
    id: 'context-coding',
    title: 'Coding Sprint',
    contextTag: 'Coding',
    description: 'Rhythmic lo-fi beats and analog warmth for dev cadences.',
    durationMins: 60,
    defaultTrackId: 'track-4',
    color: '#E98074',
    icon: 'code',
  },
  {
    id: 'context-night',
    title: 'Night Study',
    contextTag: 'Nocturnal',
    description: 'Soft raindrops and late-night quiet library ambience.',
    durationMins: 90,
    defaultTrackId: 'track-2',
    color: '#8E8D8A',
    icon: 'dark_mode',
  },
  {
    id: 'context-reading',
    title: 'Reading Mode',
    contextTag: 'Literature',
    description: 'Felt piano and gentle alpha waves that fade into background.',
    durationMins: 35,
    defaultTrackId: 'track-10',
    color: '#D8C3A5',
    icon: 'menu_book',
  },
  {
    id: 'context-exam',
    title: 'Exam Preparation',
    contextTag: 'Revision',
    description: 'Cognitive retention frequencies for intense recall.',
    durationMins: 50,
    defaultTrackId: 'track-5',
    color: '#E85A4F',
    icon: 'school',
  },
  {
    id: 'context-campus',
    title: 'Campus Walk',
    contextTag: 'Social',
    description: 'Relaxed acoustic field recordings and nature clarity.',
    durationMins: 25,
    defaultTrackId: 'track-6',
    color: '#E98074',
    icon: 'directions_walk',
  },
  {
    id: 'context-recovery',
    title: 'Cognitive Reset',
    contextTag: 'Reboot',
    description: 'Theta wave restoration after intensive study.',
    durationMins: 20,
    defaultTrackId: 'track-8',
    color: '#D8C3A5',
    icon: 'self_improvement',
  },
];

// ----------------------------------------------------
// QUICK ACCESS CARDS
// ----------------------------------------------------
export interface QuickAccessCard {
  id: string;
  title: string;
  category: MusicCategory;
  description: string;
  artwork: string;
  trackCount: number;
  sampleTrackId: string;
}

export const QUICK_ACCESS_CARDS: QuickAccessCard[] = [
  {
    id: 'qa-focus',
    title: 'Focus',
    category: 'focus',
    description: 'Cognitive flow & alpha waves',
    artwork: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    trackCount: 8,
    sampleTrackId: 'track-3',
  },
  {
    id: 'qa-lofi',
    title: 'Lo-Fi',
    category: 'lofi',
    description: 'Analog tape & chill coding',
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    trackCount: 6,
    sampleTrackId: 'track-4',
  },
  {
    id: 'qa-ambient',
    title: 'Ambient',
    category: 'ambient',
    description: 'Reverent drones & space',
    artwork: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    trackCount: 7,
    sampleTrackId: 'track-9',
  },
  {
    id: 'qa-classical',
    title: 'Classical',
    category: 'classical',
    description: 'Muted felt piano chamber',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    trackCount: 4,
    sampleTrackId: 'track-10',
  },
  {
    id: 'qa-nature',
    title: 'Nature',
    category: 'nature',
    description: 'Rain, streams & ocean swell',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    trackCount: 6,
    sampleTrackId: 'track-2',
  },
  {
    id: 'qa-binaural',
    title: 'Binaural',
    category: 'binaural',
    description: 'Gamma 40Hz & Alpha 10Hz',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    trackCount: 5,
    sampleTrackId: 'track-1',
  },
  {
    id: 'qa-campus',
    title: 'Campus',
    category: 'campus',
    description: 'Historic reading rooms',
    artwork: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    trackCount: 5,
    sampleTrackId: 'track-6',
  },
];
