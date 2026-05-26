import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing Cloudinary environment variables" },
        { status: 500 }
      );
    }

    const folder = "profile_pictures";

    // ✅ MUST be alphabetical order
    const signatureString = `timestamp=${timestamp}&folder=${folder}`;

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
  } catch (error) {
    console.error("Cloudinary sign error:", error);

    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}