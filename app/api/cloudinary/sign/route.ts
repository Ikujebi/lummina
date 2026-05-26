import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const folder = "profile_pictures";

  // MUST be consistent with request params
  const signatureString = `folder=${folder}&timestamp=${timestamp}`;

  // ✅ CORRECT Cloudinary signing method
  const signature = crypto
    .createHmac("sha1", apiSecret)
    .update(signatureString)
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName: cloudName.replace(/"/g, "").trim(),
  });
}