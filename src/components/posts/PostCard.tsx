"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/creator/shared/StatusBadge";
import { useDashboard } from "@/context/DashboardContext";
import type { ContentStatus } from "@/types/creator";

export interface PostItem {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  readingTimeMin: number;
  status: ContentStatus;
  createdAt: string;
  viewCount?: number;
  content?: string;
  author?: string;
}

function BlogIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

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

export default function PostCard({ id, title, description, coverUrl, readingTimeMin, status, createdAt, viewCount, content, author }: PostItem) {
  const router = useRouter();
  const { openEditForm } = useDashboard();

  function handleClick() {
    router.push(`/posts/${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function handleEdit() {
    openEditForm({ id, type: "blog", title, description, thumbnailUrl: coverUrl, status, createdAt, viewCount, content, author });
  }

  return (
    <article
      className={`post-card${status === "draft" ? " post-card--draft" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`Blog post: ${title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="post-card-thumb">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="post-card-img" />
        ) : (
          <div className="post-card-thumb-placeholder" aria-hidden="true">
            <BlogIcon />
          </div>
        )}

        <span className="post-card-type-badge">
          <BlogIcon />
          Blog
        </span>

        <span className="post-card-read-badge">
          <ClockIcon />
          {readingTimeMin} min read
        </span>
      </div>

      <div className="post-card-body">
        <h3 className="post-card-title">{title}</h3>
        {description && (
          <p className="post-card-excerpt">{description}</p>
        )}

        <div className="post-card-meta">
          <StatusBadge status={status} />
          <span className="post-card-date">{formatRelativeDate(createdAt)}</span>
          {viewCount !== undefined && (
            <span className="post-card-views">
              <EyeIcon />
              {formatCount(viewCount)}
            </span>
          )}
        </div>
      </div>

      <div className="post-card-actions" onClick={stopPropagation} role="toolbar" aria-label="Post actions">
        <button type="button" className="post-card-action-btn" aria-label="Edit post" onClick={handleEdit}>
          <EditIcon />
          Edit
        </button>
        <button type="button" className="post-card-action-btn" aria-label="View post" onClick={() => router.push(`/posts/${id}`)}>
          <ExternalIcon />
          View
        </button>
        <button type="button" className="post-card-action-btn post-card-action-btn--danger" aria-label="Delete post">
          <TrashIcon />
          Delete
        </button>
      </div>
    </article>
  );
}
