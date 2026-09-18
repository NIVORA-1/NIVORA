import { CandidateTrack, SeedCategory } from './types';

const USER_AGENT = 'NivoraStudentOS-MusicSeeder/1.0 (Student Operating System; Educational; contact@nivora.app)';

/**
 * Strips HTML tags and cleans up whitespace
 */
function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Safe JSON fetch with AbortSignal timeout
 */
async function fetchJson<T>(url: string, timeoutMs = 15000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Searches Wikimedia Commons MediaWiki API for public domain / CC-licensed audio
 */
export async function fetchWikimediaTracks(
  category: SeedCategory,
  searchQuery: string,
  limit: number = 10
): Promise<CandidateTrack[]> {
  try {
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=` +
      encodeURIComponent(`filemime:audio/mpeg ${searchQuery}`) +
      `&srnamespace=6&srlimit=${limit + 12}&format=json`;

    const searchRes = await fetchJson<any>(searchUrl);
    const searchHits = searchRes?.query?.search || [];
    if (searchHits.length === 0) return [];

    const titles = searchHits.map((h: any) => h.title).slice(0, limit + 10);
    const infoUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&titles=` +
      encodeURIComponent(titles.join('|')) +
      `&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;

    const infoRes = await fetchJson<any>(infoUrl);
    const pages = infoRes?.query?.pages || {};
    const results: CandidateTrack[] = [];

    for (const page of Object.values(pages) as any[]) {
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;

      // Filter out files that are too large (> 25MB) or too long (> 10 minutes) for study tracks
      if (info.size && info.size > 25 * 1024 * 1024) continue;
      if (info.duration && info.duration > 600) continue;

      const ext = info.extmetadata || {};
      const rawLicense = ext.LicenseShortName?.value || ext.License?.value || 'Public Domain';
      const licenseUrl = ext.LicenseUrl?.value || 'https://creativecommons.org/licenses/by/4.0/';
      const rawArtist = cleanText(ext.Artist?.value || ext.Credit?.value || 'Wikimedia Contributor');
      const cleanTitle = page.title
        .replace(/^File:/i, '')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/\(ISRC.*?\)/i, '')
        .trim();

      // Skip legal opinion files or spoken speeches that might match generic keywords
      if (/ARGUMENTS|OPINIONS|Admissions to the Bar|v\.\s+/i.test(cleanTitle)) continue;

      const id = `wm-${page.pageid || Math.random().toString(36).slice(2, 8)}`;
      results.push({
        id,
        title: cleanTitle || 'Study Soundscape',
        artist: rawArtist.slice(0, 45) || 'Public Domain Soundscape',
        category,
        source: 'Wikimedia Commons',
        sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        audioUrl: info.url,
        license: rawLicense,
        licenseUrl,
        suggestedFilename: `${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.mp3`,
        duration: info.duration ? Math.round(info.duration) : 180,
      });

      if (results.length >= limit) break;
    }

    return results;
  } catch (err: any) {
    console.warn(`[Wikimedia] Query notice for "${searchQuery}": ${err.message}`);
    return [];
  }
}

/**
 * Returns calibrated CC0 binaural carrier definitions for the Binaural category
 */
export function getBinauralDefinitions(): CandidateTrack[] {
  return [
    {
      id: 'bin-40hz-gamma-focus',
      title: '40Hz Gamma Focus State',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/40hz-gamma',
      audioUrl: 'internal://synthesize/binaural-40hz-gamma',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '40hz-gamma-focus.wav',
      duration: 180,
      baseTone: 216,
      freq: 40,
      tags: ['binaural', 'gamma', '40hz', 'deep focus', 'cognition', 'cc0'],
    },
    {
      id: 'bin-10hz-alpha-mindstate',
      title: '10Hz Alpha Mindstate',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/10hz-alpha',
      audioUrl: 'internal://synthesize/binaural-10hz-alpha',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '10hz-alpha-mindstate.wav',
      duration: 180,
      baseTone: 190,
      freq: 10,
      tags: ['binaural', 'alpha', '10hz', 'reading', 'memory', 'cc0'],
    },
    {
      id: 'bin-6hz-theta-recovery',
      title: '6Hz Theta Cognitive Reset',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/6hz-theta',
      audioUrl: 'internal://synthesize/binaural-6hz-theta',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '6hz-theta-cognitive-reset.wav',
      duration: 180,
      baseTone: 108,
      freq: 6,
      tags: ['binaural', 'theta', '6hz', 'reset', 'calm', 'cc0'],
    },
    {
      id: 'bin-14hz-beta-clarity',
      title: '14Hz SMR Beta Cognitive Precision',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/14hz-beta',
      audioUrl: 'internal://synthesize/binaural-14hz-beta',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '14hz-beta-cognitive-precision.wav',
      duration: 180,
      baseTone: 256,
      freq: 14,
      tags: ['binaural', 'beta', '14hz', 'math', 'precision', 'cc0'],
    },
    {
      id: 'bin-8hz-alpha-flow',
      title: '8Hz Low-Alpha Study Flow',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/8hz-alpha',
      audioUrl: 'internal://synthesize/binaural-8hz-alpha',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '8hz-low-alpha-study-flow.wav',
      duration: 180,
      baseTone: 136.1,
      freq: 8,
      tags: ['binaural', 'alpha', '8hz', 'study', 'flow', 'cc0'],
    },
    {
      id: 'bin-30hz-high-beta-sprint',
      title: '30Hz High-Beta Problem Solving',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/30hz-beta',
      audioUrl: 'internal://synthesize/binaural-30hz-beta',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '30hz-high-beta-problem-solving.wav',
      duration: 180,
      baseTone: 240,
      freq: 30,
      tags: ['binaural', 'beta', '30hz', 'coding', 'sprint', 'cc0'],
    },
    {
      id: 'bin-4hz-delta-deep-rest',
      title: '4Hz Delta Restorative Frequency',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/4hz-delta',
      audioUrl: 'internal://synthesize/binaural-4hz-delta',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '4hz-delta-restorative-frequency.wav',
      duration: 180,
      baseTone: 96,
      freq: 4,
      tags: ['binaural', 'delta', '4hz', 'restoration', 'recovery', 'cc0'],
    },
    {
      id: 'bin-12hz-alpha-retention',
      title: '12Hz Alpha Memory Retention',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/12hz-alpha',
      audioUrl: 'internal://synthesize/binaural-12hz-alpha',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '12hz-alpha-memory-retention.wav',
      duration: 180,
      baseTone: 200,
      freq: 12,
      tags: ['binaural', 'alpha', '12hz', 'exam', 'memory', 'cc0'],
    },
    {
      id: 'bin-18hz-beta-alertness',
      title: '18Hz Beta Alertness Architecture',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/18hz-beta',
      audioUrl: 'internal://synthesize/binaural-18hz-beta',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '18hz-beta-alertness-architecture.wav',
      duration: 180,
      baseTone: 220,
      freq: 18,
      tags: ['binaural', 'beta', '18hz', 'alertness', 'focus', 'cc0'],
    },
    {
      id: 'bin-432hz-harmonic-carrier',
      title: '432Hz Harmonic Grounding Tone',
      artist: 'Nivora Acoustic Labs',
      category: 'binaural',
      source: 'Nivora Open Audio',
      sourceUrl: 'https://nivora.app/audio/binaural/432hz-harmonic',
      audioUrl: 'internal://synthesize/binaural-432hz-harmonic',
      license: 'CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      suggestedFilename: '432hz-harmonic-grounding-tone.wav',
      duration: 180,
      baseTone: 432,
      freq: 8,
      tags: ['binaural', '432hz', 'harmonic', 'grounding', 'ambient', 'cc0'],
    },
  ];
}
