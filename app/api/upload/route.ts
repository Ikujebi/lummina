import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Debug (optional but helpful)
    console.log("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // ✅ handles images, videos, PDFs, docs
          folder: "chat_uploads",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No upload result"));
          resolve(result);
        }
      );

      uploadStream.on("error", reject);

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      fileUrl: result.secure_url,

      // ✅ IMPORTANT FIX: use real MIME type from browser
      fileType: file.type,

      fileName: file.name,

      // optional but useful for debugging/UI
      resourceType: result.resource_type,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}