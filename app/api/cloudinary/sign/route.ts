import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const folder = "profile_pictures";

  // IMPORTANT: MUST be alphabetical string
  const signatureString = `folder=${folder}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha1")
    .update(signatureString + apiSecret)
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
  });
}