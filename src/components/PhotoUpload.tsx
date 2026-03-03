"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

interface PhotoUploadProps {
  sessionId: number;
  onUploadComplete: () => void;
}

interface UploadProgress {
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

export default function PhotoUpload({ sessionId, onUploadComplete }: PhotoUploadProps) {
  const { user, profile } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    const validFiles = files
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .filter((f) => f.size <= MAX_FILE_SIZE)
      .slice(0, MAX_FILES);

    if (validFiles.length === 0) return;

    const supabase = createSupabaseBrowser();
    const progress: UploadProgress[] = validFiles.map((f) => ({
      name: f.name,
      status: "uploading" as const,
    }));
    setUploads(progress);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uuid = crypto.randomUUID();
      const filePath = `${sessionId}/${uuid}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("session-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from("session_photos")
          .insert({
            session_id: sessionId,
            uploaded_by: user!.id,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
          });

        if (insertError) throw insertError;

        setUploads((prev) =>
          prev.map((p, j) => (j === i ? { ...p, status: "done" } : p))
        );
      } catch (err) {
        setUploads((prev) =>
          prev.map((p, j) =>
            j === i
              ? { ...p, status: "error", error: err instanceof Error ? err.message : "Upload failed" }
              : p
          )
        );
      }
    }

    onUploadComplete();
    setTimeout(() => setUploads([]), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user, onUploadComplete]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFiles]
  );

  if (!profile || (profile.role !== "Admin" && profile.role !== "Attendee")) {
    return null;
  }

  return (
    <div className="mb-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <svg className="w-8 h-8 mx-auto mb-2 text-txt-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-txt-tertiary">Drop photos here or click to upload</p>
        <p className="text-[11px] text-txt-tertiary mt-1">JPEG, PNG, or WebP — max 10MB each, up to 10 files</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mt-3 space-y-1">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              {u.status === "uploading" && (
                <svg className="w-3 h-3 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {u.status === "done" && <span className="text-green-400">✓</span>}
              {u.status === "error" && <span className="text-red-400">✕</span>}
              <span className={u.status === "error" ? "text-red-400" : "text-txt-tertiary"}>
                {u.name}
                {u.error && ` — ${u.error}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
