import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const folder = "profile_pictures";

  const params = {
    folder,
    timestamp,
  };

  // canonical string (safer than manual concatenation)
  const signatureString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&");

  // IMPORTANT: hash ONLY secret, not concatenation
  const signature = crypto
    .createHmac("sha1", apiSecret)
    .update(signatureString)
    .digest("hex");

  console.log("=== CLOUDINARY SIGN DEBUG ===");
  console.log({
    cloudName,
    apiKey,
    apiSecretLength: apiSecret?.length,
    apiSecretPreview: apiSecret?.slice(0, 4) + "****",
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