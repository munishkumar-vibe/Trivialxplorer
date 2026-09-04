"use client";

import { useDashboard } from "@/context/DashboardContext";
import ItineraryGrid from "@/components/itineraries/ItineraryGrid";

export default function ItinerariesPage() {
  const { openForm } = useDashboard();

  return (
    <>
      <div className="dashboard-header dashboard-header--creator">
        <div className="dashboard-header-text">
          <h1 className="dashboard-greeting">Itineraries</h1>
          <p className="dashboard-subtext">Your published and draft trek routes.</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => openForm("itinerary")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Itinerary
          </button>
        </div>
      </div>

      <div className="content-section">
        <ItineraryGrid />
      </div>
    </>
  );
}
