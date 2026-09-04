"use client";

import { useState } from "react";
import ExploreCard from "@/components/explore/ExploreCard";
import type { ExploreItem } from "@/types/content";

function EmptyState() {
  return (
    <div className="saved-empty">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="6 4" />
          <path d="M28 24 a2 2 0 0 1 2-2 h20 a2 2 0 0 1 2 2 v34 l-12-8 -12 8 Z" fill="var(--color-surface-2)" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">Nothing saved yet</h2>
      <p className="empty-state-body">Bookmark trek stories, itineraries and videos from Explore to find them here later.</p>
    </div>
  );
}

const SAVED_ITEMS: ExploreItem[] = [];

export default function SavedGrid() {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());

  const items = SAVED_ITEMS.filter((item) => saved.has(item.id));

  function toggleBookmark(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="explore-grid" role="list" aria-label="Saved content">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <ExploreCard
            {...item}
            savedByMe={saved.has(item.id)}
            onBookmarkToggle={toggleBookmark}
          />
        </div>
      ))}
    </div>
  );
}
