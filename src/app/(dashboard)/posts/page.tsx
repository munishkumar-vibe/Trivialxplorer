"use client";

import { useDashboard } from "@/context/DashboardContext";
import PostGrid from "@/components/posts/PostGrid";

export default function PostsPage() {
  const { openForm } = useDashboard();

  return (
    <>
      <div className="dashboard-header dashboard-header--creator">
        <div className="dashboard-header-text">
          <h1 className="dashboard-greeting">My Posts</h1>
          <p className="dashboard-subtext">Your published stories and drafts.</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => openForm("blog")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Post
          </button>
        </div>
      </div>

      <div className="content-section">
        <PostGrid />
      </div>
    </>
  );
}
