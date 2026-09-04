"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateButton from "@/components/creator/CreateButton";

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function ExploreIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}
function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function UserIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: <HomeIcon />, label: "Home" },
  { href: "/explore", icon: <ExploreIcon />, label: "Explore" },
  // "Create" slot rendered as CreateButton below
  { href: "/notifications", icon: <BellIcon />, label: "Alerts" },
  { href: "/profile", icon: <UserIcon />, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {/* First two items */}
      {NAV_ITEMS.slice(0, 2).map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            {icon}
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}

      {/* Center Create button */}
      <div className="bottom-nav-create-wrap">
        <CreateButton variant="bottom-nav" />
      </div>

      {/* Last two items */}
      {NAV_ITEMS.slice(2).map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            {icon}
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
