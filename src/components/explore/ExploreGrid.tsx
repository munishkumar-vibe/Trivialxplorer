"use client";

import { useState, useMemo, useEffect } from "react";
import ExploreCard from "./ExploreCard";
import { useAuth } from "@/context/AuthContext";
import { EXPLORE } from "@/lib/api/endpoints";
import type { ExploreContentType, ExploreItem } from "@/types/content";

type Filter = "all" | ExploreContentType;

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function mapApiItem(raw: Record<string, unknown>): ExploreItem {
  const type = raw._type as "blog" | "itinerary";
  const authorObj = raw.author as { _id?: string; username?: string } | null;
  const authorName = authorObj?.username ?? "Anonymous";

  const coverUrl =
    type === "blog"
      ? (raw.imageUrl as string | undefined)
      : (raw.coverImageUrl as string | undefined);

  const wordCount = (raw.wordCount as number) ?? 0;
  const meta =
    type === "blog"
      ? `${Math.max(1, Math.ceil(wordCount / 200))} min read`
      : `${raw.totalDays ?? 0} days · ${raw.difficulty ?? "Moderate"}`;

  return {
    id:          raw._id as string,
    type,
    title:       raw.title as string,
    description: raw.description as string,
    coverUrl,
    author:      { id: authorObj?._id, name: authorName, initials: initials(authorName) },
    meta,
    viewCount:   (raw.viewCount as number) ?? 0,
    savedByMe:   false,
    createdAt:   raw.createdAt as string,
  };
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="explore-card explore-card--skeleton" aria-hidden="true">
      <div className="explore-card-thumb skeleton-block" />
      <div className="explore-card-body">
        <div className="skeleton-block explore-skeleton-title" />
        <div className="skeleton-block explore-skeleton-title explore-skeleton-title--short" />
        <div className="skeleton-block explore-skeleton-desc" />
        <div className="skeleton-block explore-skeleton-footer" />
      </div>
    </div>
  );
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div className="explore-empty">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
          <circle cx="36" cy="36" r="22" stroke="var(--color-border)" strokeWidth="2" />
          <line x1="52" y1="52" x2="68" y2="68" stroke="var(--color-border)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="36" x2="42" y2="36" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="30" x2="36" y2="42" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">{isSearch ? "No results found" : "Nothing here yet"}</h2>
      <p className="empty-state-body">
        {isSearch
          ? "Try a different keyword or filter to discover more content."
          : "Be the first to publish a trek story or itinerary."}
      </p>
    </div>
  );
}

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All",          value: "all" },
  { label: "Blogs",        value: "blog" },
  { label: "Itineraries",  value: "itinerary" },
];

export default function ExploreGrid() {
  const { accessToken, status } = useAuth();
  const [allItems,  setAllItems]  = useState<ExploreItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [query,     setQuery]     = useState("");
  const [filter,    setFilter]    = useState<Filter>("all");
  const [saved,     setSaved]     = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (status === "loading") return;
    if (!accessToken) { setLoading(false); return; }

    async function fetchExplore() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(EXPLORE.LIST, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (!res.ok) throw new Error("fetch failed");
        const result = await res.json();
        setAllItems((result.data as Record<string, unknown>[]).map(mapApiItem));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchExplore();
  }, [status, accessToken]);

  const typeCounts = useMemo(() => ({
    all:       allItems.length,
    blog:      allItems.filter((i) => i.type === "blog").length,
    itinerary: allItems.filter((i) => i.type === "itinerary").length,
  }), [allItems]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesType  = filter === "all" || item.type === filter;
      const matchesQuery = !q
        || item.title.toLowerCase().includes(q)
        || item.description.toLowerCase().includes(q)
        || item.author.name.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [allItems, query, filter]);

  function toggleBookmark(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="explore-container">

      {/* ── Global community banner ─────────────────── */}
      <div className="explore-global-banner">
        <span className="explore-global-icon"><GlobeIcon /></span>
        <div>
          <p className="explore-global-title">Global Community Feed</p>
          <p className="explore-global-body">
            Discover trek stories and route itineraries published by explorers from around the world — curated, real, and always growing.
          </p>
        </div>
      </div>

      {/* ── Search + filters ────────────────────────── */}
      <div className="explore-controls">
        <div className="explore-search-wrap">
          <span className="explore-search-icon"><SearchIcon /></span>
          <input
            type="search"
            className="explore-search-input"
            placeholder="Search trails, authors, topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search content"
          />
        </div>

        <div className="explore-filters" role="tablist" aria-label="Filter by content type">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={`explore-filter-btn${filter === f.value ? " explore-filter-btn--active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {!query && !loading && (
                <span className="explore-filter-count">{typeCounts[f.value as keyof typeof typeCounts] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      {loading ? (
        <div className="explore-grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="explore-empty">
          <h2 className="empty-state-title">Failed to load</h2>
          <p className="empty-state-body">Could not reach the server. Please refresh and try again.</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState isSearch={query.trim().length > 0 || filter !== "all"} />
      ) : (
        <div className="explore-grid" role="list" aria-label="Explore content">
          {items.map((item, idx) => (
            <div key={item.id} role="listitem" className={idx === 0 ? "explore-grid-hero" : ""}>
              <ExploreCard
                {...item}
                isHero={idx === 0}
                savedByMe={saved.has(item.id)}
                onBookmarkToggle={toggleBookmark}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
