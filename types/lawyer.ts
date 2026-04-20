export type MatterStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING"
  | "CLOSED";

export interface LawyerMatter {
  id: string;
  caseNumber: string;
  title: string;
  status: MatterStatus;
  client: {
    name: string;
  };
  updatedAt: string;
}

export interface LawyerStats {
  activeMatters: number;
  completedMatters: number;
  totalMatters: number;
}