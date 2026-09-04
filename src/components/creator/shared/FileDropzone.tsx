"use client";

import { useRef, useState, useCallback } from "react";

interface FileDropzoneProps {
  accept: string;
  maxSizeMB: number;
  preview?: boolean;
  label?: string;
  helpText?: string;
  onChange: (file: File | null) => void;
  error?: string;
  className?: string;
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileDropzone({
  accept,
  maxSizeMB,
  preview = true,
  label,
  helpText,
  onChange,
  error,
  className = "",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const isVideo = accept.includes("video");

  const processFile = useCallback((f: File) => {
    setSizeError(null);
    if (f.size > maxSizeMB * 1024 * 1024) {
      const actual = (f.size / 1024 / 1024).toFixed(0);
      setSizeError(`This file is ${actual} MB — max is ${maxSizeMB} MB`);
      return;
    }
    setFile(f);
    onChange(f);
    if (preview && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [maxSizeMB, onChange, preview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  }, [processFile]);

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setSizeError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl, onChange]);

  const displayError = sizeError ?? error;

  return (
    <div className={`dropzone-wrapper${className ? ` ${className}` : ""}`}>
      {label && <label className="form-label">{label}</label>}

      {!file ? (
        <div
          className={`dropzone${isDragging ? " dropzone--drag-over" : ""}${displayError ? " dropzone--error" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label={`Upload file. ${helpText ?? ""}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        >
          <span className="dropzone-icon">{isVideo ? <VideoIcon /> : <UploadIcon />}</span>
          <p className="dropzone-primary">
            <span className="dropzone-browse">Tap to browse</span>
            <span className="dropzone-drag"> or drag &amp; drop</span>
          </p>
          {helpText && <p className="dropzone-help">{helpText}</p>}
          <p className="dropzone-limit">Max {maxSizeMB} MB</p>
        </div>
      ) : (
        <div className="dropzone-preview">
          {previewUrl ? (
            <div className="dropzone-img-wrap">
              <img src={previewUrl} alt="Upload preview" className="dropzone-img-preview" />
            </div>
          ) : (
            <div className="dropzone-file-info">
              {isVideo ? <VideoIcon /> : <UploadIcon />}
              <div>
                <p className="dropzone-filename">{file.name}</p>
                <p className="dropzone-filesize">{formatBytes(file.size)}</p>
              </div>
            </div>
          )}
          <button type="button" className="dropzone-clear-btn" onClick={handleClear} aria-label="Remove file">
            Remove
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="dropzone-input-hidden"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {displayError && (
        <p className="form-field-error" role="alert">{displayError}</p>
      )}
    </div>
  );
}
