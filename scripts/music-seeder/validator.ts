import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CandidateTrack, SeededTrackMetadata } from './types';

/**
 * Converts any string into a clean, safe filename (lowercase alphanumeric, hyphens)
 * Example: "Chopin - Nocturne Op. 9 No. 2" -> "chopin-nocturne-op-9-no-2.mp3"
 */
export function sanitizeFilename(name: string, ext: string = '.mp3'): string {
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  const base = name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '') // Remove existing extension if present
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens
    .slice(0, 60); // Restrict length for safety

  return `${base || 'track'}${normalizedExt}`;
}

/**
 * Computes SHA-256 hash of a file on disk
 */
export function computeFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validates whether a file is non-empty and starts with recognized audio magic bytes
 */
export function isValidAudioFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < 10240) return false; // Must be at least 10 KB

    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    // Check MP3 ID3 header: 'ID3' (0x49, 0x44, 0x33)
    if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
      return true;
    }

    // Check MP3 sync frame: 0xFF 0xFB, 0xFF 0xF3, 0xFF 0xF2, 0xFF 0xE3
    if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
      return true;
    }

    // Check Ogg header: 'OggS' (0x4F, 0x67, 0x67, 0x53)
    if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
      return true;
    }

    // Check WAV header: 'RIFF' ... 'WAVE'
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x41 &&
      buffer[10] === 0x56 &&
      buffer[11] === 0x45
    ) {
      return true;
    }

    // Fallback: If size is substantial (> 30KB), treat as valid audio container
    return stat.size > 30720;
  } catch {
    return false;
  }
}

/**
 * Checks whether a candidate track is already downloaded or exists in the library
 */
export function checkDuplicate(
  candidate: CandidateTrack,
  existingTracks: SeededTrackMetadata[],
  targetFilePath: string
): { isDuplicate: boolean; reason?: string } {
  // 1. Check if the exact target file already exists and is valid
  if (fs.existsSync(targetFilePath) && isValidAudioFile(targetFilePath)) {
    return { isDuplicate: true, reason: 'File already exists on disk' };
  }

  // 2. Check matching ID or audio URL in existing metadata
  const existingById = existingTracks.find(
    (t) => t.id === candidate.id || t.audioUrl === candidate.audioUrl
  );
  if (existingById) {
    return { isDuplicate: true, reason: `Track already in library (ID: ${existingById.id})` };
  }

  // 3. Check matching title + artist
  const normTitle = candidate.title.toLowerCase().trim();
  const normArtist = candidate.artist.toLowerCase().trim();
  const existingByName = existingTracks.find(
    (t) =>
      t.title.toLowerCase().trim() === normTitle &&
      t.artist.toLowerCase().trim() === normArtist
  );
  if (existingByName) {
    return { isDuplicate: true, reason: `Track title & artist match existing track (${existingByName.title})` };
  }

  return { isDuplicate: false };
}
