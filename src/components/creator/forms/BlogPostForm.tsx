"use client";

import { useCallback, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { CharCounter, countWords } from "@/components/creator/shared/CharCounter";
import FileDropzone from "@/components/creator/shared/FileDropzone";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/creator/shared/RichTextEditor";
import StickySubmitBar from "@/components/creator/shared/StickySubmitBar";
import { BLOG } from "@/lib/api/endpoints";
import { API_BASE_URL } from "@/lib/api/config";
import UnderReviewModal from "@/components/creator/shared/UnderReviewModal";
import type { ContentCard } from "@/types/creator";

const MAX_CONTENT_IMAGES = 5;

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z.string().min(1, "Description is required").max(200, "Max 200 characters"),
  contentHtml: z.string(),
  contentText: z.string().refine(
    (txt) => { const w = countWords(txt); return w >= 500 && w <= 1500; },
    { message: "Content must be between 500 and 1500 words" }
  ),
  image: z.instanceof(File, { message: "Cover image is required" }).nullable().refine((f) => f !== null, "Cover image is required"),
});

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z.string().min(1, "Description is required").max(200, "Max 200 characters"),
  contentHtml: z.string(),
  contentText: z.string().refine(
    (txt) => { const w = countWords(txt); return w >= 500 && w <= 1500; },
    { message: "Content must be between 500 and 1500 words" }
  ),
  image: z.instanceof(File).nullable(),
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;
type FormData = CreateData | EditData;

interface BlogPostFormProps {
  editPost?: ContentCard;
}

function SpinnerIcon() {
  return (
    <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return <span className="blog-form-section-icon" aria-hidden="true">{children}</span>;
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function InsertIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

export default function BlogPostForm({ editPost }: BlogPostFormProps) {
  const isEditing = !!editPost;
  const { closeForm, prependItem, updateItem, showToast } = useDashboard();
  const { accessToken } = useAuth();
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>(Array(MAX_CONTENT_IMAGES).fill(null));

  const [contentFiles, setContentFiles] = useState<(File | null)[]>(Array(MAX_CONTENT_IMAGES).fill(null));
  const [contentUrls, setContentUrls] = useState<(string | null)[]>(Array(MAX_CONTENT_IMAGES).fill(null));

  const initialText = isEditing && editPost.content ? htmlToText(editPost.content) : "";

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isEditing ? editSchema : createSchema) as never,
    defaultValues: {
      title: editPost?.title ?? "",
      description: editPost?.description ?? "",
      contentHtml: editPost?.content ?? "",
      contentText: initialText,
      image: null,
    },
    mode: "onChange",
  });

  const titleLen = watch("title").length;
  const descLen = watch("description").length;
  const wordCount = countWords(watch("contentText") ?? "");
  const isWordOver = wordCount > 1500;

  const wordProgressPct = Math.min(100, (wordCount / 1500) * 100);
  const wordProgressColor =
    wordCount === 0 ? "var(--color-border)"
    : wordCount < 500 ? "var(--color-accent-warm)"
    : wordCount <= 1500 ? "var(--color-accent)"
    : "#d94f4f";

  function handleContentImageChange(index: number, file: File | null) {
    if (contentUrls[index]) URL.revokeObjectURL(contentUrls[index]!);
    setContentFiles((prev) => { const next = [...prev]; next[index] = file; return next; });
    setContentUrls((prev) => { const next = [...prev]; next[index] = file ? URL.createObjectURL(file) : null; return next; });
  }

  function removeContentImage(index: number) {
    if (contentUrls[index]) URL.revokeObjectURL(contentUrls[index]!);
    setContentFiles((prev) => { const next = [...prev]; next[index] = null; return next; });
    setContentUrls((prev) => { const next = [...prev]; next[index] = null; return next; });
    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = "";
  }

  function insertImageAtCursor(index: number) {
    const url = contentUrls[index];
    if (url) editorRef.current?.insertImage(url);
  }

  const onSubmit = useCallback(async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("title", data.title);
      body.append("description", data.description);
      body.append("content", data.contentHtml);
      if (data.image) body.append("image", data.image);
      contentFiles.forEach((file) => { if (file) body.append("contentImages", file); });

      const url = isEditing ? BLOG.UPDATE(editPost!.id) : BLOG.CREATE;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body,
      });
      const result = await res.json();

      if (!res.ok) {
        showToast(result?.message ?? "Something went wrong. Please try again.", "error");
        return;
      }

      let finalHtml = data.contentHtml;
      const serverImageUrls: string[] = result.data?.contentImageUrls ?? [];
      let serverIndex = 0;
      contentUrls.forEach((objUrl) => {
        if (!objUrl) return;
        const serverUrl = serverImageUrls[serverIndex++];
        if (serverUrl) finalHtml = finalHtml.replaceAll(objUrl, `${API_BASE_URL}${serverUrl}`);
      });

      const updatedCard: ContentCard = {
        id: result.data?._id ?? editPost?.id ?? Math.random().toString(36).slice(2),
        type: "blog",
        title: data.title,
        thumbnailUrl: result.data?.imageUrl
          ? result.data.imageUrl
          : data.image
          ? URL.createObjectURL(data.image)
          : editPost?.thumbnailUrl,
        status: result.data?.status ?? "pending",
        createdAt: result.data?.createdAt ?? editPost?.createdAt ?? new Date().toISOString(),
        viewCount: editPost?.viewCount ?? 0,
        description: data.description,
        content: finalHtml,
      };

      if (isEditing) {
        updateItem(updatedCard);
        showToast("Post resubmitted for review.");
        closeForm();
      } else {
        prependItem(updatedCard);
        setShowReviewModal(true);
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [closeForm, prependItem, updateItem, showToast, contentFiles, contentUrls, isEditing, editPost, accessToken]);

  const filledCount = contentFiles.filter(Boolean).length;

  return (
    <>
    {showReviewModal && <UnderReviewModal type="blog" onClose={closeForm} />}
    <form className="blog-form" onSubmit={handleSubmit(onSubmit as never)} noValidate>

      {/* ── Cover image ─────────────────────────── */}
      <div className="blog-form-cover-section">
        {isEditing && editPost.thumbnailUrl && (
          <div className="blog-form-current-cover">
            <img src={editPost.thumbnailUrl} alt="Current cover" className="blog-form-current-cover-img" />
            <span className="blog-form-current-cover-label">Current cover — upload below to replace</span>
          </div>
        )}
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <FileDropzone
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={5}
              preview
              label=""
              helpText={isEditing ? "Upload new cover to replace · JPEG · PNG · WebP" : "JPEG · PNG · WebP — cover background"}
              onChange={(f) => field.onChange(f)}
              error={errors.image?.message}
              className="blog-form-cover-dropzone"
            />
          )}
        />
        {errors.image && (
          <p className="form-field-error blog-form-cover-error" role="alert">{errors.image.message}</p>
        )}
      </div>

      {/* ── Basics ──────────────────────────────── */}
      <div className="blog-form-section">
        <div className="blog-form-section-header">
          <SectionIcon>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </SectionIcon>
          <span className="blog-form-section-label">Basics</span>
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="blog-title" className="form-label">Title</label>
            <CharCounter current={titleLen} max={120} />
          </div>
          <input
            id="blog-title"
            type="text"
            className={`blog-form-title-input${errors.title ? " form-input--error" : ""}`}
            placeholder="Your story headline…"
            maxLength={120}
            {...register("title")}
          />
          {errors.title && <p className="form-field-error" role="alert">{errors.title.message}</p>}
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="blog-desc" className="form-label">Short description</label>
            <CharCounter current={descLen} max={200} />
          </div>
          <textarea
            id="blog-desc"
            className={`form-textarea blog-form-desc-textarea${errors.description ? " form-textarea--error" : ""}`}
            placeholder="A 1–2 sentence hook that makes readers want to continue…"
            rows={2}
            maxLength={200}
            {...register("description")}
          />
          {errors.description && <p className="form-field-error" role="alert">{errors.description.message}</p>}
        </div>
      </div>

      {/* ── Content ─────────────────────────────── */}
      <div className="blog-form-section">
        <div className="blog-form-section-header blog-form-section-header--spaced">
          <div className="blog-form-section-header-left">
            <SectionIcon>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </SectionIcon>
            <span className="blog-form-section-label">Content</span>
          </div>
          <span className={`blog-form-word-count${wordCount === 0 ? "" : wordCount < 500 ? " blog-form-word-count--warn" : wordCount <= 1500 ? " blog-form-word-count--ok" : " blog-form-word-count--over"}`}>
            {wordCount.toLocaleString()} / 1,500 words
          </span>
        </div>

        <Controller
          name="contentHtml"
          control={control}
          render={() => (
            <RichTextEditor
              ref={editorRef}
              value={editPost?.content ?? ""}
              onChange={(html, text) => {
                setValue("contentHtml", html, { shouldValidate: true });
                setValue("contentText", text, { shouldValidate: true });
              }}
              placeholder="Tell your trek story here…"
              error={!!errors.contentText}
            />
          )}
        />

        <div className="blog-form-progress-wrap" aria-hidden="true">
          <div className="blog-form-progress-bar" style={{ width: `${wordProgressPct}%`, background: wordProgressColor }} />
        </div>
        <div className="blog-form-progress-legend">
          <span className={`blog-form-progress-hint${wordCount >= 500 ? " blog-form-progress-hint--done" : ""}`}>
            {wordCount < 500 ? `${500 - wordCount} more words to meet minimum` : wordCount <= 1500 ? "Great length!" : `${wordCount - 1500} words over limit`}
          </span>
          <span className="blog-form-progress-range">500 – 1,500 words</span>
        </div>
        {errors.contentText && <p className="form-field-error" role="alert">{errors.contentText.message}</p>}
      </div>

      {/* ── Content images ───────────────────────── */}
      <div className="blog-form-section">
        <div className="blog-form-section-header blog-form-section-header--spaced">
          <div className="blog-form-section-header-left">
            <SectionIcon>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </SectionIcon>
            <span className="blog-form-section-label">Content images</span>
          </div>
          <span className="blog-form-img-count">{filledCount} / {MAX_CONTENT_IMAGES}</span>
        </div>
        <p className="blog-form-img-hint">Upload up to 5 photos and click "Insert at cursor" to place them in your story.</p>

        <div className="blog-form-content-images">
          {Array.from({ length: MAX_CONTENT_IMAGES }, (_, i) => {
            const file = contentFiles[i];
            const url = contentUrls[i];
            return (
              <div key={i} className={`blog-cimg-slot${file ? " blog-cimg-slot--filled" : ""}`}>
                {file && url ? (
                  <>
                    <img src={url} alt={`Content image ${i + 1}`} className="blog-cimg-thumb" />
                    <div className="blog-cimg-actions">
                      <button type="button" className="blog-cimg-insert-btn" onClick={() => insertImageAtCursor(i)} title="Insert at cursor">
                        <InsertIcon />Insert
                      </button>
                      <button type="button" className="blog-cimg-remove-btn" onClick={() => removeContentImage(i)} aria-label={`Remove image ${i + 1}`}>×</button>
                    </div>
                  </>
                ) : (
                  <button type="button" className="blog-cimg-add-btn" onClick={() => fileInputRefs.current[i]?.click()} aria-label={`Add content image ${i + 1}`}>
                    <PlusIcon />
                  </button>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[i] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="blog-cimg-input"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > 5 * 1024 * 1024) {
                      showToast(`Image ${i + 1} is too large — max 5 MB`, "error");
                      e.target.value = "";
                      return;
                    }
                    handleContentImageChange(i, f);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Submit ───────────────────────────────── */}
      <div className="form-submit-row form-submit-row--desktop blog-form-actions">
        <button type="button" className="btn-ghost" onClick={closeForm} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isWordOver || isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting
            ? <><SpinnerIcon />{isEditing ? "Saving…" : "Publishing…"}</>
            : isEditing ? "Save Changes" : "Publish Post"}
        </button>
      </div>

      <StickySubmitBar
        label={isEditing ? "Save Changes" : "Publish Post"}
        loadingLabel={isEditing ? "Saving…" : "Publishing…"}
        isLoading={isSubmitting}
        disabled={isWordOver}
      />
    </form>
    </>
  );
}
