const SECRET = "MY_ENCRYPT_SECRET";
const SALT = "MY_ENCRYPT_SALT";

const encoder = new TextEncoder();
async function getKey(): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt"]
  );
}


export async function encryptAES(payload: unknown): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const text = encoder.encode(JSON.stringify(payload));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    text
  );

  // Combine iv + encrypted data (ciphertext + authTag)
  const encrypted = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encrypted.length);

  combined.set(iv, 0);
  combined.set(encrypted, iv.length);

  // Base64 URL-safe
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
