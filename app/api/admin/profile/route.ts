// app/api/admin/profile/route.ts

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";

/* ================= CLOUDINARY CONFIG ================= */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});


/* ================= RETRY SYSTEM ================= */
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

function isRetryableError(err: unknown) {
  if (!err) return false;

  const msg = String(err);

  return (
    msg.includes("ENOTFOUND") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    msg.includes("network")
  );
}

async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (!isRetryableError(err)) {
        throw err;
      }

      await wait(500 * (i + 1)); // exponential backoff
    }
  }

  throw lastError;
}

/* ================= GET PROFILE ================= */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        profilePicturePublicId: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (err) {
    console.error("GET /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/* ================= PATCH PROFILE ================= */
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const file = formData.get("file") as File | null;

    const admin = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    let uploadResult: UploadApiResponse | null = null;

    /* ================= UPLOAD WITH RETRY ================= */
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      uploadResult = await retry(
        () =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "profile_pictures" },
              (
                err: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined
              ) => {
                if (err || !result) {
                  return reject(err ?? new Error("Upload failed"));
                }
                resolve(result);
              }
            );

            stream.end(buffer);
          })
      );

      /* ================= DELETE OLD IMAGE ================= */
      if (admin.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(
            admin.profilePicturePublicId
          );
        } catch (err) {
          console.warn("Failed to delete old image:", err);
        }
      }
    }

    /* ================= UPDATE USER ================= */
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        profilePicture:
          uploadResult?.secure_url || admin.profilePicture,
        profilePicturePublicId:
          uploadResult?.public_id || admin.profilePicturePublicId,
      },
    });

    await logAudit(
      currentUser.id,
      "UPDATE",
      "AdminProfile",
      currentUser.id
    );

    return NextResponse.json({
      success: true,
      admin: updated,
    });
  } catch (err) {
    console.error("PATCH /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

/* ================= PUT PASSWORD ================= */
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    const admin = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    const isValid = await comparePassword(
      currentPassword,
      admin.password
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    await logAudit(
      currentUser.id,
      "UPDATE_PASSWORD",
      "AdminProfile",
      currentUser.id
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    );
  }
}