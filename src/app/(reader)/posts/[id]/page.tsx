"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import StatusBadge from "@/components/creator/shared/StatusBadge";
import FollowButton from "@/components/profile/FollowButton";
import { BLOG } from "@/lib/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import type { PostDetail } from "@/types/content";

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCount(n?: number): string {
  if (n === undefined || n === 0) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function mapApiPost(data: Record<string, unknown>): PostDetail {
  const wordCount = (data.wordCount as number) ?? 0;
  const authorObj = data.author as Record<string, unknown> | string | null;
  const authorName =
    typeof authorObj === "object" && authorObj !== null
      ? (authorObj.name as string) ?? "Unknown"
      : "Unknown";
  const authorId =
    typeof authorObj === "object" && authorObj !== null
      ? (authorObj._id as string) ?? undefined
      : undefined;

  const rawImageUrl = data.imageUrl as string | undefined;
  const coverUrl = rawImageUrl ?? undefined;

  return {
    id: (data._id as string) ?? "",
    title: data.title as string,
    description: data.description as string,
    content: data.content as string,
    coverUrl,
    readingTimeMin: Math.max(1, Math.ceil(wordCount / 200)),
    status: (data.status as "published" | "draft") ?? "published",
    createdAt: data.createdAt as string,
    viewCount: data.viewCount as number | undefined,
    author: authorName,
    authorId,
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchPost() {
      try {
        const res = await fetch(BLOG.GET(id as string), {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (!res.ok) throw new Error("not found");
        const result = await res.json();
        if (!cancelled) setPost(mapApiPost(result.data));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => { cancelled = true; };
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="blog-detail-not-found">
        <p className="blog-detail-not-found-body">Loading post…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-not-found">
        <h1 className="blog-detail-not-found-title">Post not found</h1>
        <p className="blog-detail-not-found-body">This post doesn&apos;t exist or may have been removed.</p>
        <Link href="/posts" className="btn-primary" style={{ display: "inline-flex", marginTop: "1rem" }}>
          <ArrowLeftIcon /> Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail blog-detail--fs">

      {/* ── Hero ──────────────────────────────────── */}
      <div className="blog-detail-hero">
        {post.coverUrl ? (
          <img src={post.coverUrl} alt="" className="blog-detail-hero-img" />
        ) : (
          <div className="blog-detail-hero-placeholder" />
        )}
        <div className="blog-detail-hero-overlay" />

        <div className="blog-detail-hero-content">
          <div className="blog-detail-hero-top">
            <button
              type="button"
              className="blog-back-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
              Back
            </button>
            <StatusBadge status={post.status} />
          </div>

          <h1 className="blog-detail-title">{post.title}</h1>

          <div className="blog-detail-byline">
            {post.author && (
              post.authorId ? (
                <Link href={`/profile/${post.authorId}`} className="blog-detail-byline-item blog-detail-byline-author">
                  <UserIcon />
                  {post.author}
                </Link>
              ) : (
                <span className="blog-detail-byline-item">
                  <UserIcon />
                  {post.author}
                </span>
              )
            )}
            {post.authorId && (
              <span className="blog-detail-byline-follow">
                <FollowButton userId={post.authorId} size="sm" />
              </span>
            )}
            <span className="blog-detail-byline-sep" aria-hidden="true">·</span>
            <span className="blog-detail-byline-item">{formatDate(post.createdAt)}</span>
            {post.viewCount !== undefined && (
              <>
                <span className="blog-detail-byline-sep" aria-hidden="true">·</span>
                <span className="blog-detail-byline-item">
                  <EyeIcon />
                  {formatCount(post.viewCount)} views
                </span>
              </>
            )}
            <span className="blog-detail-byline-sep" aria-hidden="true">·</span>
            <span className="blog-detail-byline-item">
              <ClockIcon />
              {post.readingTimeMin} min read
            </span>
          </div>
        </div>
      </div>

      {/* ── Article body ──────────────────────────── */}
      <div className="blog-detail-article">
        {post.description && (
          <p className="blog-detail-lead">{post.description}</p>
        )}
        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: ["p","br","strong","em","u","s","h2","h3","ul","ol","li","blockquote","a","img","code","pre"],
            ALLOWED_ATTR: ["href","src","alt","class","target","rel"],
            ALLOW_DATA_ATTR: false,
            FORCE_BODY: true,
          }) }}
        />
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="blog-detail-footer">
        <button
          type="button"
          className="btn-ghost blog-detail-back-footer"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon />
          Back to Posts
        </button>
      </div>

    </div>
  );
}
