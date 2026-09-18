export type SeedCategory = 'focus' | 'lofi' | 'ambient' | 'classical' | 'nature' | 'binaural' | 'campus';

export interface SeededTrackMetadata {
  id: string;
  title: string;
  artist: string;
  category: string; // e.g. "Focus", "Lo-Fi", etc.
  audio: string; // e.g. "/music/focus/deep-focus.mp3"
  source: string; // approved source name (e.g. "Wikimedia Commons", "ccMixter", "Nivora Open Audio")
  sourceUrl: string; // URL to the track page / source record
  audioUrl: string; // direct download endpoint
  license: string; // license name (e.g. "Creative Commons Attribution 4.0", "CC0 1.0 Universal", "Public Domain")
  licenseUrl: string; // official license deed URL
  downloadedAt: string; // ISO 8601 timestamp
  localPath?: string; // relative path within project: nivora-music/focus/deep-focus.mp3
  duration?: number; // duration in seconds
  fileSizeBytes?: number;
  fileHash?: string; // SHA-256 binary hash
  artwork?: string; // high-quality matching artwork
}

export interface CandidateTrack {
  id: string;
  title: string;
  artist: string;
  category: SeedCategory;
  source: string;
  sourceUrl: string;
  audioUrl: string;
  license: string;
  licenseUrl: string;
  suggestedFilename: string;
  artwork?: string;
  duration?: number;
  tags?: string[];
  freq?: number;
  baseTone?: number;
}

export interface SeedSummary {
  downloaded: number;
  skipped: number;
  failed: number;
  categoryCounts: Record<SeedCategory, number>;
}
