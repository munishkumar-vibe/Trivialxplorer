function TrendUpIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  trend: string | null;
  trendUp?: boolean | null;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, trend, trendUp, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-icon" aria-hidden="true">{icon}</span>
        <p className="stat-label">{label}</p>
      </div>
      <p className="stat-value">{value.toLocaleString()}</p>
      {trend && (
        <p className={`stat-trend${trendUp === true ? " stat-trend--up" : ""}`}>
          {trendUp === true && <TrendUpIcon />}
          {trend}
        </p>
      )}
    </div>
  );
}
