import type { DetectedMetadataField, FileMetadataAnalysis, RiskLevel } from "@/lib/metadata/types";
import { detectImageMetadata } from "@/lib/sanitize/image";
import { detectPdfMetadata } from "@/lib/sanitize/pdf";
import { detectOfficeMetadata } from "@/lib/sanitize/office";

const getExtension = (file: File): string => {
  const parts = file.name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
};

const computeRisk = (metadata: DetectedMetadataField[]): { riskPercent: number; riskLevel: RiskLevel } => {
  let score = 0;

  for (const field of metadata) {
    if (field.category === "location") {
      score += field.sensitivity === "high" ? 60 : 40;
    } else if (field.category === "identity") {
      score += field.sensitivity === "high" ? 40 : 30;
    } else if (field.category === "device" || field.category === "document") {
      score += 15;
    } else {
      score += 5;
    }
  }

  if (score > 100) score = 100;

  let riskLevel: RiskLevel;
  if (score <= 30) riskLevel = "Low";
  else if (score <= 60) riskLevel = "Medium";
  else riskLevel = "High";

  return { riskPercent: score, riskLevel };
};

export async function analyzeFileMetadata(file: File): Promise<FileMetadataAnalysis> {
  const ext = getExtension(file);

  let metadata: DetectedMetadataField[] = [];

  if (file.type.startsWith("image/") || ["jpg", "jpeg", "png"].includes(ext)) {
    metadata = await detectImageMetadata(file);
  } else if (file.type === "application/pdf" || ext === "pdf") {
    metadata = await detectPdfMetadata(file);
  } else if (["docx", "xlsx", "pptx"].includes(ext)) {
    metadata = await detectOfficeMetadata(file);
  } else {
    metadata = [];
  }

  const { riskPercent, riskLevel } = computeRisk(metadata);

  return {
    metadata,
    riskPercent,
    riskLevel,
  };
}

