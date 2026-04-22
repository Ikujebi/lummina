import { Client, TimelineItem } from "../../../types/types";

export const client: Client = {
  name: "Ikujebi Ayanfe",
  caseId: "LUM-98214",
  lawyer: "OJOAJOGWU ZEKERI",
  status: "In Review",
};

export const timelineData: TimelineItem[] = [
  {
    date: "Sep 12, 2025",
    title: "Additional document uploaded",
    content: "Laura uploaded the estate inventory receipt.",
  },
  {
    date: "Sep 09, 2025",
    title: "Lawyer comment",
    content: "Alejandro requested an updated list of heirs.",
  },
  {
    date: "Sep 05, 2025",
    title: "Documentation validated",
    content: "The legal team confirmed receipt of the digitized will.",
  },
  {
    date: "Aug 30, 2025",
    title: "Process initiated",
    content: "Case file #LXT-98214 was registered with all participants.",
  },
];