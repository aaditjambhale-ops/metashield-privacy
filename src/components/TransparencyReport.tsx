import { useState, useCallback } from "react";
import { Upload, X, FileText, MapPin, Smartphone, User, Trash2, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DetectedMetadataField, RiskLevel } from "@/lib/metadata/types";
import { analyzeFile } from "@/lib/sanitize/sanitizeFile";
import { sanitizeFile } from "@/lib/sanitize/sanitizeFile";
import { downloadBlob } from "@/lib/download";
import { toast } from "@/components/ui/sonner";

type MetadataIcon = typeof MapPin;

interface MetadataField {
  id: string;
  icon: MetadataIcon;
  label: string;
  value: string;
  removed: boolean;
}

type FileStatus = "detecting" | "ready" | "sanitizing" | "clean_ready" | "unsupported" | "error";

interface FileReport {
  id: string;
  originalFile: File;
  name: string;
  size: string;
  riskPercent: number;
  riskLevel: RiskLevel;
  metadata: MetadataField[];
  status: FileStatus;
  cleanBlob?: Blob;
  cleanFileName?: string;
}

const riskColors: Record<string, string> = {
  Low: "bg-success/15 text-success border-success/20",
  Medium: "bg-warning/15 text-warning border-warning/20",
  High: "bg-destructive/15 text-destructive border-destructive/20",
};

const TransparencyReport = () => {
  const [files, setFiles] = useState<FileReport[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const incomingFiles = Array.from(fileList);

    // Optimistically add placeholder entries while we asynchronously analyze
    const placeholders: FileReport[] = incomingFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      originalFile: file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      riskPercent: 0,
      riskLevel: "Low",
      metadata: [],
      status: "detecting",
    }));

    setFiles((prev) => [...prev, ...placeholders]);

    placeholders.forEach((placeholder) => {
      analyzeFile(placeholder.originalFile)
        .then((analysis) => {
          const iconForField = (field: DetectedMetadataField): MetadataIcon => {
            if (field.category === "location") return MapPin;
            if (field.category === "device") return Smartphone;
            if (field.category === "identity") return User;
            return FileText;
          };

          const mappedMetadata: MetadataField[] = analysis.metadata.map((m) => ({
            id: m.id,
            icon: iconForField(m),
            label: m.label,
            value: m.value,
            removed: false,
          }));

          setFiles((prev) =>
            prev.map((f) =>
              f.id === placeholder.id
                ? {
                    ...f,
                    metadata: mappedMetadata,
                    riskPercent: analysis.riskPercent,
                    riskLevel: analysis.riskLevel,
                    status: "ready",
                  }
                : f,
            ),
          );
        })
        .catch((error) => {
          console.error("Failed to analyze file metadata", error);
          toast.error(`Failed to analyze metadata for ${placeholder.name}`);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === placeholder.id
                ? {
                    ...f,
                    status: "error",
                  }
                : f,
            ),
          );
        });
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const toggleRemove = (fileIdx: number, metaId: string) => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === fileIdx
          ? {
              ...f,
              metadata: f.metadata.map((m) =>
                m.id === metaId ? { ...m, removed: !m.removed } : m
              ),
            }
          : f
      )
    );
  };

  const sanitizeAll = () => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "ready" || f.status === "clean_ready"
          ? { ...f, status: "sanitizing" }
          : f,
      ),
    );

    files.forEach((file, idx) => {
      if (file.status !== "ready" && file.status !== "clean_ready") return;

      sanitizeFile(file.originalFile)
        .then((result) => {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === idx
                ? {
                    ...f,
                    cleanBlob: result.cleanBlob,
                    cleanFileName: result.cleanFileName,
                    metadata: f.metadata.map((m) => ({ ...m, removed: true })),
                    riskPercent: 0,
                    riskLevel: "Low",
                    status: "clean_ready",
                  }
                : f,
            ),
          );
        })
        .catch((error) => {
          console.error("Failed to sanitize file", error);
          toast.error(`Failed to sanitize ${file.name}`);
          setFiles((prev) =>
            prev.map((f, i) =>
              i === idx
                ? {
                    ...f,
                    status: "error",
                  }
                : f,
            ),
          );
        });
    });
  };

  const handleDownloadClean = (idx: number) => {
    const file = files[idx];
    if (!file) return;

    if (file.status === "detecting" || file.status === "sanitizing") {
      toast.info("Please wait until analysis completes.");
      return;
    }

    if (file.cleanBlob && file.cleanFileName) {
      downloadBlob(file.cleanBlob, file.cleanFileName);
      toast.success("Downloading clean file");
      return;
    }

    setFiles((prev) =>
      prev.map((f, i) =>
        i === idx
          ? {
              ...f,
              status: "sanitizing",
            }
          : f,
      ),
    );

    sanitizeFile(file.originalFile)
      .then((result) => {
        downloadBlob(result.cleanBlob, result.cleanFileName);
        toast.success("Clean file generated and downloaded");
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx
              ? {
                  ...f,
                  cleanBlob: result.cleanBlob,
                  cleanFileName: result.cleanFileName,
                  metadata: f.metadata.map((m) => ({ ...m, removed: true })),
                  riskPercent: 0,
                  riskLevel: "Low",
                  status: "clean_ready",
                }
              : f,
          ),
        );
      })
      .catch((error) => {
        console.error("Failed to sanitize file", error);
        toast.error(`Failed to generate clean version for ${file.name}`);
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx
              ? {
                  ...f,
                  status: "error",
                }
              : f,
          ),
        );
      });
  };

  return (
    <section id="privacy" className="py-20 px-6">
      <div className="container mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Transparency Report
            </h2>
            <p className="text-muted-foreground">
              Detailed breakdown of privacy risks found in your files.
            </p>
          </div>
          {files.length > 0 && (
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => setFiles([])}>
                Clear Session
              </Button>
              <Button variant="gradient" onClick={sanitizeAll}>
                Sanitize All
              </Button>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`glass-card border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
            dragging ? "border-primary bg-primary/5" : "border-border/50"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,.pdf,.docx,.xlsx,.pptx"
            className="hidden"
            onChange={handleInputChange}
            aria-label="Upload files for metadata analysis and cleaning"
          />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg font-semibold text-foreground">
            Drag & drop files here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse — images, documents, PDFs
          </p>
        </div>

        {/* File Reports */}
        <div className="space-y-6">
          {files.map((file, idx) => (
            <div key={idx} className="glass-card p-6 md:p-8 space-y-6 hover-lift">
              {/* File header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${riskColors[file.riskLevel]}`}
                >
                  {file.riskLevel === "High" ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {file.riskPercent}% Risk — {file.riskLevel}
                </span>
              </div>

              {/* Metadata list */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Detected Metadata
                </p>
                {file.metadata.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No metadata detected or file type not supported for deep inspection.
                  </p>
                )}
                {file.metadata.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between rounded-xl p-4 transition-all duration-200 ${
                      m.removed
                        ? "bg-success/5 border border-success/20"
                        : "bg-secondary/50 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <m.icon className={`h-4 w-4 ${m.removed ? "text-success" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-sm font-medium ${m.removed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {m.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.value}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRemove(idx, m.id)}
                      className={m.removed ? "text-success" : "text-destructive"}
                    >
                      {m.removed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Download */}
              <Button
                variant="gradient"
                className="w-full sm:w-auto"
                onClick={() => handleDownloadClean(idx)}
                disabled={file.status === "detecting" || file.status === "sanitizing"}
              >
                <Download className="h-4 w-4 mr-2" />
                {file.status === "sanitizing" ? "Sanitizing..." : "Download Clean Version"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencyReport;
