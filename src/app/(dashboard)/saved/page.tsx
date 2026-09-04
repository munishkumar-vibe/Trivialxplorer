"use client";

import SavedGrid from "@/components/saved/SavedGrid";

export default function SavedPage() {
  return (
    <>
      <div className="dashboard-header">
        <div className="saved-page-heading">
          <h1 className="dashboard-greeting">Saved</h1>
        </div>
        <p className="dashboard-subtext">Content you&rsquo;ve bookmarked from the community.</p>
      </div>

      <div className="content-section">
        <SavedGrid />
      </div>
    </>
  );
}
