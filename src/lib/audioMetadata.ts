import { MusicCategory } from './musicData';

export interface ExtractedMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre: string;
  year?: string;
  duration: number; // in seconds
  artworkBlob: Blob | null;
  artworkPreviewUrl: string | null;
  fileHash: string;
  category: MusicCategory;
  isDuplicate?: boolean;
  duplicateResolution?: 'skip' | 'replace' | 'keep';
  isValid?: boolean;
  validationError?: string;
}

/**
 * Cleans a filename into a polished, editorial title
 * e.g. "alex-morgan-phonk-aggressive-drift-night-573644.mp3" -> "Aggressive Drift Night (Phonk)"
 */
export function cleanFileNameToTitle(fileName: string): string {
  // Remove extension
  let name = fileName.replace(/\.[a-zA-Z0-9]+$/i, '');

  // Strip common downloader tags like [320kbps], (Official Audio), Pixabay IDs (-573644)
  name = name.replace(/-\d{5,9}$/, ''); // trailing 5-9 digit asset numbers
  name = name.replace(/\((?:official|audio|video|lyrics|hd|hq|320kbps|remastered)\)/gi, '');
  name = name.replace(/\[(?:official|audio|video|lyrics|hd|hq|320kbps|remastered)\]/gi, '');

  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]+/g, ' ').trim();

  // Words capitalization
  const words = name.split(/\s+/).filter(Boolean);
  const capitalized = words.map((w, idx) => {
    const lower = w.toLowerCase();
    const minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'with'];
    if (idx !== 0 && minorWords.includes(lower)) {
      return lower;
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  return capitalized.join(' ') || 'Untitled Soundscape';
}

/**
 * Computes a fast SHA-256 hash of a file for duplicate detection
 */
export async function computeFileHash(file: File): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Hash first 64KB + last 64KB + file size for speed and accuracy
      const sliceSize = 65536;
      let bufferToHash: ArrayBuffer;

      if (file.size <= sliceSize * 2) {
        bufferToHash = await file.arrayBuffer();
      } else {
        const head = await file.slice(0, sliceSize).arrayBuffer();
        const tail = await file.slice(file.size - sliceSize, file.size).arrayBuffer();
        const combined = new Uint8Array(head.byteLength + tail.byteLength + 8);
        combined.set(new Uint8Array(head), 0);
        combined.set(new Uint8Array(tail), head.byteLength);
        // Write size as bytes
        const sizeView = new DataView(combined.buffer, head.byteLength + tail.byteLength, 8);
        sizeView.setFloat64(0, file.size);
        bufferToHash = combined.buffer;
      }

      const hashBuffer = await window.crypto.subtle.digest('SHA-256', bufferToHash);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Hash computation failed, using fallback hash:', err);
  }

  // Fallback hash
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Automatically infers a Nivora Sound Category from tags, genre, title, and filename
 */
export function inferCategory(
  genre = '',
  title = '',
  fileName = ''
): MusicCategory {
  const combined = `${genre} ${title} ${fileName}`.toLowerCase();

  if (/lo[- ]?fi|chill|tape|rhodes|beats|cozy|cassette/i.test(combined)) {
    return 'lofi';
  }
  if (/ambient|drone|soundscape|pad|ethereal|space|calm|quiet|sleep|relax/i.test(combined)) {
    return 'ambient';
  }
  if (/classical|piano|felt|chopin|bach|beethoven|orchestra|violin|strings|symphony/i.test(combined)) {
    return 'classical';
  }
  if (/rain|water|nature|ocean|forest|stream|birds|thunder|waves|wind/i.test(combined)) {
    return 'nature';
  }
  if (/binaural|gamma|alpha|theta|delta|40hz|carrier|frequency|isochronic/i.test(combined)) {
    return 'binaural';
  }
  if (/campus|library|oxford|cambridge|bodleian|courtyard|hall|walk/i.test(combined)) {
    return 'campus';
  }
  if (/focus|drift|phonk|sprint|coding|intense|velocity|bass|deepwork|algorithm/i.test(combined)) {
    return 'focus';
  }

  return 'focus';
}

/**
 * Extracts accurate audio duration in seconds
 */
export async function extractAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(180);
      return;
    }

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.preload = 'metadata';

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      URL.revokeObjectURL(objectUrl);
    };

    const onLoaded = () => {
      const dur = Math.round(audio.duration);
      cleanup();
      resolve(isFinite(dur) && dur > 0 ? dur : 180);
    };

    const onError = () => {
      cleanup();
      resolve(180);
    };

    // Timeout safety
    const timer = setTimeout(() => {
      cleanup();
      resolve(180);
    }, 4000);

    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(timer);
      onLoaded();
    });
    audio.addEventListener('error', () => {
      clearTimeout(timer);
      onError();
    });

    audio.src = objectUrl;
  });
}

/**
 * Pure TypeScript ID3v2 binary metadata parser
 */
function parseId3Tags(buffer: ArrayBuffer): {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  genre?: string;
  year?: string;
  artworkBlob?: Blob;
} {
  const result: {
    title?: string;
    artist?: string;
    album?: string;
    albumArtist?: string;
    genre?: string;
    year?: string;
    artworkBlob?: Blob;
  } = {};

  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return result;

  // Check ID3 magic header "ID3"
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return result;
  }

  const version = bytes[3]; // 3 for ID3v2.3, 4 for ID3v2.4
  const tagSize =
    ((bytes[6] & 0x7f) << 21) |
    ((bytes[7] & 0x7f) << 14) |
    ((bytes[8] & 0x7f) << 7) |
    (bytes[9] & 0x7f);

  const maxOffset = Math.min(bytes.length, 10 + tagSize);
  let offset = 10;

  const decoderUtf8 = new TextDecoder('utf-8');
  const decoderIso = new TextDecoder('iso-8859-1');

  function decodeString(data: Uint8Array, encodingByte: number): string {
    if (encodingByte === 0) return decoderIso.decode(data).replace(/\0/g, '').trim();
    if (encodingByte === 1 || encodingByte === 2) {
      // UTF-16
      const str = new TextDecoder('utf-16').decode(data);
      return str.replace(/\0/g, '').trim();
    }
    return decoderUtf8.decode(data).replace(/\0/g, '').trim();
  }

  while (offset + 10 < maxOffset) {
    // Read 4-character frame ID
    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );

    // Read frame size
    let frameSize = 0;
    if (version === 4) {
      frameSize =
        ((bytes[offset + 4] & 0x7f) << 21) |
        ((bytes[offset + 5] & 0x7f) << 14) |
        ((bytes[offset + 6] & 0x7f) << 7) |
        (bytes[offset + 7] & 0x7f);
    } else {
      frameSize =
        (bytes[offset + 4] << 24) |
        (bytes[offset + 5] << 16) |
        (bytes[offset + 6] << 8) |
        bytes[offset + 7];
    }

    if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) {
      break;
    }

    const frameData = bytes.subarray(offset + 10, offset + 10 + frameSize);
    offset += 10 + frameSize;

    if (frameData.length <= 1) continue;

    const encoding = frameData[0];
    const textData = frameData.subarray(1);

    switch (frameId) {
      case 'TIT2': // Title
        result.title = decodeString(textData, encoding);
        break;
      case 'TPE1': // Artist / Lead performer
        result.artist = decodeString(textData, encoding);
        break;
      case 'TPE2': // Band / Orchestra / Album Artist
        result.albumArtist = decodeString(textData, encoding);
        break;
      case 'TALB': // Album
        result.album = decodeString(textData, encoding);
        break;
      case 'TCON': // Genre
        result.genre = decodeString(textData, encoding);
        break;
      case 'TYER': // Year (ID3v2.3)
      case 'TDRC': // Year/Recording time (ID3v2.4)
        result.year = decodeString(textData, encoding);
        break;
      case 'APIC': { // Embedded Album Art
        try {
          // APIC format: [encoding][mime null-terminated][pic-type][description null-terminated][binary image]
          let mimeEnd = 1;
          while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0) {
            mimeEnd++;
          }
          const mimeType = decoderIso.decode(frameData.subarray(1, mimeEnd)).trim() || 'image/jpeg';
          let imageStart = mimeEnd + 2; // skip picture type (1 byte)

          // Skip description null terminator based on encoding
          if (encoding === 0 || encoding === 3) {
            while (imageStart < frameData.length && frameData[imageStart] !== 0) {
              imageStart++;
            }
            imageStart += 1;
          } else {
            while (imageStart + 1 < frameData.length && !(frameData[imageStart] === 0 && frameData[imageStart + 1] === 0)) {
              imageStart += 2;
            }
            imageStart += 2;
          }

          if (imageStart < frameData.length) {
            const imageBytes = frameData.subarray(imageStart);
            result.artworkBlob = new Blob([imageBytes], { type: mimeType });
          }
        } catch {}
        break;
      }
    }
  }

  return result;
}

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

/**
 * Validates whether an audio file is acceptable
 */
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!SUPPORTED_EXTENSIONS.includes(ext) && !file.type.startsWith('audio/')) {
    return {
      isValid: false,
      error: `Unsupported file type (${ext || file.type}). Please select MP3, WAV, OGG, or M4A files.`,
    };
  }

  if (file.size <= 0) {
    return {
      isValid: false,
      error: 'Empty audio file (0 bytes).',
    };
  }

  // 150MB limit per file
  const MAX_SIZE_BYTES = 150 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds 150MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { isValid: true };
}

/**
 * Complete Metadata Extraction function for a user-selected audio file
 */
export async function extractMetadataFromFile(file: File): Promise<ExtractedMetadata> {
  const validation = validateAudioFile(file);
  const ext = file.name.split('.').pop()?.toUpperCase() || 'MP3';

  if (!validation.isValid) {
    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'audio/mpeg',
      fileExtension: ext,
      title: cleanFileNameToTitle(file.name),
      artist: 'Nivora Sounds',
      album: 'Nivora Music',
      genre: 'Focus',
      duration: 180,
      artworkBlob: null,
      artworkPreviewUrl: null,
      fileHash: `${file.name}-${file.size}`,
      category: 'focus',
      isDuplicate: false,
      duplicateResolution: 'skip',
      isValid: false,
      validationError: validation.error,
    };
  }

  const fileHash = await computeFileHash(file);
  const duration = await extractAudioDuration(file);

  // Read first 512KB for ID3 tags
  let id3Tags: ReturnType<typeof parseId3Tags> = {};
  try {
    const headerBuffer = await file.slice(0, 524288).arrayBuffer();
    id3Tags = parseId3Tags(headerBuffer);
  } catch (err) {
    console.warn('Could not parse ID3 tags:', err);
  }

  const cleanedTitle = cleanFileNameToTitle(file.name);
  const title = id3Tags.title && id3Tags.title.trim() ? id3Tags.title.trim() : cleanedTitle;
  const artist =
    id3Tags.artist && id3Tags.artist.trim()
      ? id3Tags.artist.trim()
      : id3Tags.albumArtist && id3Tags.albumArtist.trim()
      ? id3Tags.albumArtist.trim()
      : 'Nivora Sounds';
  const album = id3Tags.album && id3Tags.album.trim() ? id3Tags.album.trim() : 'Nivora Music';
  const albumArtist = id3Tags.albumArtist && id3Tags.albumArtist.trim() ? id3Tags.albumArtist.trim() : undefined;
  const genre = id3Tags.genre && id3Tags.genre.trim() ? id3Tags.genre.trim() : 'Focus';
  const year = id3Tags.year ? id3Tags.year.trim() : undefined;

  let artworkBlob: Blob | null = id3Tags.artworkBlob || null;
  let artworkPreviewUrl: string | null = null;

  if (artworkBlob) {
    artworkPreviewUrl = URL.createObjectURL(artworkBlob);
  }

  const category = inferCategory(genre, title, file.name);

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'audio/mpeg',
    fileExtension: ext,
    title,
    artist,
    album,
    albumArtist,
    genre,
    year,
    duration,
    artworkBlob,
    artworkPreviewUrl,
    fileHash,
    category,
    isDuplicate: false,
    duplicateResolution: 'skip',
    isValid: true,
  };
}
