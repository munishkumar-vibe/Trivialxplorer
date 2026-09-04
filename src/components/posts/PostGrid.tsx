"use client";

import { useDashboard } from "@/context/DashboardContext";
import PostCard, { type PostItem } from "./PostCard";
import type { ContentCard } from "@/types/creator";

function toPostItem(card: ContentCard): PostItem {
  const wordCount = card.content
    ? card.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length
    : 0;
  return {
    id: card.id,
    title: card.title,
    description: card.description ?? "",
    coverUrl: card.thumbnailUrl,
    readingTimeMin: Math.max(1, Math.ceil(wordCount / 200)),
    status: card.status,
    createdAt: card.createdAt,
    viewCount: card.viewCount,
    content: card.content,
    author: card.author,
  };
}

function SkeletonCard() {
  return (
    <div className="post-card post-card--skeleton" aria-hidden="true">
      <div className="post-card-thumb skeleton-block" />
      <div className="post-card-body">
        <div className="skeleton-block post-skeleton-title" />
        <div className="skeleton-block post-skeleton-title post-skeleton-title--short" />
        <div className="skeleton-block post-skeleton-excerpt" />
        <div className="skeleton-block post-skeleton-meta" />
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="post-grid-empty">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="6 4" />
          <rect x="24" y="22" width="32" height="38" rx="3" fill="var(--color-surface-2)" stroke="var(--color-accent)" strokeWidth="1.5" />
          <line x1="30" y1="32" x2="50" y2="32" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="38" x2="50" y2="38" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="44" x2="42" y2="44" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">No posts yet</h2>
      <p className="empty-state-body">Share your trek experiences, gear tips, or trail notes — your first story is one click away.</p>
      <button type="button" className="btn-primary empty-state-btn" onClick={onCreateClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Write your first post
      </button>
    </div>
  );
}

export default function PostGrid() {
  const { items, isLoadingContent, openForm } = useDashboard();

  if (isLoadingContent) {
    return (
      <div className="post-grid" aria-busy="true" aria-label="Loading posts">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState onCreateClick={() => openForm("blog")} />;
  }

  return (
    <div className="post-grid" role="list" aria-label="Your posts">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <PostCard {...toPostItem(item)} />
        </div>
      ))}
    </div>
  );
}
