import type { FileMetadataAnalysis, SanitizeResult } from "@/lib/metadata/types";
import { analyzeFileMetadata } from "@/lib/metadata/detect";
import { sanitizeImage } from "@/lib/sanitize/image";
import { sanitizePdf } from "@/lib/sanitize/pdf";
import { sanitizeOffice } from "@/lib/sanitize/office";

const getExtension = (file: File): string => {
  const parts = file.name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
};

export async function analyzeFile(file: File): Promise<FileMetadataAnalysis> {
  return analyzeFileMetadata(file);
}

export async function sanitizeFile(file: File): Promise<SanitizeResult> {
  const analysis = await analyzeFileMetadata(file);

  const ext = getExtension(file);
  let cleanBlob: Blob;

  if (file.type.startsWith("image/") || ["jpg", "jpeg", "png"].includes(ext)) {
    cleanBlob = await sanitizeImage(file);
  } else if (file.type === "application/pdf" || ext === "pdf") {
    cleanBlob = await sanitizePdf(file);
  } else if (["docx", "xlsx", "pptx"].includes(ext)) {
    cleanBlob = await sanitizeOffice(file);
  } else {
    // Unsupported type – return original file but mark that we did not remove anything.
    cleanBlob = file;
  }

  const cleanFileName = file.name.replace(/\.(\w+)$/, ".clean.$1");

  const result: SanitizeResult = {
    cleanBlob,
    cleanFileName,
    removedSummary: analysis.metadata,
  };

  return result;
}

