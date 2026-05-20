export type ActivityMetadata = {
  visitorId?: string;
  sessionId?: string;
  screen?: string;
  language?: string;
  timezone?: string;
  title?: string;
  source?: string;
};

export type ActivityItem = {
  id: string;
  event: string;
  path?: string;
  createdAt: string;
};

export type DashboardStats ={
  pageViews: number;
  uniqueVisitors: number;
  newsletterOpens: number;
  subscribers: number;
  downloads: number;
};