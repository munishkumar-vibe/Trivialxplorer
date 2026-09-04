"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./shared/StatusBadge";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { BLOG, ITINERARY } from "@/lib/api/endpoints";
import type { ContentCard as ContentCardType, ContentType } from "@/types/creator";

function BlogIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function VideoIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
}
function MapIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function EyeIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function EditIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  blog: <BlogIcon />,
  video: <VideoIcon />,
  itinerary: <MapIcon />,
};

const TYPE_LABELS: Record<ContentType, string> = {
  blog: "Blog",
  video: "Video",
  itinerary: "Itinerary",
};

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatCount(n?: number): string {
  if (n === undefined) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ContentCard({ id, type, title, thumbnailUrl, status, createdAt, viewCount }: ContentCardType) {
  const router = useRouter();
  const { removeItem, openEditForm, showToast } = useDashboard();
  const { accessToken, data } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleCardClick() {
    if (type === "blog") router.push(`/posts/${id}`);
    else if (type === "itinerary") router.push(`/itineraries/${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (type === "blog") {
      openEditForm({ id, type, title, thumbnailUrl, status, createdAt, viewCount });
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  async function handleConfirmDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!accessToken) return;
    setDeleting(true);
    try {
      const url = type === "blog" ? BLOG.DELETE(id) : ITINERARY.DELETE(id);
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        removeItem(id);
        showToast(`${TYPE_LABELS[type]} deleted.`);
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.message ?? "Failed to delete.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const canEdit = type === "blog";

  return (
    <article
      className="content-card"
      tabIndex={0}
      role="button"
      aria-label={`${TYPE_LABELS[type]}: ${title}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="content-card-thumb">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="content-card-img" />
        ) : (
          <div className="content-card-thumb-placeholder" aria-hidden="true">
            {TYPE_ICONS[type]}
          </div>
        )}
        <span className="content-card-type-badge">
          {TYPE_ICONS[type]}
          {TYPE_LABELS[type]}
        </span>
      </div>

      <div className="content-card-body">
        <h3 className="content-card-title">{title}</h3>

        <div className="content-card-meta">
          <StatusBadge status={status} />
          <span className="content-card-date">{formatRelativeDate(createdAt)}</span>
          {viewCount !== undefined && (
            <span className="content-card-views">
              <EyeIcon />
              {formatCount(viewCount)}
            </span>
          )}
        </div>

        {confirmDelete ? (
          <div className="content-card-confirm" onClick={(e) => e.stopPropagation()}>
            <span className="content-card-confirm-text">Delete this {TYPE_LABELS[type].toLowerCase()}?</span>
            <div className="content-card-confirm-actions">
              <button className="content-card-confirm-cancel" onClick={handleCancelDelete} disabled={deleting}>Cancel</button>
              <button className="content-card-confirm-delete" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="content-card-actions">
            {canEdit && (
              <button className="content-card-action-btn content-card-action-btn--edit" onClick={handleEditClick} title="Edit">
                <EditIcon /> Edit
              </button>
            )}
            <button className="content-card-action-btn content-card-action-btn--delete" onClick={handleDeleteClick} title="Delete">
              <TrashIcon /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
