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

   

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // =========================
    // 1. Determine file type
    // =========================
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isRaw = !isImage && !isVideo;

    const resourceType: "image" | "video" | "raw" = isImage
      ? "image"
      : isVideo
      ? "video"
      : "raw";

    // =========================
    // 2. Safe filename handling
    // =========================
    const fileExt = file.name.split(".").pop(); // docx, xlsx, pdf, etc

    const baseName = file.name
      .split(".")[0]
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const publicId = `${Date.now()}-${baseName}`;

    // =========================
    // 3. Upload to Cloudinary
    // =========================
    const result: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_uploads",

            // 🔥 CRITICAL FIX
            resource_type: resourceType,

            // safe + unique ID
            public_id: publicId,

            // 🔥 CRITICAL FIX for DOCX/XLSX/ZIP/etc
            format: isRaw ? fileExt : undefined,

            // optional: force download behavior for raw files
            flags: isRaw ? "attachment" : undefined,
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("No upload result"));
            resolve(result);
          }
        );

        uploadStream.end(buffer);
      }
    );

    // =========================
    // 4. Response
    // =========================
    return NextResponse.json({
      fileUrl: result.secure_url,
      fileType: file.type,
      fileName: file.name,
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