import fs from 'fs';
import path from 'path';

/**
 * Audio Storage Engine
 * Supports dual-mode persistence:
 * 1. Supabase Storage (when configured in environment)
 * 2. Local streaming storage (zero-config, high-performance HTTP range streaming)
 */

interface StorageUploadResult {
  audioUrl: string;
  artworkUrl?: string;
  storageProvider: 'supabase' | 'local';
}

/**
 * Checks if Supabase Storage environment credentials are fully provided
 */
function isSupabaseStorageAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

/**
 * Ensures required directories exist on local filesystem
 */
function ensureLocalDirectories() {
  const publicAudioDir = path.join(process.cwd(), 'public', 'audio', 'library');
  const projectMusicDir = path.join(process.cwd(), 'music', 'library');
  const publicArtworkDir = path.join(process.cwd(), 'public', 'artwork', 'library');

  [publicAudioDir, projectMusicDir, publicArtworkDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return { publicAudioDir, projectMusicDir, publicArtworkDir };
}

/**
 * Stores an audio file and optional embedded artwork buffer/base64
 */
export async function storeAudioFile(options: {
  trackId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  artworkBuffer?: Buffer | null;
  userId?: string;
}): Promise<StorageUploadResult> {
  const { trackId, fileBuffer, fileName, artworkBuffer, userId = 'library' } = options;

  // Derive file extension
  const ext = path.extname(fileName).toLowerCase() || '.mp3';
  const cleanTrackId = trackId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const targetFileName = `${cleanTrackId}${ext}`;

  // 1. Check if Supabase Storage is configured
  if (isSupabaseStorageAvailable()) {
    try {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!).replace(/\/$/, '');
      const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

      const filePath = `music/${userId}/${targetFileName}`;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/music/${filePath}`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': options.mimeType || 'audio/mpeg',
          'x-upsert': 'true',
        },
        body: fileBuffer as unknown as BodyInit,
      });

      if (res.ok) {
        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/music/${filePath}`;
        let remoteArtworkUrl: string | undefined;

        if (artworkBuffer) {
          const artworkPath = `artwork/${userId}/${cleanTrackId}.jpg`;
          const artUploadUrl = `${supabaseUrl}/storage/v1/object/music/${artworkPath}`;
          const artRes = await fetch(artUploadUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true',
            },
            body: artworkBuffer as unknown as BodyInit,
          });
          if (artRes.ok) {
            remoteArtworkUrl = `${supabaseUrl}/storage/v1/object/public/music/${artworkPath}`;
          }
        }

        return {
          audioUrl: publicAudioUrl,
          artworkUrl: remoteArtworkUrl,
          storageProvider: 'supabase',
        };
      }
      console.warn('Supabase storage HTTP upload failed, falling back to local storage:', res.status, res.statusText);
    } catch (err) {
      console.warn('Supabase upload exception, using local storage fallback:', err);
    }
  }

  // 2. Local Streaming Storage (High-Performance Native Next.js Serving)
  const { publicAudioDir, projectMusicDir, publicArtworkDir } = ensureLocalDirectories();

  // Save audio file to both public/audio/library and music/library
  const publicAudioPath = path.join(publicAudioDir, targetFileName);
  const projectMusicPath = path.join(projectMusicDir, targetFileName);

  fs.writeFileSync(publicAudioPath, fileBuffer);
  try {
    fs.writeFileSync(projectMusicPath, fileBuffer);
  } catch {}

  const audioUrl = `/audio/library/${targetFileName}`;

  // Save artwork if provided
  let artworkUrl: string | undefined;
  if (artworkBuffer && artworkBuffer.length > 0) {
    const artworkFileName = `${cleanTrackId}.jpg`;
    const publicArtworkPath = path.join(publicArtworkDir, artworkFileName);
    fs.writeFileSync(publicArtworkPath, artworkBuffer);
    artworkUrl = `/artwork/library/${artworkFileName}`;
  }

  return {
    audioUrl,
    artworkUrl,
    storageProvider: 'local',
  };
}

/**
 * Deletes an audio file and its associated artwork from storage
 */
export async function deleteAudioFile(audioUrl: string, artworkUrl?: string | null): Promise<void> {
  try {
    // 1. Supabase Storage cleanup if applicable
    if (isSupabaseStorageAvailable()) {
      try {
        const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!).replace(/\/$/, '');
        const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

        const filesToDelete: string[] = [];
        if (audioUrl.includes('/storage/v1/object/public/music/')) {
          const parts = audioUrl.split('/storage/v1/object/public/music/');
          if (parts[1]) filesToDelete.push(parts[1]);
        }
        if (artworkUrl && artworkUrl.includes('/storage/v1/object/public/music/')) {
          const parts = artworkUrl.split('/storage/v1/object/public/music/');
          if (parts[1]) filesToDelete.push(parts[1]);
        }

        if (filesToDelete.length > 0) {
          await fetch(`${supabaseUrl}/storage/v1/object/music`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prefixes: filesToDelete }),
          });
        }
      } catch (sbErr) {
        console.warn('Supabase storage delete warning:', sbErr);
      }
    }

    // 2. Local filesystem cleanup
    if (audioUrl.startsWith('/audio/library/')) {
      const fileName = path.basename(audioUrl);
      const publicPath = path.join(process.cwd(), 'public', 'audio', 'library', fileName);
      const musicPath = path.join(process.cwd(), 'music', 'library', fileName);
      if (fs.existsSync(publicPath)) fs.unlinkSync(publicPath);
      if (fs.existsSync(musicPath)) fs.unlinkSync(musicPath);
    }

    if (artworkUrl && artworkUrl.startsWith('/artwork/library/')) {
      const artName = path.basename(artworkUrl);
      const artPath = path.join(process.cwd(), 'public', 'artwork', 'library', artName);
      if (fs.existsSync(artPath)) fs.unlinkSync(artPath);
    }
  } catch (err) {
    console.error('Error deleting audio file from storage:', err);
  }
}
