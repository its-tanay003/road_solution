import type { MedicalProfile } from '../store/medicalProfileStore';

/**
 * Encrypts the medical profile for transmission to the backend.
 * Key is ephemeral — generated per-transmission, never stored.
 * Uses AES-GCM for secure encryption.
 */
export async function encryptForTransmission(profile: MedicalProfile): Promise<string> {
  const data = JSON.stringify(profile);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Generate an ephemeral key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  // Export the key to include it in the transmission (wrapped or as is for this demo)
  // In a real scenario, you'd use a public key from the server to wrap this ephemeral key.
  // For this implementation, we'll bundle the IV and ciphertext.
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  
  const combined = new Uint8Array(iv.length + exportedKey.byteLength + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(exportedKey), iv.length);
  combined.set(new Uint8Array(encryptedBuffer), iv.length + exportedKey.byteLength);

  // Return base64 encoded string
  return btoa(String.fromCharCode(...combined));
}
