"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";
import type { AdminProfile } from "@/types/adminProfile";
import { profileUpdatedEvent } from "@/lib/events/profileUpdated";

type UploadMessage = {
  text: string;
  type: "success" | "error" | "";
};

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [message, setMessage] = useState<UploadMessage>({
    text: "",
    type: "",
  });

  async function uploadImage(
    file: File,
    profile: AdminProfile,
    setProfile: Dispatch<SetStateAction<AdminProfile>>,
  ) {
    const localPreview = URL.createObjectURL(file);
    const previousImage = profile.profilePicture;

    // reset UI state
    setPreview(localPreview);
    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: "", type: "" });

    try {
      /* =========================
         1. GET SIGNATURE
      ========================= */
      const signRes = await fetch("/api/cloudinary/sign");
      const signData = await signRes.json();

      if (!signRes.ok) {
        throw new Error(signData?.error || "Failed to get upload signature");
      }

      /* =========================
         2. FORM DATA
      ========================= */
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", "profile_pictures");

      /* =========================
         3. CLOUDINARY UPLOAD
      ========================= */
      const cloudData = await uploadToCloudinary(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        formData,
        (percent: number) => {
          setUploadProgress(percent);
        },
      );

      if (!cloudData?.secure_url) {
        throw new Error("Upload failed");
      }

      /* =========================
         4. SAVE TO DATABASE
      ========================= */
      const saveRes = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          profilePicture: cloudData.secure_url,
          profilePicturePublicId: cloudData.public_id,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        throw new Error(saveData.error || "Failed to save profile");
      }

      /* =========================
         5. SUCCESS
      ========================= */
      setProfile(saveData.admin);
      setPreview(cloudData.secure_url);

      setMessage({
        type: "success",
        text: "Profile picture updated successfully",
      });

      window.dispatchEvent(profileUpdatedEvent);

      URL.revokeObjectURL(localPreview);
    } catch (err) {
      console.error(err);

      setPreview(previousImage || "");

      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
      });

      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return {
    uploadImage,
    uploading,
    preview,
    setPreview,
    uploadProgress,
    message,
  };
}
