import CryptoJS from 'crypto-js';

const getDefaultKey = (): string => {
  const envKey = process.env.NEXT_PUBLIC_DECRYPTION_KEY;
  if (!envKey) {
    throw new Error('NEXT_PUBLIC_DECRYPTION_KEY environment variable is not defined');
  }
  return envKey;
};

/**
 * Attempt AES decryption with a given key.
 * Returns the decrypted string ONLY if it looks like valid JSON (starts with { or [).
 * Returns null on any failure or if the result is clearly garbage from a wrong key.
 */
const tryDecrypt = (encryptedText: string, key: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    let result: string;
    try {
      result = bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
    // Empty result means wrong key
    if (!result) return null;
    // Wrong keys produce garbage bytes — valid API responses are always JSON
    if (!result.startsWith('{') && !result.startsWith('[')) return null;
    return result;
  } catch {
    return null;
  }
};

export const encrypt = (text: string, overrideKey?: string): string => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, overrideKey || getDefaultKey()).toString();
};

export const decrypt = (encryptedText: string, overrideKey?: string): string => {
  if (!encryptedText || !encryptedText.startsWith('U2FsdGVk')) {
    return encryptedText;
  }

  // 1. Try with the tenant/override key first
  if (overrideKey) {
    const result = tryDecrypt(encryptedText, overrideKey);
    if (result) return result;
  }

  // 2. Fallback to the default key
  const result = tryDecrypt(encryptedText, getDefaultKey());
  if (result) return result;

  // 3. Both failed — return original (interceptor won't JSON.parse it since it doesn't start with { or [)
  return encryptedText;
};
