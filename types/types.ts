export type TimelineItem = {
   id: string;
  time: string;
  title: string;
  content: string;
};

export type ProductivityPoint = {
  label: string;
  value: number;
};

export type Client = {
  name: string;
  caseId: string;
  lawyer: string;
  status: string;
 matters?: {
  id: string;
  caseNumber: string;
  status: "OPEN" | "IN_PROGRESS" | "PENDING" | "CLOSED";
  createdAt: string;
  title?: string;
  lawyer?: {
    name: string;
  };
}[];
};

interface DoughnutData {
  labels: string[];
  values: number[];
}

interface LinePoint {
  label: string;
  value: number;
}

export interface ChartsSectionProps {
  doughnutData: DoughnutData;
  lineData: LinePoint[];
  progress: number;
  loading?: boolean;
}