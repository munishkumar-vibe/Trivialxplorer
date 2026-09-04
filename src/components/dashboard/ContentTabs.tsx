"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

/* ── helpers ─────────────────────────────────── */

function formatCount(n?: number): string {
  if (n === undefined) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="cs-card cs-card--skeleton">
          <div className="cs-thumb cs-thumb--32 skeleton-block" />
          <div className="cs-card-body">
            <div className="skeleton-block" style={{ height: 12, width: "60%", marginBottom: 8, borderRadius: 4 }} />
            <div className="skeleton-block" style={{ height: 14, width: "85%", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyCards({ label }: { label: string }) {
  return (
    <div className="cs-empty-state">
      <p className="cs-empty-label">{label}</p>
    </div>
  );
}

/* ── icons ───────────────────────────────────── */

function BlogSectionIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function ItinSectionIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function VideoSectionIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
}
function SavedSectionIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function EyeIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function ArrowRightIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

/* ── Section wrapper ─────────────────────────── */

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  href: string;
  children: React.ReactNode;
}

function Section({ icon, title, description, count, href, children }: SectionProps) {
  return (
    <div className="cs-section">
      <div className="cs-section-header">
        <div className="cs-section-icon">{icon}</div>
        <div className="cs-section-meta">
          <div className="cs-section-title-row">
            <h3 className="cs-section-title">{title}</h3>
            <span className="cs-section-count">{count}</span>
          </div>
          <p className="cs-section-desc">{description}</p>
        </div>
        <Link href={href} className="cs-view-all">
          View all <ArrowRightIcon />
        </Link>
      </div>

      <div className="cs-scroll-row">
        {children}
      </div>
    </div>
  );
}

/* ── Blog cards ──────────────────────────────── */

function BlogsSection() {
  const router = useRouter();
  const { items, isLoadingContent } = useDashboard();
  const posts = items.filter((i) => i.type === "blog");

  return (
    <Section
      icon={<BlogSectionIcon />}
      title="Blogs"
      description="Trek journals, gear guides, and high-altitude wisdom — share what you know with the mountain community."
      count={posts.length}
      href="/posts"
    >
      {isLoadingContent ? (
        <SkeletonCards />
      ) : posts.length === 0 ? (
        <EmptyCards label="No blog posts yet" />
      ) : (
        posts.slice(0, 3).map((p) => (
          <article
            key={p.id}
            className="cs-card"
            tabIndex={0}
            role="button"
            aria-label={`Open blog post: ${p.title}`}
            onClick={() => router.push(`/posts/${p.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/posts/${p.id}`); } }}
          >
            <div className="cs-thumb cs-thumb--169">
              {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill className="cs-thumb-img" sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw" />}
              <span className={`cs-status-pill cs-status-pill--${p.status}`}>
                {p.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <div className="cs-card-body">
              <h4 className="cs-card-title">{p.title}</h4>
              <div className="cs-card-meta">
                {p.viewCount !== undefined && (
                  <span className="cs-meta-item cs-meta-right"><EyeIcon /> {formatCount(p.viewCount)}</span>
                )}
              </div>
            </div>
          </article>
        ))
      )}
    </Section>
  );
}

/* ── Itinerary cards ─────────────────────────── */

function ItinerariesSection() {
  const router = useRouter();
  const { items, isLoadingContent } = useDashboard();
  const itins = items.filter((i) => i.type === "itinerary");

  return (
    <Section
      icon={<ItinSectionIcon />}
      title="Itineraries"
      description="Day-by-day route plans with elevation, distances and camp notes — help others walk the same trails with confidence."
      count={itins.length}
      href="/itineraries"
    >
      {isLoadingContent ? (
        <SkeletonCards />
      ) : itins.length === 0 ? (
        <EmptyCards label="No itineraries yet" />
      ) : (
        itins.slice(0, 3).map((it) => (
          <article
            key={it.id}
            className="cs-card"
            tabIndex={0}
            role="button"
            aria-label={`Open itinerary: ${it.title}`}
            onClick={() => router.push(`/itineraries/${it.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/itineraries/${it.id}`); } }}
          >
            <div className="cs-thumb cs-thumb--32">
              {it.thumbnailUrl && <Image src={it.thumbnailUrl} alt="" fill className="cs-thumb-img" sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw" />}
              <div className="cs-thumb-gradient" />
              <span className={`cs-status-pill cs-status-pill--${it.status}`}>
                {it.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <div className="cs-card-body">
              <h4 className="cs-card-title">{it.title}</h4>
              <div className="cs-card-meta">
                <span className="cs-meta-item">{new Date(it.createdAt).toLocaleDateString()}</span>
                {it.viewCount !== undefined && (
                  <span className="cs-meta-item cs-meta-right"><EyeIcon /> {formatCount(it.viewCount)}</span>
                )}
              </div>
            </div>
          </article>
        ))
      )}
    </Section>
  );
}

/* ── Video cards ─────────────────────────────── */

function VideosSection() {
  return (
    <Section
      icon={<VideoSectionIcon />}
      title="Videos"
      description="Films, time-lapses, and trail documentaries — put the viewer on the mountain without leaving their seat."
      count={0}
      href="/explore"
    >
      <EmptyCards label="No videos yet" />
    </Section>
  );
}

/* ── Saved cards ─────────────────────────────── */

function SavedSection() {
  return (
    <Section
      icon={<SavedSectionIcon />}
      title="Saved"
      description="Content you've bookmarked from the community — routes, stories, and films worth revisiting."
      count={0}
      href="/saved"
    >
      <EmptyCards label="Nothing saved yet" />
    </Section>
  );
}

/* ── Main export ─────────────────────────────── */

export default function ContentTabs() {
  return (
    <div className="cs-root">
      <BlogsSection />
      <ItinerariesSection />
      <VideosSection />
      <SavedSection />
    </div>
  );
}
