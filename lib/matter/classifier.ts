export type MatterType = "CASE" | "COMPLIANCE";

export function classifyMatter(matter: {
  title: string;
  description?: string | null;
}): MatterType {
  const text = `${matter.title} ${matter.description ?? ""}`.toLowerCase();

  const complianceKeywords = [
    "compliance",
    "audit",
    "aml",
    "kyc",
    "regulatory",
    "filing",
    "tax",
    "gdpr",
    "contract",
    "policy",
  ];

  const isCompliance = complianceKeywords.some((keyword) =>
    text.includes(keyword)
  );

  return isCompliance ? "COMPLIANCE" : "CASE";
}