/**
 * Zero-Knowledge Medical Encryption
 * Uses Web Crypto API (AES-GCM) to encrypt medical payloads before transmission.
 * The encryption key never leaves the client (conceptually), but for demo purposes
 * we derive a key from a fixed passphrase or randomly generate and store it in localStorage.
 */

const getEncryptionKey = async (): Promise<CryptoKey> => {
  const storedKey = localStorage.getItem('roadsos_zk_key');
  if (storedKey) {
    const rawKey = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate new key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await window.crypto.subtle.exportKey('raw', key);
  const exportedStr = btoa(String.fromCharCode(...new Uint8Array(exported)));
  localStorage.setItem('roadsos_zk_key', exportedStr);
  
  return key;
};

export const encryptData = async (data: any): Promise<{ cipherText: string, iv: string }> => {
  if (typeof window === 'undefined' || !window.crypto) {
    // Fallback for SSR or older browsers
    return { cipherText: btoa(JSON.stringify(data)), iv: 'fallback' };
  }

  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    cipherText: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

export const decryptData = async (cipherText: string, ivStr: string): Promise<any> => {
  if (ivStr === 'fallback') {
    return JSON.parse(atob(cipherText));
  }

  const key = await getEncryptionKey();
  const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
};
