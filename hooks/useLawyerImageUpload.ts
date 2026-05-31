"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";
import type { User } from "@/types/user";

type UploadMessage = {
  text: string;
  type: "success" | "error" | "";
};

export function useLawyerImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [message, setMessage] = useState<UploadMessage>({
    text: "",
    type: "",
  });

  async function uploadImage(
    file: File,
    user: User,
    setUser: Dispatch<SetStateAction<User>>
  ) {
    const localPreview = URL.createObjectURL(file);
    const previousImage = user.profilePicture;

    setPreview(localPreview);
    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: "", type: "" });

    try {
      const signRes = await fetch("/api/cloudinary/sign");
      const signData = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", "profile_pictures");

      const cloudData = await uploadToCloudinary(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        formData,
        (percent) => setUploadProgress(percent)
      );

      if (!cloudData?.secure_url) {
        throw new Error("Upload failed");
      }

      const saveRes = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          profilePicture: cloudData.secure_url,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save profile");
      }

      // ✅ UPDATE GLOBAL STATE (NO NULL ISSUES)
      setUser(saveData.user);

      setPreview(cloudData.secure_url);

      setMessage({
        type: "success",
        text: "Profile picture updated successfully",
      });

      URL.revokeObjectURL(localPreview);
    } catch (err) {
      console.error(err);

      setPreview(previousImage || "");

      setMessage({
        type: "error",
        text: "Failed to upload image",
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