import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    // MOCK upload logic (replace with S3/Cloudinary later)
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());

        // fake URL (replace with real upload provider)
        const fakeUrl = `https://storage.yourapp.com/${Date.now()}-${file.name}`;

        return fakeUrl;
      })
    );

    return NextResponse.json({
      message: "Files uploaded",
      files: uploadedUrls,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}