"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { CharCounter } from "@/components/creator/shared/CharCounter";
import FileDropzone from "@/components/creator/shared/FileDropzone";
import StickySubmitBar from "@/components/creator/shared/StickySubmitBar";
import UnderReviewModal from "@/components/creator/shared/UnderReviewModal";
import { VIDEO } from "@/lib/api/endpoints";
import type { ContentCard } from "@/types/creator";

const MAX_VIDEO_MB = 200;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().max(200, "Max 200 characters"),
  description: z.string().max(500, "Max 500 characters"),
  video: z.instanceof(File, { message: "Video is required" }).nullable().refine((f) => f !== null, "Video is required"),
  thumbnail: z.instanceof(File).nullable().optional(),
});

type FormData = z.infer<typeof schema>;

function formatTime(seconds: number): string {
  if (seconds < 60) return `~${Math.ceil(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `~${m}m ${s}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function SpinnerIcon() {
  return (
    <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function WifiWarning() {
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { type?: string } }).connection;
    if (conn?.type && conn.type !== "wifi" && conn.type !== "ethernet") {
      setShowWarning(true);
    }
  }, []);
  if (!showWarning) return null;
  return (
    <div className="video-wifi-warning" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      Uploading on mobile data may be slow and costly. Consider switching to Wi-Fi.
    </div>
  );
}

export default function VideoUploadForm() {
  const { closeForm, prependItem, showToast } = useDashboard();
  const { accessToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoSizeError, setVideoSizeError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const cancelRef = useRef<AbortController | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", caption: "", description: "", video: null, thumbnail: null },
    mode: "onChange",
  });

  const captionLen = watch("caption").length;
  const descLen = watch("description").length;

  useEffect(() => {
    if (!isUploading) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Upload in progress. Leaving will cancel it.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const handleVideoSelect = useCallback((f: File | null) => {
    setVideoSizeError(null);
    if (!f) {
      setSelectedVideo(null);
      setValue("video", null);
      return;
    }
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      const actual = (f.size / 1024 / 1024).toFixed(0);
      setVideoSizeError(`This file is ${actual} MB — max is ${MAX_VIDEO_MB} MB`);
      setSelectedVideo(null);
      setValue("video", null);
      return;
    }
    setSelectedVideo(f);
    setValue("video", f, { shouldValidate: true });
  }, [setValue]);

  const estimatedTime = selectedVideo
    ? formatTime(selectedVideo.size / (1024 * 1024 * 2))
    : null;

  const onSubmit = async (data: FormData) => {
    if (!data.video || !accessToken) return;
    setIsUploading(true);
    setUploadProgress(0);

    const body = new FormData();
    body.append("title", data.title);
    body.append("caption", data.caption);
    body.append("description", data.description);
    body.append("video", data.video);
    if (data.thumbnail) body.append("thumbnail", data.thumbnail);

    const controller = new AbortController();
    cancelRef.current = controller;

    try {
      const res = await axios.post(VIDEO.CREATE, body, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          setUploadProgress(pct);
        },
      });

      const raw = res.data?.data;
      const newItem: ContentCard = {
        id: raw?._id ?? Math.random().toString(36).slice(2),
        type: "video",
        title: data.title,
        status: raw?.status ?? "pending",
        createdAt: raw?.createdAt ?? new Date().toISOString(),
      };
      prependItem(newItem);
      setShowReviewModal(true);
    } catch (err: unknown) {
      if (axios.isCancel(err) || (err instanceof Error && err.message === "canceled")) {
        showToast("Upload cancelled.", "error");
      } else {
        showToast("Upload failed. Please try again.", "error");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      cancelRef.current = null;
    }
  };

  return (
    <>
      {showReviewModal && <UnderReviewModal type="video" onClose={closeForm} />}
      <form className={`creator-form${isUploading ? " creator-form--uploading" : ""}`} onSubmit={handleSubmit(onSubmit)} noValidate>
        <WifiWarning />

        <div className="form-field">
          <label htmlFor="vid-title" className="form-label">Title</label>
          <input
            id="vid-title"
            type="text"
            className={`form-input${errors.title ? " form-input--error" : ""}`}
            placeholder="What's this video about?"
            disabled={isUploading}
            {...register("title")}
          />
          {errors.title && <p className="form-field-error" role="alert">{errors.title.message}</p>}
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="vid-caption" className="form-label">Caption</label>
            <CharCounter current={captionLen} max={200} />
          </div>
          <input
            id="vid-caption"
            type="text"
            className="form-input"
            placeholder="Short caption for social sharing…"
            maxLength={200}
            disabled={isUploading}
            {...register("caption")}
          />
          {errors.caption && <p className="form-field-error" role="alert">{errors.caption.message}</p>}
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="vid-desc" className="form-label">Description</label>
            <CharCounter current={descLen} max={500} />
          </div>
          <textarea
            id="vid-desc"
            className="form-textarea"
            placeholder="Tell viewers what to expect…"
            rows={3}
            maxLength={500}
            disabled={isUploading}
            {...register("description")}
          />
        </div>

        <div className="form-field">
          <Controller
            name="video"
            control={control}
            render={() => (
              <FileDropzone
                accept="video/mp4,video/quicktime,video/x-msvideo,video/*"
                maxSizeMB={MAX_VIDEO_MB}
                preview={false}
                label="Video file"
                helpText="MP4, MOV or AVI"
                onChange={handleVideoSelect}
                error={videoSizeError ?? errors.video?.message}
              />
            )}
          />

          {selectedVideo && !videoSizeError && (
            <div className="video-file-meta">
              <span>{selectedVideo.name}</span>
              <span className="video-file-size">{formatBytes(selectedVideo.size)}</span>
              {estimatedTime && <span className="video-est-time">Est. upload time: {estimatedTime}</span>}
            </div>
          )}

          {isUploading && (
            <div className="upload-progress-wrap">
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="upload-progress-meta">
                <span>{uploadProgress}%</span>
                <button
                  type="button"
                  className="upload-cancel-btn"
                  onClick={() => cancelRef.current?.abort()}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-field">
          <Controller
            name="thumbnail"
            control={control}
            render={({ field }) => (
              <FileDropzone
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={5}
                preview
                label="Thumbnail (optional)"
                helpText="Custom thumbnail — JPEG, PNG or WebP"
                onChange={(f) => field.onChange(f)}
                className="dropzone--image"
              />
            )}
          />
        </div>

        <div className="form-submit-row form-submit-row--desktop">
          <button type="button" className="btn-ghost" onClick={closeForm} disabled={isUploading}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isUploading || !!videoSizeError}
            aria-busy={isUploading}
          >
            {isUploading ? <><SpinnerIcon />Uploading {uploadProgress}%</> : "Upload Video"}
          </button>
        </div>

        <StickySubmitBar
          label="Upload Video"
          loadingLabel={`Uploading ${uploadProgress}%…`}
          isLoading={isUploading}
          disabled={!!videoSizeError}
        />
      </form>
    </>
  );
}
