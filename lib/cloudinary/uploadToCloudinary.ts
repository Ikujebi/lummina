import type { CloudinaryUploadResponse } from "@/types/CloudinaryUploadResponse";

/**
 * Upload file to Cloudinary with progress tracking
 */
export function uploadToCloudinary(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);

    // Progress tracking
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    // Success / error handling
    xhr.onload = () => {
      try {
        const response: CloudinaryUploadResponse = JSON.parse(
          xhr.responseText
        );

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(response);
        }
      } catch {
        reject(new Error("Invalid response from Cloudinary"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.send(formData);
  });
}