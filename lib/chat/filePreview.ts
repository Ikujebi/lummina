export function getFilePreview(file: File | null) {
  if (!file) return null;

  return {
    url: URL.createObjectURL(file),
    type: file.type || "",
  };
}