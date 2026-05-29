export type InsightApiResponse = {
  id: string;
  title: string;
  summary: string;
  publishedAt?: string | null;
  createdAt: string;
  published: boolean;
  views?: number;
  sent?: boolean;
  coverImage?: string | null;
}

export type Insight = {
  id: string;
  title: string;
  date: string;
  summary: string;
  status: "Published" | "Draft";
  views: number;
  sent?: boolean;
  coverImage?: string | null;
};