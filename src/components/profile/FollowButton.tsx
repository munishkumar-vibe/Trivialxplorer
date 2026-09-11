"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FOLLOW } from "@/lib/api/endpoints";

interface FollowButtonProps {
  userId: string;
  /** Follow state if already known (skips the status fetch). */
  initialIsFollowing?: boolean;
  /** "sm" for compact inline placement (e.g. list rows / bylines). */
  size?: "sm" | "md";
  /** Notifies parent so counts can update optimistically. */
  onChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  initialIsFollowing,
  size = "md",
  onChange,
}: FollowButtonProps) {
  const { data, accessToken, status } = useAuth();
  const isSelf = data?.user.id === userId;

  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing ?? false);
  const [ready, setReady] = useState<boolean>(initialIsFollowing !== undefined);
  const [pending, setPending] = useState(false);

  // Resolve current follow state when not provided by the parent.
  useEffect(() => {
    if (initialIsFollowing !== undefined) { setIsFollowing(initialIsFollowing); setReady(true); return; }
    if (isSelf || !accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(FOLLOW.STATUS(userId), {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        if (!cancelled && res.ok) setIsFollowing(Boolean(result.data?.isFollowing));
      } catch {
        /* leave default */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, accessToken, initialIsFollowing, isSelf]);

  // Never render for your own profile or before auth resolves.
  if (isSelf || status !== "authenticated") return null;

  async function toggle() {
    if (pending || !accessToken) return;
    const next = !isFollowing;

    // Optimistic update
    setIsFollowing(next);
    setPending(true);
    onChange?.(next);

    try {
      const res = await fetch(FOLLOW.FOLLOW(userId), {
        method: next ? "POST" : "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("request failed");
    } catch {
      // Roll back on failure
      setIsFollowing(!next);
      onChange?.(!next);
    } finally {
      setPending(false);
    }
  }

  const className = [
    isFollowing ? "btn-ghost" : "btn-primary",
    "follow-btn",
    size === "sm" ? "follow-btn--sm" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(); }}
      disabled={pending || !ready}
      aria-pressed={isFollowing}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
