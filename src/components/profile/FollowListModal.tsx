"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FOLLOW } from "@/lib/api/endpoints";
import type { FollowPerson } from "@/types/content";
import FollowButton from "./FollowButton";

interface FollowListModalProps {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
}

function avatarInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function FollowListModal({ userId, mode, onClose }: FollowListModalProps) {
  const { accessToken } = useAuth();
  const [people, setPeople] = useState<FollowPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const url = mode === "followers" ? FOLLOW.FOLLOWERS(userId) : FOLLOW.FOLLOWING(userId);
        const res = await fetch(url, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("failed");
        const result = await res.json();
        if (!cancelled) setPeople((result.data as FollowPerson[]) ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, mode, accessToken]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = mode === "followers" ? "Followers" : "Following";

  return (
    <div
      className="follow-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="follow-modal-title"
      onClick={onClose}
    >
      <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h2 className="follow-modal-title" id="follow-modal-title">{title}</h2>
          <button type="button" className="follow-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="follow-modal-body">
          {loading ? (
            <p className="follow-modal-state">Loading…</p>
          ) : error ? (
            <p className="follow-modal-state">Couldn&apos;t load {title.toLowerCase()}.</p>
          ) : people.length === 0 ? (
            <p className="follow-modal-state">
              {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            <ul className="follow-list">
              {people.map((p) => (
                <li key={p.id} className="follow-list-row">
                  <Link href={`/profile/${p.id}`} className="follow-list-person" onClick={onClose}>
                    <span className="follow-list-avatar" aria-hidden="true">{avatarInitials(p.name)}</span>
                    <span className="follow-list-names">
                      <span className="follow-list-name">{p.name}</span>
                      <span className="follow-list-username">@{p.username}</span>
                    </span>
                  </Link>
                  {!p.isSelf && (
                    <FollowButton userId={p.id} initialIsFollowing={p.isFollowing} size="sm" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
