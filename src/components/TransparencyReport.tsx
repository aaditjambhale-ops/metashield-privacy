import { useState, useCallback } from "react";
import { Upload, X, FileText, MapPin, Smartphone, User, Trash2, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetadataField {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  removed: boolean;
}

interface FileReport {
  name: string;
  size: string;
  riskPercent: number;
  riskLevel: "Low" | "Medium" | "High";
  metadata: MetadataField[];
}

const classifyRisk = (percent: number): "Low" | "Medium" | "High" => {
  if (percent <= 30) return "Low";
  if (percent <= 60) return "Medium";
  return "High";
};

const riskColors: Record<string, string> = {
  Low: "bg-success/15 text-success border-success/20",
  Medium: "bg-warning/15 text-warning border-warning/20",
  High: "bg-destructive/15 text-destructive border-destructive/20",
};

const generateMockReport = (file: File): FileReport => {
  const riskPercent = Math.floor(Math.random() * 70) + 20;
  return {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + " KB",
    riskPercent,
    riskLevel: classifyRisk(riskPercent),
    metadata: [
      { id: "loc", icon: MapPin, label: "Location Found", value: "40.7128° N, 74.0060° W", removed: false },
      { id: "dev", icon: Smartphone, label: "Device Info", value: "iPhone 13 Pro, iOS 15.4", removed: false },
      { id: "pid", icon: User, label: "Personal Identifiers", value: "John Doe • 2023-08-15 14:22:01", removed: false },
    ],
  };
};

const TransparencyReport = () => {
  const [files, setFiles] = useState<FileReport[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const reports = Array.from(fileList).map(generateMockReport);
    setFiles((prev) => [...prev, ...reports]);
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
      prev.map((f) => ({
        ...f,
        metadata: f.metadata.map((m) => ({ ...m, removed: true })),
        riskPercent: 0,
        riskLevel: "Low",
      }))
    );
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
            className="hidden"
            onChange={handleInputChange}
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
              <Button variant="gradient" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download Clean Version
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencyReport;
