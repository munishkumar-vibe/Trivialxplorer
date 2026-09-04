"use client";

import { useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import ItineraryCard from "./ItineraryCard";
import type { ItineraryData } from "@/types/content";

function contextItemToItinerary(item: { id: string; title: string; thumbnailUrl?: string; status: "draft" | "published" | "processing"; createdAt: string; viewCount?: number }): ItineraryData {
  return {
    id: item.id,
    title: item.title,
    region: "My Itinerary",
    state: "",
    description: "Newly published itinerary.",
    coverUrl: item.thumbnailUrl,
    dayCount: 1,
    difficulty: "Moderate",
    maxElevationM: 0,
    distanceKm: 0,
    bestMonths: "—",
    status: item.status === "processing" ? "draft" : item.status,
    createdAt: item.createdAt,
    viewCount: item.viewCount ?? 0,
    days: [],
  };
}

function SkeletonCard() {
  return (
    <div className="itin-card itin-card--skeleton" aria-hidden="true">
      <div className="itin-card-thumb skeleton-block" />
      <div className="itin-card-body">
        <div className="skeleton-block itin-skeleton-region" />
        <div className="skeleton-block itin-skeleton-title" />
        <div className="skeleton-block itin-skeleton-title itin-skeleton-title--short" />
        <div className="skeleton-block itin-skeleton-desc" />
        <div className="skeleton-block itin-skeleton-stats" />
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="itin-grid-empty">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="6 4" />
          <polygon points="20 54 28 38 40 48 52 30 60 54" fill="var(--color-surface-2)" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="28" y1="26" x2="28" y2="46" stroke="var(--color-border)" strokeWidth="1.5" />
          <line x1="52" y1="26" x2="52" y2="46" stroke="var(--color-border)" strokeWidth="1.5" />
          <line x1="20" y1="34" x2="60" y2="34" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </div>
      <h2 className="empty-state-title">No itineraries yet</h2>
      <p className="empty-state-body">Plan your first trek day-by-day — share the route so others can follow in your footsteps.</p>
      <button type="button" className="btn-primary empty-state-btn" onClick={onCreateClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Plan your first itinerary
      </button>
    </div>
  );
}

export default function ItineraryGrid() {
  const { items: contextItems, isLoadingContent, openForm } = useDashboard();

  const allItems = useMemo(() => {
    return contextItems
      .filter((i) => i.type === "itinerary")
      .map(contextItemToItinerary);
  }, [contextItems]);

  if (isLoadingContent) {
    return (
      <div className="itin-grid" aria-busy="true" aria-label="Loading itineraries">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (allItems.length === 0) {
    return <EmptyState onCreateClick={() => openForm("itinerary")} />;
  }

  return (
    <div className="itin-grid" role="list" aria-label="Your itineraries">
      {allItems.map((item) => (
        <div key={item.id} role="listitem">
          <ItineraryCard {...item} />
        </div>
      ))}
    </div>
  );
}
