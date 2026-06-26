import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const cipherText = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, cipherText].map((part) => part.toString("base64")).join(":");
}

export function decryptSecret(encryptedValue: string): string {
  const [ivValue, authTagValue, cipherTextValue] = encryptedValue.split(":");
  if (!ivValue || !authTagValue || !cipherTextValue) {
    throw new Error("Encrypted secret is not in the expected format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64"));
  const plainText = Buffer.concat([
    decipher.update(Buffer.from(cipherTextValue, "base64")),
    decipher.final()
  ]);
  return plainText.toString("utf8");
}

function getEncryptionKey() {
  const secret = process.env.META_TOKEN_ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_KEY is missing.");
  }
  return createHash("sha256").update(secret).digest();
}
