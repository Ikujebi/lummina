export interface ClientDocument {
  id: string;

  name: string;

  fileUrl: string;

  status: string;

  uploadedBy: string;

  folderPath?: string | null;

  previewUrl?: string | null;

  externalId?: string | null;

  createdAt: string;

  matter?: {
    id: string;
    title?: string;
    caseNumber?: string;
  } | null;

  uploader?: {
    id: string;
    name: string;
  } | null;
}