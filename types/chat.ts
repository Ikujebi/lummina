export interface Attachment {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
}

export interface Sender {
  id: string;
  name?: string;
  email?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt?: string | Date | undefined;
   senderId: string;
  sender?: Sender;
  senderRole: string;
  attachments?: Attachment[];
}