export function optimizeCloudinary(url: string) {
  if (!url.includes("res.cloudinary.com")) return url;

  // Only optimize images (NOT PDFs, videos, docs)
  if (!url.match(/\.(jpg|jpeg|png|webp|gif)$/)) return url;

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_400,c_limit/"
  );
}

export function forceCloudinaryDownload(url: string) {
  if (!url.includes("res.cloudinary.com")) return url;

  // 🚨 DO NOT modify PDFs or any files
  return url;
}