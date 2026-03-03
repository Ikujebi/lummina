export type TimelineItem = {
  date: string;
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
};