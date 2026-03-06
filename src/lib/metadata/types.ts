export type MetadataCategory = "location" | "device" | "identity" | "document" | "other";

export type SensitivityLevel = "low" | "medium" | "high";

export type RiskLevel = "Low" | "Medium" | "High";

export interface DetectedMetadataField {
  id: string;
  category: MetadataCategory;
  label: string;
  value: string;
  sensitivity: SensitivityLevel;
}

export interface FileMetadataAnalysis {
  metadata: DetectedMetadataField[];
  riskPercent: number;
  riskLevel: RiskLevel;
}

export interface SanitizeResult {
  cleanBlob: Blob;
  cleanFileName: string;
  /**
   * Subset of metadata that we attempted to remove from the clean file.
   */
  removedSummary: DetectedMetadataField[];
}

