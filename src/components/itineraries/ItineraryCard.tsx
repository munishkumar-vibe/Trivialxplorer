"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/creator/shared/StatusBadge";
import type { ItineraryData, Difficulty } from "@/types/content";

function ElevationIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 20 9 4 15 14 19 10 21 20" />
    </svg>
  );
}

function DistanceIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  Easy: "itin-diff--easy",
  Moderate: "itin-diff--moderate",
  Difficult: "itin-diff--difficult",
  Extreme: "itin-diff--extreme",
};

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export type { ItineraryData as ItineraryItem };

export default function ItineraryCard({ id, title, region, state, description, coverUrl, dayCount, difficulty, maxElevationM, distanceKm, bestMonths, status, createdAt, viewCount }: ItineraryData) {
  const router = useRouter();

  return (
    <article
      className="itin-card"
      tabIndex={0}
      role="button"
      aria-label={`Itinerary: ${title}`}
      onClick={() => router.push(`/itineraries/${id}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/itineraries/${id}`); } }}
    >
      {/* ── Image with gradient overlay ── */}
      <div className="itin-card-thumb">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="itin-card-img" />
        ) : (
          <div className="itin-card-thumb-placeholder" aria-hidden="true">
            <ElevationIcon />
          </div>
        )}

        {/* Bottom-left: difficulty */}
        <span className={`itin-diff-badge ${DIFFICULTY_CLASS[difficulty]}`}>{difficulty}</span>

        {/* Bottom-right: day count */}
        <span className="itin-days-badge">
          {dayCount} {dayCount === 1 ? "day" : "days"}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="itin-card-body">
        {/* Region line */}
        <p className="itin-card-region">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {region} · {state}
        </p>

        <h3 className="itin-card-title">{title}</h3>
        <p className="itin-card-description">{description}</p>

        {/* Stats row */}
        <div className="itin-card-stats">
          <span className="itin-stat">
            <ElevationIcon />
            {maxElevationM.toLocaleString()}m
          </span>
          <span className="itin-stat-divider" />
          <span className="itin-stat">
            <DistanceIcon />
            {distanceKm} km
          </span>
          <span className="itin-stat-divider" />
          <span className="itin-stat">
            <CalendarIcon />
            {bestMonths}
          </span>
        </div>

        {/* Footer meta */}
        <div className="itin-card-meta">
          <StatusBadge status={status} />
          <span className="itin-card-date">{formatRelativeDate(createdAt)}</span>
          {viewCount > 0 && (
            <span className="itin-card-views">
              <EyeIcon />
              {formatCount(viewCount)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
