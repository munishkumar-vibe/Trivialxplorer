"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/creator/shared/StatusBadge";
import { ITINERARY } from "@/lib/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import type { ItineraryData, ItineraryDayDetail } from "@/types/content";

/* ── Icons ─────────────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ElevationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 20 9 4 15 14 19 10 21 20" />
    </svg>
  );
}
function DistanceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 7 12 3 21 7 12 11 3 7" /><polyline points="3 12 12 8 21 12" /><polyline points="3 17 12 13 21 17" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────── */

function toAbsUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : path;
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:      "var(--color-accent)",
  Moderate:  "var(--color-accent-warm)",
  Difficult: "#d94f4f",
  Extreme:   "#9b1c1c",
};

function mapApiItinerary(raw: Record<string, unknown>): ItineraryData {
  const authorObj = raw.author as Record<string, unknown> | null;
  const rawDays = (raw.days as Record<string, unknown>[]) ?? [];

  const days: ItineraryDayDetail[] = rawDays.map((d) => {
    const dayImages = (d.images as string[]) ?? [];
    const locations = (d.locations as Record<string, unknown>[]) ?? [];
    const firstLoc = locations[0]?.name as string | undefined;
    const locationStr = (d.location as string | undefined) ?? firstLoc ?? "";
    return {
      dayNumber:   d.dayNumber as number,
      title:       d.title as string,
      description: d.description as string,
      location:    locationStr,
      imageUrl:    dayImages[0] ? toAbsUrl(dayImages[0]) : undefined,
    };
  });

  return {
    id:           (raw._id as string) ?? "",
    title:        raw.title as string,
    region:       (raw.region as string) ?? "Trek",
    state:        (raw.state as string) ?? "",
    description:  raw.description as string,
    coverUrl:     toAbsUrl(raw.coverImageUrl as string | undefined),
    dayCount:     (raw.totalDays as number) ?? days.length,
    difficulty:   (raw.difficulty as "Easy" | "Moderate" | "Difficult" | "Extreme") ?? "Moderate",
    maxElevationM:(raw.maxElevationM as number) ?? 0,
    distanceKm:   (raw.distanceKm as number) ?? 0,
    bestMonths:   (raw.bestMonths as string) ?? "—",
    status:       (raw.status as "published" | "draft") ?? "published",
    createdAt:    raw.createdAt as string,
    viewCount:    (raw.viewCount as number) ?? 0,
    author:       typeof authorObj === "object" && authorObj !== null ? (authorObj.name as string) : undefined,
    days,
  };
}

/* ── Day timeline block ─────────────────────────────── */

function descToBullets(description: string) {
  const lines = description.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  return (
    <ul className="itin-timeline-bullets">
      {lines.map((line, i) => (
        <li key={i} className="itin-timeline-bullet">{line}</li>
      ))}
    </ul>
  );
}

function DayBlock({ day, isLast }: { day: ItineraryDayDetail; isLast: boolean }) {
  return (
    <div className="itin-timeline-stop">
      <div className="itin-timeline-left">
        <div className={`itin-timeline-circle${isLast ? " itin-timeline-circle--last" : ""}`}>
          <span className="itin-timeline-circle-label">DAY</span>
          <span className="itin-timeline-circle-num">{day.dayNumber}</span>
        </div>
        {!isLast && <div className="itin-timeline-connector" />}
      </div>

      <div className="itin-timeline-content">
        <h3 className="itin-timeline-title">{day.title}</h3>

        {(day.location || day.elevationM || day.distanceKm) && (
          <div className="itin-timeline-chips">
            {day.location && (
              <span className="itin-timeline-chip"><PinIcon />{day.location}</span>
            )}
            {day.elevationM != null && day.elevationM > 0 && (
              <span className="itin-timeline-chip"><ElevationIcon />{day.elevationM.toLocaleString()} m</span>
            )}
            {day.distanceKm != null && day.distanceKm > 0 && (
              <span className="itin-timeline-chip"><DistanceIcon />{day.distanceKm} km</span>
            )}
          </div>
        )}

        {day.imageUrl && (
          <div className="itin-timeline-img-wrap">
            <img src={day.imageUrl} alt={`Day ${day.dayNumber} — ${day.title}`} className="itin-timeline-img" />
          </div>
        )}

        {descToBullets(day.description)}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────── */

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [itin,    setItin]    = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchItin() {
      try {
        const res = await fetch(ITINERARY.GET(id as string), {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (!res.ok) throw new Error("not found");
        const result = await res.json();
        if (!cancelled) setItin(mapApiItinerary(result.data));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItin();
    return () => { cancelled = true; };
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="blog-detail-not-found">
        <p className="blog-detail-not-found-body">Loading itinerary…</p>
      </div>
    );
  }

  if (error || !itin) {
    return (
      <div className="blog-detail-not-found">
        <h1 className="blog-detail-not-found-title">Itinerary not found</h1>
        <p className="blog-detail-not-found-body">This itinerary doesn&apos;t exist or may have been removed.</p>
        <Link href="/itineraries" className="btn-primary" style={{ display: "inline-flex", marginTop: "1rem" }}>
          <ArrowLeftIcon /> Back to Itineraries
        </Link>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLOR[itin.difficulty] ?? "var(--color-accent)";

  return (
    <div className="itin-detail">

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="blog-detail-hero itin-detail-hero">
        {itin.coverUrl ? (
          <img src={itin.coverUrl} alt="" className="blog-detail-hero-img" />
        ) : (
          <div className="blog-detail-hero-placeholder" />
        )}
        <div className="blog-detail-hero-overlay" />

        <div className="blog-detail-hero-content itin-detail-hero-content">
          <div className="blog-detail-hero-top">
            <button type="button" className="blog-back-btn" onClick={() => router.back()} aria-label="Go back">
              <ArrowLeftIcon />Back
            </button>
            <StatusBadge status={itin.status} />
          </div>

          {(itin.region || itin.state) && (
            <p className="itin-detail-kicker">
              <PinIcon />
              {itin.region}{itin.state ? ` · ${itin.state}` : ""}
            </p>
          )}

          <h1 className="blog-detail-title itin-detail-title">{itin.title}</h1>

          <div className="itin-detail-hero-chips">
            <span className="itin-detail-hero-chip itin-detail-hero-chip--diff" style={{ color: diffColor, borderColor: diffColor }}>
              {itin.difficulty}
            </span>
            <span className="itin-detail-hero-chip">
              <CalendarIcon />{itin.dayCount} {itin.dayCount === 1 ? "day" : "days"}
            </span>
            {itin.maxElevationM > 0 && (
              <span className="itin-detail-hero-chip">
                <ElevationIcon />{itin.maxElevationM.toLocaleString()}m max
              </span>
            )}
            {itin.distanceKm > 0 && (
              <span className="itin-detail-hero-chip">
                <DistanceIcon />{itin.distanceKm}km
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div className="itin-detail-body">

        <section className="itin-detail-section">
          <p className="itin-detail-description">{itin.description}</p>
        </section>

        <div className="itin-detail-stats-grid">
          {itin.maxElevationM > 0 && (
            <div className="itin-detail-stat">
              <span className="itin-detail-stat-icon"><ElevationIcon /></span>
              <div>
                <p className="itin-detail-stat-value">{itin.maxElevationM.toLocaleString()}m</p>
                <p className="itin-detail-stat-label">Max elevation</p>
              </div>
            </div>
          )}
          {itin.distanceKm > 0 && (
            <div className="itin-detail-stat">
              <span className="itin-detail-stat-icon"><DistanceIcon /></span>
              <div>
                <p className="itin-detail-stat-value">{itin.distanceKm}km</p>
                <p className="itin-detail-stat-label">Total distance</p>
              </div>
            </div>
          )}
          {itin.bestMonths && itin.bestMonths !== "—" && (
            <div className="itin-detail-stat">
              <span className="itin-detail-stat-icon"><CalendarIcon /></span>
              <div>
                <p className="itin-detail-stat-value">{itin.bestMonths}</p>
                <p className="itin-detail-stat-label">Best months</p>
              </div>
            </div>
          )}
          <div className="itin-detail-stat">
            <span className="itin-detail-stat-icon"><FlagIcon /></span>
            <div>
              <p className="itin-detail-stat-value" style={{ color: diffColor }}>{itin.difficulty}</p>
              <p className="itin-detail-stat-label">Difficulty</p>
            </div>
          </div>
        </div>

        <div className="itin-detail-meta-row">
          <StatusBadge status={itin.status} />
          <span className="itin-detail-meta-date">{formatDate(itin.createdAt)}</span>
          {itin.viewCount > 0 && (
            <span className="itin-detail-meta-views">
              <EyeIcon />{formatCount(itin.viewCount)} views
            </span>
          )}
        </div>

        {itin.days.length > 0 && (
          <section className="itin-detail-section">
            <h2 className="itin-detail-section-title">
              Day-by-Day Route
              <span className="itin-detail-section-count">{itin.dayCount} days</span>
            </h2>
            <div className="itin-timeline">
              {itin.days.map((day, i) => (
                <DayBlock key={day.dayNumber} day={day} isLast={i === itin.days.length - 1} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div className="blog-detail-footer">
        <button type="button" className="btn-ghost blog-detail-back-footer" onClick={() => router.back()}>
          <ArrowLeftIcon />Back to Itineraries
        </button>
      </div>

    </div>
  );
}
