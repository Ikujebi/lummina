export interface ClientDocument {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  size?: number;
  matter?: {
    id: string;
    title?: string;
    caseNumber?: string;
  } | null;

  uploadedBy?: {
    id: string;
    name: string;
  } | null;
}