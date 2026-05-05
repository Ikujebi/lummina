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

export type ActivityType =
  | "FILING"
  | "COURT"
  | "CLIENT"
  | "INTERNAL";

export type Visibility = "CLIENT" | "INTERNAL";

export interface LawyerStats {
  activeMatters: number;
  completedMatters: number;
  totalMatters: number;
}

export type MatterActivity = {
  id: string;
  action: string;
  details?: string;
  type: ActivityType;
  visibility: Visibility;
  createdAt: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
};

export interface LawyerMatterDetail {
  id: string;
  caseNumber: string;
  description: string;
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