"use client";

import { useDashboard } from "@/context/DashboardContext";
import ContentCard from "./ContentCard";

function SkeletonCard() {
  return (
    <div className="content-card content-card--skeleton" aria-hidden="true">
      <div className="content-card-thumb skeleton-block" />
      <div className="content-card-body">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-title skeleton-title--short" />
        <div className="skeleton-block skeleton-meta" />
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="content-grid-empty">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="6 4" />
          <path d="M28 52 L32 38 L40 48 L48 34 L52 52 Z" fill="var(--color-surface-2)" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="40" cy="28" r="6" fill="var(--color-surface-2)" stroke="var(--color-accent)" strokeWidth="1.5" />
          <path d="M37.5 28 L39.5 30 L43 26" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">Nothing published yet</h2>
      <p className="empty-state-body">Your first trek story starts here — share a trail, upload a film, or plan an itinerary.</p>
      <button type="button" className="btn-primary empty-state-btn" onClick={onCreateClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create your first post
      </button>
    </div>
  );
}

export default function ContentGrid() {
  const { items, isLoadingContent, openForm } = useDashboard();

  if (isLoadingContent) {
    return (
      <div className="content-grid" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState onCreateClick={() => openForm("blog")} />;
  }

  return (
    <div className="content-grid" role="list" aria-label="Your content">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <ContentCard {...item} />
        </div>
      ))}
    </div>
  );
}
