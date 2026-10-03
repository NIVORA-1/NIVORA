import crypto from 'crypto';

/**
 * Derives a consistent 32-byte key from JWT_SECRET or fallback
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'nivora-classroom-encryption-secret-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive OAuth tokens at rest using AES-256-GCM.
 * Format: iv:authTag:encryptedContent (hex encoded)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[TokenEncryption] Failed to encrypt token:', error);
    return plainText; // Fail safe return
  }
}

/**
 * Decrypts AES-256-GCM encrypted tokens.
 * Gracefully handles unencrypted legacy tokens if format does not match.
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Not encrypted with this format, return as-is
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[TokenEncryption] Failed to decrypt token, using fallback:', error);
    return cipherText;
  }
}
