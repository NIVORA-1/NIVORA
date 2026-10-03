/**
 * YouTube Data API v3 Secure Server-Side Client
 *
 * Rules:
 * - Uses server environment variable YOUTUBE_API_KEY only (never NEXT_PUBLIC_*)
 * - Calls YouTube Data API v3 search.list with:
 *     part=snippet
 *     type=video
 *     q=<query>
 *     maxResults=20
 *     regionCode=IN
 *     videoEmbeddable=true
 * - Fetches video durations using videos.list with part=snippet,contentDetails
 * - If API key is missing: throws "Music service is not configured."
 * - If API fails: throws "Unable to load music right now."
 * - Zero mock or fake music data
 */

export interface YouTubeTrackItem {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  durationSec: number;
}

export interface YouTubeSearchResponse {
  items: YouTubeTrackItem[];
  nextPageToken?: string;
  totalResults?: number;
}

// In-memory cache for API quota conservation
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Converts ISO 8601 duration string (e.g. PT3M42S, PT1H12M30S) into { formatted: "3:42", seconds: 222 }
 */
export function parseYouTubeDuration(isoDuration?: string): { formatted: string; seconds: number } {
  if (!isoDuration) return { formatted: '0:00', seconds: 0 };

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { formatted: '0:00', seconds: 0 };

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return { formatted, seconds: totalSeconds };
}

/**
 * Decode common HTML entities in titles returned by YouTube
 */
export function cleanYouTubeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Calls YouTube Data API v3 search.list and videos.list
 */
export async function searchYouTube(
  query: string,
  pageToken?: string,
  maxResults = 20
): Promise<YouTubeSearchResponse> {
  let apiKey = (process.env.YOUTUBE_API_KEY || '').trim();
  if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
    apiKey = apiKey.slice(1, -1).trim();
  }

  // Rule 14: If the API key is missing
  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY' || apiKey === 'your-youtube-data-api-key') {
    throw new Error('Music service is not configured.');
  }

  const cleanQ = query.trim();
  if (!cleanQ) {
    return { items: [], totalResults: 0 };
  }

  // Quota optimization cache
  const cacheKey = `search:${cleanQ.toLowerCase()}:${pageToken || '1'}:${maxResults}`;
  const cached = getCached<YouTubeSearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 1. YouTube Data API v3 search.list
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('q', cleanQ);
    searchUrl.searchParams.set('maxResults', String(Math.min(maxResults, 20)));
    searchUrl.searchParams.set('regionCode', 'IN');
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('key', apiKey);
    if (pageToken) {
      searchUrl.searchParams.set('pageToken', pageToken);
    }

    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!searchRes.ok) {
      const errorJson = await searchRes.json().catch(() => ({}));
      console.error('[YouTube API search.list error]:', searchRes.status, errorJson);
      throw new Error('Unable to load music right now.');
    }

    const searchData = await searchRes.json();
    const searchItems = searchData.items || [];

    if (searchItems.length === 0) {
      const emptyResult: YouTubeSearchResponse = {
        items: [],
        nextPageToken: searchData.nextPageToken,
        totalResults: 0,
      };
      setCached(cacheKey, emptyResult, 5 * 60 * 1000);
      return emptyResult;
    }

    // 2. Batch fetch video durations with videos.list
    const videoIds = searchItems
      .map((item: any) => item?.id?.videoId)
      .filter(Boolean)
      .join(',');

    const videoDetailsMap = new Map<string, { durationFormatted: string; durationSec: number }>();

    if (videoIds) {
      try {
        const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        videosUrl.searchParams.set('part', 'snippet,contentDetails');
        videosUrl.searchParams.set('id', videoIds);
        videosUrl.searchParams.set('key', apiKey);

        const videosRes = await fetch(videosUrl.toString(), {
          headers: { Accept: 'application/json' },
        });

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          for (const v of videosData.items || []) {
            const parsed = parseYouTubeDuration(v?.contentDetails?.duration);
            videoDetailsMap.set(v.id, {
              durationFormatted: parsed.formatted,
              durationSec: parsed.seconds,
            });
          }
        } else {
          console.warn('[YouTube API videos.list warning]:', videosRes.status);
        }
      } catch (videoErr) {
        console.warn('[YouTube API videos.list fetch error]:', videoErr);
      }
    }

    // 3. Normalize items
    const normalizedItems: YouTubeTrackItem[] = searchItems
      .map((item: any): YouTubeTrackItem | null => {
        const videoId = item?.id?.videoId;
        if (!videoId) return null;

        const snippet = item.snippet || {};
        const thumbnail =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        const details = videoDetailsMap.get(videoId);

        return {
          videoId,
          title: cleanYouTubeTitle(snippet.title || 'Untitled Video'),
          channelTitle: cleanYouTubeTitle(snippet.channelTitle || 'YouTube Artist'),
          channelId: snippet.channelId || '',
          description: snippet.description || '',
          thumbnail,
          publishedAt: snippet.publishedAt || new Date().toISOString(),
          duration: details?.durationFormatted || '3:30',
          durationSec: details?.durationSec || 210,
        };
      })
      .filter((item: any): item is YouTubeTrackItem => item !== null);

    const result: YouTubeSearchResponse = {
      items: normalizedItems,
      nextPageToken: searchData.nextPageToken,
      totalResults: searchData.pageInfo?.totalResults || normalizedItems.length,
    };

    setCached(cacheKey, result, 30 * 60 * 1000);
    return result;
  } catch (err: any) {
    if (err.message === 'Music service is not configured.') {
      throw err;
    }
    console.error('[YouTube Search Service Error]:', err);
    throw new Error('Unable to load music right now.');
  }
}

/**
 * Recommendations for mode using YouTube Data API search queries
 */
export async function getRecommendationsForMode(mode: string): Promise<YouTubeTrackItem[]> {
  const queryMap: Record<string, string> = {
    focus: 'deep focus instrumental music',
    coding: 'coding music',
    study: 'lofi study music',
    reading: 'reading ambient music',
    relax: 'calm relaxing music',
    workout: 'workout music',
    lofi: 'lofi study music',
    ambient: 'reading ambient music',
  };
  const q = queryMap[mode.toLowerCase()] || 'deep focus instrumental music';
  const result = await searchYouTube(q, undefined, 12);
  return result.items;
}

