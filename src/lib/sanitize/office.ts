import JSZip from "jszip";
import type { DetectedMetadataField } from "@/lib/metadata/types";

const CORE_PROPS_PATH = "docProps/core.xml";
const APP_PROPS_PATH = "docProps/app.xml";

const officeLike = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".docx") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".pptx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
};

export async function detectOfficeMetadata(file: File): Promise<DetectedMetadataField[]> {
  if (!officeLike(file)) return [];

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const fields: DetectedMetadataField[] = [];

  const coreFile = zip.file(CORE_PROPS_PATH);
  if (coreFile) {
    const coreXml = await coreFile.async("text");
    const doc = new DOMParser().parseFromString(coreXml, "application/xml");

    const creator = doc.getElementsByTagName("dc:creator")[0]?.textContent;
    if (creator) {
      fields.push({
        id: "office_creator",
        category: "identity",
        label: "Author",
        value: creator,
        sensitivity: "medium",
      });
    }

    const lastModifiedBy = doc.getElementsByTagName("cp:lastModifiedBy")[0]?.textContent;
    if (lastModifiedBy) {
      fields.push({
        id: "office_lastModifiedBy",
        category: "identity",
        label: "Last Modified By",
        value: lastModifiedBy,
        sensitivity: "medium",
      });
    }

    const created = doc.getElementsByTagName("dcterms:created")[0]?.textContent;
    if (created) {
      fields.push({
        id: "office_created",
        category: "document",
        label: "Created",
        value: created,
        sensitivity: "low",
      });
    }

    const modified = doc.getElementsByTagName("dcterms:modified")[0]?.textContent;
    if (modified) {
      fields.push({
        id: "office_modified",
        category: "document",
        label: "Modified",
        value: modified,
        sensitivity: "low",
      });
    }
  }

  const appFile = zip.file(APP_PROPS_PATH);
  if (appFile) {
    const appXml = await appFile.async("text");
    const doc = new DOMParser().parseFromString(appXml, "application/xml");

    const company = doc.getElementsByTagName("Company")[0]?.textContent;
    if (company) {
      fields.push({
        id: "office_company",
        category: "identity",
        label: "Company",
        value: company,
        sensitivity: "medium",
      });
    }
  }

  return fields;
}

export async function sanitizeOffice(file: File): Promise<Blob> {
  if (!officeLike(file)) {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const coreFile = zip.file(CORE_PROPS_PATH);
  if (coreFile) {
    const coreXml = await coreFile.async("text");
    const doc = new DOMParser().parseFromString(coreXml, "application/xml");

    const clearTags = ["dc:creator", "cp:lastModifiedBy", "dcterms:created", "dcterms:modified"];
    clearTags.forEach((tag) => {
      const el = doc.getElementsByTagName(tag)[0];
      if (el) {
        el.textContent = "";
      }
    });

    const serializer = new XMLSerializer();
    const updated = serializer.serializeToString(doc);
    zip.file(CORE_PROPS_PATH, updated);
  }

  // We leave app.xml mostly intact; company name can leak identity but is lower risk.
  // It could also be cleared similarly if desired.

  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

