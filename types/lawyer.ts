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
    progress: number;

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

export interface MatterActivity {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
}

export interface LawyerMatterDetail {
  id: string;
  caseNumber: string;
  title: string;
  status: MatterStatus;
  client: {
    name: string;
  };
  activities: MatterActivity[];
}


export interface ActivityWithMatter extends MatterActivity {
  matter?: {
    id: string;
    caseNumber?: string;
  } | null;
}