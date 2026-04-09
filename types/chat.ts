export interface Attachment {
  fileUrl: string;
}

export interface Sender {
  id: string;
  name?: string;
  email?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt?: string;
  sender?: Sender;
  attachments?: Attachment[];
}