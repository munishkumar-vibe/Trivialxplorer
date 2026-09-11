"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExploreItem } from "@/types/content";
import LikeButton from "@/components/like/LikeButton";

function BlogIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const TYPE_LABELS = { blog: "Blog", itinerary: "Itinerary" } as const;
const TYPE_ICONS  = { blog: <BlogIcon />, itinerary: <MapIcon /> };

interface ExploreCardProps extends ExploreItem {
  onBookmarkToggle: (id: string) => void;
  isHero?: boolean;
  /** Pre-fetched like state (batched by the grid) so cards skip per-card fetches. */
  initialLiked?: boolean;
  initialLikeCount?: number;
}

export default function ExploreCard({
  id, type, title, description, coverUrl, author, meta,
  savedByMe, onBookmarkToggle, isHero, initialLiked, initialLikeCount,
}: ExploreCardProps) {
  const router = useRouter();

  function navigate() {
    const path = type === "blog" ? `/posts/${id}` : `/itineraries/${id}`;
    router.push(path);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(); }
  }

  const authorBlock = (heroVariant: boolean) => {
    const inner = (
      <>
        <span className={`explore-card-avatar${heroVariant ? " explore-card-avatar--hero" : ""}`} aria-hidden="true">{author.initials}</span>
        <span className="explore-card-author-name">@{author.name}</span>
      </>
    );
    return author.id ? (
      <Link
        href={`/profile/${author.id}`}
        className="explore-card-author explore-card-author--link"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    ) : (
      <div className="explore-card-author">{inner}</div>
    );
  };

  const thumb = (heroVariant: boolean) => (
    <div className={`explore-card-thumb${heroVariant ? " explore-card-thumb--hero" : ""}`}>
      {coverUrl ? (
        <img src={coverUrl} alt="" className="explore-card-img" />
      ) : (
        <div className="explore-card-thumb-placeholder" aria-hidden="true">
          {TYPE_ICONS[type]}
        </div>
      )}

      <span className={`explore-card-type-badge${heroVariant ? " explore-card-type-badge--hero" : ""}`}>
        {TYPE_ICONS[type]}
        {TYPE_LABELS[type]}
      </span>

      <button
        type="button"
        className={`explore-card-bookmark-btn${savedByMe ? " explore-card-bookmark-btn--saved" : ""}`}
        onClick={(e) => { e.stopPropagation(); onBookmarkToggle(id); }}
        aria-label={savedByMe ? "Remove from saved" : "Save for later"}
        aria-pressed={savedByMe}
      >
        <BookmarkIcon filled={savedByMe} />
      </button>
    </div>
  );

  if (isHero) {
    return (
      <article
        className="explore-card explore-card--hero"
        tabIndex={0}
        role="button"
        aria-label={`${TYPE_LABELS[type]}: ${title}`}
        onClick={navigate}
        onKeyDown={handleKey}
      >
        {thumb(true)}

        <div className="explore-card-body explore-card-body--hero">
          <div className="explore-card-hero-meta">{meta}</div>
          <h3 className="explore-card-title explore-card-title--hero">{title}</h3>
          <p className="explore-card-description explore-card-description--hero">{description}</p>

          <div className="explore-card-footer">
            {authorBlock(true)}
            {type === "blog" && (
              <LikeButton postId={id} size="sm" initialLiked={initialLiked} initialCount={initialLikeCount} />
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="explore-card"
      tabIndex={0}
      role="button"
      aria-label={`${TYPE_LABELS[type]}: ${title}`}
      onClick={navigate}
      onKeyDown={handleKey}
    >
      {thumb(false)}

      <div className="explore-card-body">
        <h3 className="explore-card-title">{title}</h3>
        <p className="explore-card-description">{description}</p>

        <div className="explore-card-footer">
          {authorBlock(false)}
          <div className="explore-card-stats">
            <span className="explore-card-meta">{meta}</span>
            {type === "blog" && (
              <LikeButton postId={id} size="sm" initialLiked={initialLiked} initialCount={initialLikeCount} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
