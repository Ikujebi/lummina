// lib/cloudinary/validateCloudinaryConfig.ts
import crypto from "crypto";

export function validateCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const errors: string[] = [];

  if (!cloudName) errors.push("Missing CLOUDINARY_CLOUD_NAME");
  if (!apiKey) errors.push("Missing CLOUDINARY_API_KEY");
  if (!apiSecret) errors.push("Missing CLOUDINARY_API_SECRET");

  if (apiSecret && apiSecret.length < 20) {
    errors.push("API secret looks invalid (too short)");
  }

  return {
    valid: errors.length === 0,
    errors,
    cloudName,
    apiKey,
    apiSecret,
  };
}