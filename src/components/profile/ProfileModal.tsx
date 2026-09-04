"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AUTH } from "@/lib/api/endpoints";

interface Stats {
  posts: number;
  blogs: number;
  itineraries: number;
  videos: number;
  followers: number;
  following: number;
}

interface ProfileModalProps {
  onClose: () => void;
  onSignOut: () => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function ProfileModal({ onClose, onSignOut }: ProfileModalProps) {
  const { data: session, accessToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const name = user?.name ?? "Explorer";
  const email = user?.email ?? "";
  const username = user?.username ?? "";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!accessToken) return;
    fetch(AUTH.ME_STATS, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setStats(res.data); })
      .catch(() => {});
  }, [accessToken]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const STATS = [
    { label: "Posts",     value: stats?.posts     ?? "—" },
    { label: "Followers", value: stats?.followers  ?? "—" },
    { label: "Following", value: stats?.following  ?? "—" },
  ];

  return (
    <div className="profile-modal-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Profile">
      <div className="profile-modal">

        {/* Close */}
        <button className="profile-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Avatar */}
        <div className="profile-modal-avatar-wrap">
          <div className="profile-modal-avatar-ring">
            {user?.image ? (
              <img src={user.image} alt="" className="profile-modal-avatar-img" />
            ) : (
              <span className="profile-modal-avatar-initials">{initials}</span>
            )}
          </div>
        </div>

        {/* Name / username / email */}
        <div className="profile-modal-identity">
          <h2 className="profile-modal-name">{name}</h2>
          {username && <p className="profile-modal-username">@{username}</p>}
          <p className="profile-modal-email">{email}</p>
        </div>

        {/* Stats */}
        <div className="profile-modal-stats">
          {STATS.map(({ label, value }) => (
            <div className="profile-modal-stat" key={label}>
              <span className="profile-modal-stat-value">
                {typeof value === "number" ? formatCount(value) : value}
              </span>
              <span className="profile-modal-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        {stats && (
          <div className="profile-modal-breakdown">
            <span className="profile-modal-breakdown-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {stats.blogs} blog{stats.blogs !== 1 ? "s" : ""}
            </span>
            <span className="profile-modal-breakdown-dot" aria-hidden="true">·</span>
            <span className="profile-modal-breakdown-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
              {stats.itineraries} {stats.itineraries === 1 ? "itinerary" : "itineraries"}
            </span>
            <span className="profile-modal-breakdown-dot" aria-hidden="true">·</span>
            <span className="profile-modal-breakdown-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              {stats.videos} video{stats.videos !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="profile-modal-actions">
          <button
            className="profile-modal-signout"
            onClick={() => { onClose(); onSignOut(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
