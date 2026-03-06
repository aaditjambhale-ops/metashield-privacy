import exifr from "exifr";
import type { DetectedMetadataField } from "@/lib/metadata/types";

const toFixed = (value: number | null | undefined, digits = 5): string | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toFixed(digits);
};

export async function detectImageMetadata(file: File): Promise<DetectedMetadataField[]> {
  // Only attempt EXIF parsing for JPEGs – PNGs and others often have no EXIF
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return [];
  }

  try {
    const exif: any = await exifr.parse(file, { gps: true });
    if (!exif) return [];

    const fields: DetectedMetadataField[] = [];

    const lat = toFixed(exif.latitude);
    const lng = toFixed(exif.longitude);
    if (lat && lng) {
      fields.push({
        id: "gps",
        category: "location",
        label: "Location (GPS)",
        value: `${lat}, ${lng}`,
        sensitivity: "high",
      });
    }

    const make = exif.Make || exif.make;
    const model = exif.Model || exif.model;
    if (make || model) {
      fields.push({
        id: "device",
        category: "device",
        label: "Camera / Device",
        value: [make, model].filter(Boolean).join(" "),
        sensitivity: "medium",
      });
    }

    const takenAt = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
    if (takenAt) {
      fields.push({
        id: "capturedAt",
        category: "document",
        label: "Captured At",
        value: String(takenAt),
        sensitivity: "medium",
      });
    }

    return fields;
  } catch (error) {
    // Fail closed: if EXIF parsing fails, we just return no metadata instead of breaking the UI
    console.error("Failed to parse EXIF metadata", error);
    return [];
  }
}

export async function sanitizeImage(file: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D context for canvas");
    }

    ctx.drawImage(img, 0, 0);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Failed to re-encode image"));
        },
        file.type || "image/jpeg",
        0.92,
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

