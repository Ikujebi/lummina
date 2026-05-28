// lib/cloudinary/ensureCloudinaryReady.ts
import { validateCloudinaryConfig } from "./validateCloudinaryConfig";
import { generateTestSignature } from "./testSignature";

export function ensureCloudinaryReady() {
  const config = validateCloudinaryConfig();

  if (!config.valid) {
    throw new Error(
      `Cloudinary config invalid: ${config.errors.join(", ")}`
    );
  }

  const testSig = generateTestSignature(config.apiSecret!);

  if (!testSig || testSig.length !== 40) {
    throw new Error("Cloudinary signature generation failed");
  }

  return true;
}