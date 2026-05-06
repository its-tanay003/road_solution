// Client-side AES-GCM-256 encryption for sensitive data
// Key is generated on first run and stored in localStorage — never leaves the device
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const STORAGE_KEY = 'roadsos_enc_key';

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await crypto.subtle.importKey('raw', raw, ALGORITHM, false, ['encrypt', 'decrypt']);
    } catch {
      // Key corrupted — regenerate
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...new Uint8Array(exported))));
  return key;
}

/**
 * Encrypt any serializable object with AES-GCM-256.
 * Returns a base64-encoded string containing the IV + ciphertext.
 */
export async function encryptData(data: object): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64-encoded string produced by encryptData.
 */
export async function decryptData<T = unknown>(ciphertext: string): Promise<T> {
  const key = await getOrCreateKey();
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

/**
 * Encrypt and store medical data in localStorage.
 */
export async function storeMedicalDataEncrypted(payload: {
  bloodGroup: string;
  allergies: string[];
  emergencyContact: string;
}): Promise<void> {
  const encrypted = await encryptData(payload);
  localStorage.setItem('roadsos_medical_enc', encrypted);
}

/**
 * Retrieve and decrypt medical data from localStorage.
 */
export async function loadMedicalDataDecrypted(): Promise<{
  bloodGroup: string;
  allergies: string[];
  emergencyContact: string;
} | null> {
  const stored = localStorage.getItem('roadsos_medical_enc');
  if (!stored) return null;
  try {
    return await decryptData(stored);
  } catch {
    return null;
  }
}
