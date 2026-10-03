/**
 * Audio URL Validation Utility for Nivora Music
 * Ensures all audio and artwork URLs are valid, secure HTTPS URLs.
 */

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  cleanUrl?: string;
}

/**
 * Validates external audio URLs
 * Requirements:
 * - Must not be empty
 * - Must be trimmed
 * - Must use HTTPS protocol (or internal:// for procedural synthetic generators)
 * - Must be a valid well-formed URL
 */
export function validateAudioUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Audio URL is required.' };
  }

  const cleanUrl = rawUrl.trim();

  if (cleanUrl.length === 0) {
    return { isValid: false, error: 'Audio URL cannot be empty or whitespace only.' };
  }

  // Allow internal procedural synthesis protocol
  if (cleanUrl.startsWith('internal://synthesize/')) {
    return { isValid: true, cleanUrl };
  }

  // Reject local file system or relative paths
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../') || cleanUrl.startsWith('file://')) {
    return {
      isValid: false,
      error: 'Local audio file paths are not permitted. Please provide an external HTTPS audio URL.',
    };
  }

  // Require HTTPS
  if (cleanUrl.startsWith('http://')) {
    return {
      isValid: false,
      error: 'Insecure HTTP URLs are not permitted. Please use HTTPS.',
    };
  }

  if (!cleanUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Audio URL must start with https://',
    };
  }

  try {
    const parsed = new URL(cleanUrl);
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS audio streams are supported.' };
    }
    if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) {
      return { isValid: false, error: 'Please enter a valid domain name.' };
    }

    return { isValid: true, cleanUrl };
  } catch {
    return { isValid: false, error: 'Malformed URL format. Please enter a valid HTTPS URL.' };
  }
}

/**
 * Validates external artwork / cover image URLs
 */
export function validateCoverUrl(rawUrl?: string | null): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    // Optional field
    return { isValid: true, cleanUrl: '' };
  }

  const cleanUrl = rawUrl.trim();

  // Allow empty or relative fallback placeholders
  if (cleanUrl.startsWith('/')) {
    return { isValid: true, cleanUrl };
  }

  if (cleanUrl.startsWith('http://')) {
    return {
      isValid: false,
      error: 'Insecure HTTP URLs are not permitted for artwork. Please use HTTPS.',
    };
  }

  if (!cleanUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Cover image URL must start with https://',
    };
  }

  try {
    const parsed = new URL(cleanUrl);
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS artwork URLs are supported.' };
    }
    return { isValid: true, cleanUrl };
  } catch {
    return { isValid: false, error: 'Malformed artwork URL.' };
  }
}
