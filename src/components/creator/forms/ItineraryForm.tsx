"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { CharCounter } from "@/components/creator/shared/CharCounter";
import FileDropzone from "@/components/creator/shared/FileDropzone";
import StickySubmitBar from "@/components/creator/shared/StickySubmitBar";
import { ITINERARY } from "@/lib/api/endpoints";
import UnderReviewModal from "@/components/creator/shared/UnderReviewModal";
import type { ContentCard, ItineraryDay } from "@/types/creator";

const daySchema = z.object({
  id: z.string(),
  dayNumber: z.number(),
  title: z.string().min(1, "Day title required"),
  description: z.string().min(1, "Day description required"),
  location: z.string().optional(),
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(300, "Max 300 characters"),
  coverImage: z.instanceof(File, { message: "Cover image is required" }).nullable().refine((f) => f !== null, "Cover image is required"),
  days: z.array(daySchema).min(1, "Add at least one day"),
});

type FormData = z.infer<typeof schema>;

function makeDay(dayNumber: number): ItineraryDay {
  return { id: Math.random().toString(36).slice(2), dayNumber, title: "", description: "", location: "", imageFile: null };
}

/* ── Icons ───────────────────────────────────────────── */

function ChevronUp() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
}
function ChevronDown() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function GripIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>;
}
function SpinnerIcon() {
  return <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}
function ImageIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

/* ── Compact inline image uploader per day ───────────── */

interface DayImageUploadProps {
  dayId: string;
  onImageChange: (id: string, file: File | null) => void;
}

function DayImageUpload({ dayId, onImageChange }: DayImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.size > 8 * 1024 * 1024) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    onImageChange(dayId, file);
  }, [dayId, previewUrl, onImageChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    onImageChange(dayId, null);
    if (inputRef.current) inputRef.current.value = "";
  }, [dayId, previewUrl, onImageChange]);

  return (
    <div className="day-block-img-upload">
      <p className="day-block-img-label">
        <ImageIcon /> Day photo <span className="form-label-optional">(optional)</span>
      </p>

      <div
        className="day-block-img-compact"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        aria-label="Upload day photo"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Day preview" className="day-block-img-thumb" />
        ) : (
          <div className="day-block-img-placeholder">
            <ImageIcon />
          </div>
        )}

        <div className="day-block-img-compact-text">
          {fileName ? (
            <>
              <p className="day-block-img-compact-primary">{fileName}</p>
              <p className="day-block-img-compact-secondary">Click to replace</p>
            </>
          ) : (
            <>
              <p className="day-block-img-compact-primary">Add a photo</p>
              <p className="day-block-img-compact-secondary">JPEG, PNG or WebP · Max 8 MB</p>
            </>
          )}
        </div>

        {previewUrl && (
          <button type="button" className="day-block-img-clear" onClick={handleClear} aria-label="Remove day photo">
            <XIcon />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="dropzone-input-hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

/* ── Day accordion block ─────────────────────────────── */

interface DayBlockProps {
  day: ItineraryDay;
  index: number;
  total: number;
  onChange: (id: string, field: keyof ItineraryDay, value: string) => void;
  onImageChange: (id: string, file: File | null) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isDragging?: boolean;
  fieldErrors?: { title?: { message?: string }; description?: { message?: string } };
}

function DayBlock({ day, index, total, onChange, onImageChange, onRemove, onMoveUp, onMoveDown, fieldErrors }: DayBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const isComplete = day.title.trim() !== "" && day.description.trim() !== "";

  return (
    <div className={`day-block${isComplete ? " day-block--complete" : " day-block--incomplete"}`} data-day-id={day.id}>
      <div className="day-block-header">
        <span className="day-block-grip" aria-hidden="true"><GripIcon /></span>

        <button type="button" className="day-block-toggle" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          <span className="day-block-label">Day {day.dayNumber}</span>
          {day.title && <span className="day-block-preview">{day.title}</span>}
          {!isComplete && <span className="day-incomplete-dot" aria-label="Incomplete" />}
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </button>

        <div className="day-block-reorder">
          <button type="button" className="day-reorder-btn" onClick={() => onMoveUp(index)} disabled={index === 0} aria-label="Move day up">
            <ChevronUp />
          </button>
          <button type="button" className="day-reorder-btn" onClick={() => onMoveDown(index)} disabled={index === total - 1} aria-label="Move day down">
            <ChevronDown />
          </button>
        </div>

        <button
          type="button"
          className="day-remove-btn"
          onClick={() => {
            if (!isComplete || window.confirm("Remove this day? Content will be lost.")) {
              onRemove(day.id);
            }
          }}
          aria-label={`Remove Day ${day.dayNumber}`}
          disabled={total === 1}
        >
          <TrashIcon />
        </button>
      </div>

      {expanded && (
        <div className="day-block-body">
          <div className="day-fields-row">
            <div className="form-field form-field--grow">
              <label className="form-label">Day title</label>
              <input
                type="text"
                className={`form-input${fieldErrors?.title ? " form-input--error" : ""}`}
                placeholder={`What happens on Day ${day.dayNumber}?`}
                value={day.title}
                onChange={(e) => onChange(day.id, "title", e.target.value)}
              />
              {fieldErrors?.title && <p className="form-field-error">{fieldErrors.title.message}</p>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">
              Description
              <span className="form-label-optional" style={{ marginLeft: 6 }}>— one point per line</span>
            </label>
            <textarea
              className={`form-textarea${fieldErrors?.description ? " form-textarea--error" : ""}`}
              placeholder={"Trek through dense rhododendron forest\nCamp beside a glacial lake at 4200m\nSpot Himalayan blue sheep near the ridge"}
              rows={4}
              value={day.description}
              onChange={(e) => onChange(day.id, "description", e.target.value)}
            />
            {fieldErrors?.description && <p className="form-field-error">{fieldErrors.description.message}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Location <span className="form-label-optional">(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Chandratal Lake, Himachal Pradesh"
              value={day.location ?? ""}
              onChange={(e) => onChange(day.id, "location", e.target.value)}
            />
          </div>

          <DayImageUpload dayId={day.id} onImageChange={onImageChange} />
        </div>
      )}
    </div>
  );
}

/* ── Main form ───────────────────────────────────────── */

export default function ItineraryForm() {
  const { closeForm, prependItem, showToast } = useDashboard();
  const { accessToken } = useAuth();
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [days, setDays] = useState<ItineraryDay[]>([makeDay(1)]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", coverImage: null, days: [makeDay(1)] },
    mode: "onChange",
  });

  const descLen = watch("description").length;

  const syncDays = useCallback((updated: ItineraryDay[]) => {
    const renumbered = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(renumbered);
    setValue("days", renumbered, { shouldValidate: true });
  }, [setValue]);

  const addDay = useCallback(() => {
    syncDays([...days, makeDay(days.length + 1)]);
  }, [days, syncDays]);

  const handleDayChange = useCallback((id: string, field: keyof ItineraryDay, value: string) => {
    syncDays(days.map((d) => d.id === id ? { ...d, [field]: value } : d));
  }, [days, syncDays]);

  const handleDayImageChange = useCallback((id: string, file: File | null) => {
    setDays((prev) => prev.map((d) => d.id === id ? { ...d, imageFile: file } : d));
  }, []);

  const handleRemove = useCallback((id: string) => {
    syncDays(days.filter((d) => d.id !== id));
  }, [days, syncDays]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const arr = [...days];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    syncDays(arr);
  }, [days, syncDays]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === days.length - 1) return;
    const arr = [...days];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    syncDays(arr);
  }, [days, syncDays]);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const arr = [...days];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(index, 0, moved);
    setDragIndex(index);
    syncDays(arr);
  };
  const handleDragEnd = () => setDragIndex(null);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("title", data.title);
      body.append("description", data.description);
      if (data.coverImage) body.append("coverImage", data.coverImage);
      body.append("days", JSON.stringify(days.map(({ id: _id, imageFile: _img, ...rest }) => rest)));
      days.forEach((d, i) => {
        if (d.imageFile) body.append(`dayImages_${i}`, d.imageFile);
      });

      const res = await fetch(ITINERARY.CREATE, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body,
      });
      const result = await res.json();

      if (!res.ok) {
        showToast(result?.message ?? "Something went wrong. Please try again.", "error");
        return;
      }

      const raw = result.data;
      const newItem: ContentCard = {
        id: raw._id,
        type: "itinerary",
        title: raw.title,
        thumbnailUrl: raw.coverImageUrl ?? undefined,
        status: raw.status ?? "pending",
        createdAt: raw.createdAt ?? new Date().toISOString(),
        viewCount: 0,
        description: raw.description,
      };
      prependItem(newItem);
      setShowReviewModal(true);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysErrors = (errors.days as unknown as Array<{ title?: { message?: string }; description?: { message?: string } }> | undefined);

  return (
    <>
    {showReviewModal && <UnderReviewModal type="itinerary" onClose={closeForm} />}
    <form className="creator-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="itin-title" className="form-label">Itinerary title</label>
        <input
          id="itin-title"
          type="text"
          className={`form-input${errors.title ? " form-input--error" : ""}`}
          placeholder="e.g. 7-Day Spiti Valley Circuit"
          {...register("title")}
        />
        {errors.title && <p className="form-field-error" role="alert">{errors.title.message}</p>}
      </div>

      <div className="form-field">
        <div className="form-label-row">
          <label htmlFor="itin-desc" className="form-label">Overview</label>
          <CharCounter current={descLen} max={300} />
        </div>
        <textarea
          id="itin-desc"
          className="form-textarea"
          placeholder="A brief overview of this trip…"
          rows={3}
          maxLength={300}
          {...register("description")}
        />
        {errors.description && <p className="form-field-error" role="alert">{errors.description.message}</p>}
      </div>

      <div className="form-field">
        <Controller
          name="coverImage"
          control={control}
          render={({ field }) => (
            <FileDropzone
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={10}
              preview
              label="Cover image"
              helpText="JPEG, PNG or WebP"
              onChange={(f) => field.onChange(f)}
              error={errors.coverImage?.message}
              className="dropzone--image"
            />
          )}
        />
      </div>

      <div className="form-field">
        <div className="form-label-row">
          <label className="form-label">Days</label>
          <span className="form-label-badge">{days.length} day{days.length !== 1 ? "s" : ""}</span>
        </div>

        {errors.days && typeof errors.days.message === "string" && (
          <p className="form-field-error" role="alert">{errors.days.message}</p>
        )}

        <div className="day-list">
          {days.map((day, idx) => (
            <div
              key={day.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={dragIndex === idx ? "day-block-dragging" : ""}
            >
              <DayBlock
                day={day}
                index={idx}
                total={days.length}
                onChange={handleDayChange}
                onImageChange={handleDayImageChange}
                onRemove={handleRemove}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                fieldErrors={daysErrors?.[idx]}
              />
            </div>
          ))}
        </div>

        <button type="button" className="btn-add-day" onClick={addDay}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Day
        </button>
      </div>

      <div className="form-submit-row form-submit-row--desktop">
        <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <><SpinnerIcon />Publishing…</> : "Publish Itinerary"}
        </button>
      </div>

      <StickySubmitBar label="Publish Itinerary" loadingLabel="Publishing…" isLoading={isSubmitting} />
    </form>
    </>
  );
}
