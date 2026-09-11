"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LIKE } from "@/lib/api/endpoints";

interface LikeButtonProps {
  postId: string;
  /** Like state if already known (skips the status fetch, e.g. in feeds). */
  initialLiked?: boolean;
  /** Like count if already known. */
  initialCount?: number;
  size?: "sm" | "md";
  onChange?: (liked: boolean) => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  size = "md",
  onChange,
}: LikeButtonProps) {
  const { accessToken, status } = useAuth();

  const [liked, setLiked] = useState<boolean>(initialLiked ?? false);
  const [count, setCount] = useState<number>(initialCount ?? 0);
  const [ready, setReady] = useState<boolean>(initialLiked !== undefined && initialCount !== undefined);
  const [pending, setPending] = useState(false);

  // Resolve current like state/count when not provided by the parent.
  useEffect(() => {
    if (initialLiked !== undefined && initialCount !== undefined) {
      setLiked(initialLiked);
      setCount(initialCount);
      setReady(true);
      return;
    }
    if (!accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(LIKE.STATUS(postId), {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        if (!cancelled && res.ok) {
          setLiked(Boolean(result.data?.likedByMe));
          setCount(Number(result.data?.likeCount ?? 0));
        }
      } catch {
        /* leave defaults */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [postId, accessToken, initialLiked, initialCount]);

  if (status !== "authenticated") return null;

  async function toggle() {
    if (pending || !accessToken) return;
    const next = !liked;

    // Optimistic update
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    onChange?.(next);

    try {
      const res = await fetch(LIKE.LIKE(postId), {
        method: next ? "POST" : "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("request failed");
    } catch {
      // Roll back on failure
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
      onChange?.(!next);
    } finally {
      setPending(false);
    }
  }

  const className = [
    "like-btn",
    liked ? "like-btn--active" : "",
    size === "sm" ? "like-btn--sm" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(); }}
      disabled={pending || !ready}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <HeartIcon filled={liked} />
      <span className="like-btn-count">{count}</span>
    </button>
  );
}
