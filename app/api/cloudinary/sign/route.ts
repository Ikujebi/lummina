import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function validateCloudinaryEnv(): CloudinaryEnv {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const errors: string[] = [];

  if (!cloudName) errors.push("Missing CLOUDINARY_CLOUD_NAME");
  if (!apiKey) errors.push("Missing CLOUDINARY_API_KEY");
  if (!apiSecret) errors.push("Missing CLOUDINARY_API_SECRET");

  if (apiSecret && apiSecret.trim().length < 20) {
    errors.push("CLOUDINARY_API_SECRET looks invalid (too short)");
  }

  if (errors.length) {
    throw new Error(`Cloudinary config invalid: ${errors.join(", ")}`);
  }

  return {
    cloudName: cloudName!.trim(),
    apiKey: apiKey!.trim(),
    apiSecret: apiSecret!.trim(),
  };
}

export async function GET() {
  const { cloudName, apiKey, apiSecret } = validateCloudinaryEnv();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "profile_pictures";

  // Canonical parameter object
  const params = {
    folder,
    timestamp: String(timestamp),
  };

  // Strict Cloudinary-safe string construction
  const signatureString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&");

  // Optional debug (safe for production logs)
  console.log("SIGN INPUT CHECK:", {
    folder,
    timestamp,
    signatureString,
  });

  const signature = crypto
    .createHash("sha1")
    .update(signatureString + apiSecret)
    .digest("hex");

  console.log("=== CLOUDINARY SIGN DEBUG ===");
  console.log({
    cloudName,
    apiKey,
    apiSecretLength: apiSecret.length,
    signatureString,
    generatedSignature: signature,
  });

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
  });
}