"use client";

import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import StatCard from "@/components/dashboard/StatCard";
import ContentTabs from "@/components/dashboard/ContentTabs";

function MountainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 20 9 8 15 14 20 6 21 20 3 20" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useAuth();
  const { items } = useDashboard();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Explorer";

  const blogCount = items.filter((i) => i.type === "blog").length;
  const itinCount = items.filter((i) => i.type === "itinerary").length;
  const totalViews = items.reduce((sum, i) => sum + (i.viewCount ?? 0), 0);

  const STATS = [
    { label: "Treks logged", value: blogCount, trend: null, trendUp: null, icon: <MountainIcon /> },
    { label: "Itineraries",  value: itinCount,  trend: null, trendUp: null, icon: <MapIcon />      },
    { label: "Followers",    value: 0,           trend: null, trendUp: null, icon: <UsersIcon />    },
    { label: "Total views",  value: totalViews,  trend: null, trendUp: null, icon: <EyeIcon />      },
  ];

  return (
    <>
      <div className="dashboard-header">
        {status === "loading" ? (
          <span className="skeleton-line dashboard-greeting-skeleton" aria-hidden="true" />
        ) : (
          <h1 className="dashboard-greeting">Welcome back, {firstName}</h1>
        )}
        <p className="dashboard-subtext">Here&rsquo;s what&rsquo;s happening with your content.</p>
      </div>

      <div className="stat-grid">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <h2 className="content-section-title">Your content</h2>
        </div>
        <ContentTabs />
      </div>
    </>
  );
}
