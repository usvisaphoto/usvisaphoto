import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const TOKEN_VERSION = "v1";

function getEncryptionKey() {
  const secret =
    process.env.DOWNLOAD_TOKEN_SECRET ||
    process.env.PAYPAL_SECRET;

  if (!secret || secret.length < 24) {
    throw new Error("Secure download token secret is unavailable.");
  }

  return createHash("sha256")
    .update(`usvisaphoto:${secret}`)
    .digest();
}

export function sealPhoto(buffer: Buffer) {
  const issuedAt = Buffer.allocUnsafe(8);
  issuedAt.writeBigUInt64BE(BigInt(Date.now()));
  const payload = Buffer.concat([issuedAt, buffer]);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function unsealPhoto(token: string) {
  const [version, ivValue, tagValue, encryptedValue] = token.split(".");
  if (version !== TOKEN_VERSION || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid secure photo token.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  const payload = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]);
  const issuedAt = Number(payload.readBigUInt64BE(0));
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > 24 * 60 * 60 * 1000) {
    throw new Error("Secure photo token has expired.");
  }
  return payload.subarray(8);
}

export function getDownloadManifest(tokens: string[]) {
  return createHash("sha256")
    .update(tokens.join("\n"))
    .digest("base64url")
    .slice(0, 32);
}
