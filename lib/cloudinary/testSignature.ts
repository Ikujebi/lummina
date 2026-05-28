// lib/cloudinary/testSignature.ts
import crypto from "crypto";

export function generateTestSignature(apiSecret: string) {
  const timestamp = 1234567890;
  const folder = "test";

  const stringToSign = `folder=${folder}&timestamp=${timestamp}`;

  return crypto
    .createHash("sha1")
    .update(stringToSign + apiSecret)
    .digest("hex");
}