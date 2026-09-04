"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard";
import { useAuth } from "@/context/AuthContext";
import { ADMIN } from "@/lib/api/endpoints";

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconExplore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconPosts() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconItineraries() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconSaved() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFollowing() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMessages() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconApprove() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

const MAIN_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: <IconDashboard />, badge: null },
  { label: "Explore", href: "/explore", icon: <IconExplore />, badge: null },
  { label: "My Posts", href: "/posts", icon: <IconPosts />, badge: 0 },
  { label: "Itineraries", href: "/itineraries", icon: <IconItineraries />, badge: null },
  { label: "Saved", href: "/saved", icon: <IconSaved />, badge: 0 },
];

const COMMUNITY_LINKS = [
  { label: "Following", href: "/following", icon: <IconFollowing />, badge: null },
  { label: "Messages", href: "/messages", icon: <IconMessages />, badge: null },
];

interface PendingCounts { blogs: number; itineraries: number; videos: number; total: number; }

export default function Sidebar() {
  const pathname = usePathname();
  const { data, accessToken } = useAuth();
  const isAdmin = data?.user?.role === "admin";
  const [counts, setCounts] = useState<PendingCounts>({ blogs: 0, itineraries: 0, videos: 0, total: 0 });

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    fetch(ADMIN.COUNTS, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setCounts(res.data); })
      .catch(() => {});
  }, [isAdmin, accessToken]);

  function NavItem({
    href,
    icon,
    label,
    badge,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge: number | null;
  }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`sidebar-nav-item${isActive ? " sidebar-nav-item--active" : ""}`}
        aria-current={isActive ? "page" : undefined}
      >
        {icon}
        <span className="sidebar-nav-label">{label}</span>
        {badge !== null && (
          <span className="sidebar-nav-badge">{badge}</span>
        )}
      </Link>
    );
  }

  return (
    <aside className="sidebar" aria-label="Dashboard navigation">
      <p className="sidebar-section-label">Main</p>
      {MAIN_LINKS.map((link) => (
        <NavItem key={link.href} {...link} />
      ))}

      <p className="sidebar-section-label" style={{ marginTop: "1.5rem" }}>Community</p>
      {COMMUNITY_LINKS.map((link) => (
        <NavItem key={link.href} {...link} />
      ))}

      {isAdmin && (
        <>
          <p className="sidebar-section-label" style={{ marginTop: "1.5rem" }}>Approvals</p>
          <NavItem href="/admin/blogs" icon={<IconApprove />} label="Blogs" badge={counts.blogs || null} />
          <NavItem href="/admin/itineraries" icon={<IconApprove />} label="Itineraries" badge={counts.itineraries || null} />
          <NavItem href="/admin/videos" icon={<IconApprove />} label="Videos" badge={counts.videos || null} />
        </>
      )}

      <div className="sidebar-spacer" />
      <ProfileCard />
    </aside>
  );
}
