export function optimizeCloudinary(url: string) {
  if (!url.includes("res.cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_400,c_limit/"
  );
}

export function forceCloudinaryDownload(url: string) {
  if (!url.includes("res.cloudinary.com")) return url;

  return url.replace("/upload/", "/upload/fl_attachment/");
}