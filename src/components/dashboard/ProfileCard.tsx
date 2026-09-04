"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function ChevronUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function ProfileCard() {
  const { data: session, status, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status === "loading") {
    return (
      <div className="sidebar-profile-card sidebar-profile-card--skeleton" aria-hidden="true">
        <span className="skeleton-line" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="skeleton-line" style={{ width: "70%", height: 12 }} />
          <span className="skeleton-line" style={{ width: "90%", height: 10 }} />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const name = session.user.name ?? "Explorer";
  const email = session.user.email ?? "";
  const image = session.user.image;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sidebar-profile-wrap" ref={cardRef}>
      {open && (
        <div className="sidebar-profile-dropdown" role="menu">
          <Link
            href="/profile"
            className="sidebar-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            View profile
          </Link>
          <Link
            href="/settings"
            className="sidebar-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            className="sidebar-dropdown-item sidebar-dropdown-item--danger"
            role="menuitem"
            onClick={() => signOut()}
          >
            Log out
          </button>
        </div>
      )}

      <button
        type="button"
        className="sidebar-profile-card"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Profile menu"
      >
        {image ? (
          <img src={image} alt="" className="sidebar-avatar" />
        ) : (
          <span className="sidebar-avatar sidebar-avatar--initials">{initials}</span>
        )}
        <div className="sidebar-profile-info">
          <p className="sidebar-profile-name">{name}</p>
          <p className="sidebar-profile-email">{email}</p>
        </div>
        <span className={`sidebar-profile-chevron${open ? " sidebar-profile-chevron--open" : ""}`}>
          <ChevronUpIcon />
        </span>
      </button>
    </div>
  );
}
