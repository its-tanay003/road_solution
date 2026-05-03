export interface EncryptedPackage {
  cipherText: string;
  iv: string;
  authTag: string;
}

export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string, key: CryptoKey): Promise<EncryptedPackage> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const buffer = new Uint8Array(encryptedBuffer);
  // AES-GCM in WebCrypto combines ciphertext and auth tag. 
  // The last 16 bytes (128 bits) are the tag.
  const cipherPart = buffer.slice(0, buffer.length - 16);
  const tagPart = buffer.slice(buffer.length - 16);

  return {
    cipherText: btoa(String.fromCharCode(...cipherPart)),
    iv: btoa(String.fromCharCode(...iv)),
    authTag: btoa(String.fromCharCode(...tagPart)),
  };
};

export const decryptData = async (pkg: EncryptedPackage, key: CryptoKey): Promise<string> => {
  const cipherBuffer = Uint8Array.from(atob(pkg.cipherText), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(pkg.iv), c => c.charCodeAt(0));
  const tagBuffer = Uint8Array.from(atob(pkg.authTag), c => c.charCodeAt(0));

  // Combine cipher and tag back together for WebCrypto
  const combined = new Uint8Array(cipherBuffer.length + tagBuffer.length);
  combined.set(cipherBuffer);
  combined.set(tagBuffer, cipherBuffer.length);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    combined
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

export const exportKeyToHex = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
