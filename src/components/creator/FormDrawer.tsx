"use client";

import { useEffect, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import BlogPostForm from "./forms/BlogPostForm";
import VideoUploadForm from "./forms/VideoUploadForm";
import ItineraryForm from "./forms/ItineraryForm";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function FormDrawer() {
  const { activeForm, editingPost, closeForm } = useDashboard();
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = !!activeForm;

  const isEditing = activeForm === "blog" && !!editingPost;

  const title = isEditing
    ? "Edit Blog Post"
    : activeForm === "blog" ? "New Blog Post"
    : activeForm === "video" ? "Upload Video"
    : activeForm === "itinerary" ? "New Itinerary"
    : "";

  const subtitle = isEditing
    ? "Update your story"
    : activeForm === "blog" ? "Share your trek story with the community"
    : undefined;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeForm]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen, activeForm]);

  if (!activeForm) return null;

  return (
    <>
      <div
        className={`drawer-backdrop${isOpen ? " drawer-backdrop--visible" : ""}`}
        onClick={closeForm}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`drawer-panel${isOpen ? " drawer-panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`drawer-header${subtitle ? " drawer-header--with-subtitle" : ""}`}>
          <div className="drawer-header-text">
            <h2 className="drawer-title">{title}</h2>
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeForm}
            aria-label="Close form"
          >
            <CloseIcon />
          </button>
        </div>
        {activeForm === "blog" && <div className="drawer-header-accent" aria-hidden="true" />}

        <div className="drawer-body">
          {activeForm === "blog" && <BlogPostForm editPost={editingPost ?? undefined} />}
          {activeForm === "video" && <VideoUploadForm />}
          {activeForm === "itinerary" && <ItineraryForm />}
        </div>
      </div>
    </>
  );
}
