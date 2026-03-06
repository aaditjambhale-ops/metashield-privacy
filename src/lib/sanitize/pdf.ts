import { PDFDocument } from "pdf-lib";
import type { DetectedMetadataField } from "@/lib/metadata/types";

export async function detectPdfMetadata(file: File): Promise<DetectedMetadataField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const fields: DetectedMetadataField[] = [];

  const title = pdfDoc.getTitle();
  if (title) {
    fields.push({
      id: "pdf_title",
      category: "document",
      label: "Title",
      value: title,
      sensitivity: "low",
    });
  }

  const author = pdfDoc.getAuthor();
  if (author) {
    fields.push({
      id: "pdf_author",
      category: "identity",
      label: "Author",
      value: author,
      sensitivity: "medium",
    });
  }

  const subject = pdfDoc.getSubject();
  if (subject) {
    fields.push({
      id: "pdf_subject",
      category: "document",
      label: "Subject",
      value: subject,
      sensitivity: "low",
    });
  }

  const keywords = pdfDoc.getKeywords();
  if (keywords) {
    fields.push({
      id: "pdf_keywords",
      category: "document",
      label: "Keywords",
      value: keywords,
      sensitivity: "low",
    });
  }

  const creator = pdfDoc.getCreator();
  if (creator) {
    fields.push({
      id: "pdf_creator",
      category: "identity",
      label: "Creator",
      value: creator,
      sensitivity: "medium",
    });
  }

  const producer = pdfDoc.getProducer();
  if (producer) {
    fields.push({
      id: "pdf_producer",
      category: "document",
      label: "Producer",
      value: producer,
      sensitivity: "low",
    });
  }

  const created = pdfDoc.getCreationDate();
  if (created) {
    fields.push({
      id: "pdf_created",
      category: "document",
      label: "Created",
      value: created.toISOString(),
      sensitivity: "medium",
    });
  }

  const modified = pdfDoc.getModificationDate();
  if (modified) {
    fields.push({
      id: "pdf_modified",
      category: "document",
      label: "Modified",
      value: modified.toISOString(),
      sensitivity: "medium",
    });
  }

  return fields;
}

export async function sanitizePdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Best-effort: clear the standard document info fields
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator("");
  pdfDoc.setProducer("");
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));

  const cleanedBytes = await pdfDoc.save();
  return new Blob([cleanedBytes], { type: "application/pdf" });
}

