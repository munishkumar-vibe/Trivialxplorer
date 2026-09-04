"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/context/DashboardContext";
import type { ContentType } from "@/types/creator";

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}

const MENU_OPTIONS: { type: ContentType; label: string; icon: React.ReactNode }[] = [
  { type: "blog", label: "New Blog Post", icon: <DocIcon /> },
  { type: "video", label: "New Video", icon: <PlayIcon /> },
  { type: "itinerary", label: "New Itinerary", icon: <MapPinIcon /> },
];

// Desktop/tablet popover
function CreatePopover({ onSelect, onClose }: { onSelect: (t: ContentType) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="create-popover" role="menu" aria-label="Create content">
      {MENU_OPTIONS.map(({ type, label, icon }) => (
        <button
          key={type}
          type="button"
          className="create-popover-item"
          role="menuitem"
          onClick={() => { onSelect(type); onClose(); }}
        >
          <span className="create-popover-icon">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// Mobile bottom sheet
function CreateBottomSheet({ isOpen, onSelect, onClose }: { isOpen: boolean; onSelect: (t: ContentType) => void; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`bottom-sheet-backdrop${isOpen ? " bottom-sheet-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`bottom-sheet${isOpen ? " bottom-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Create content"
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <h2 className="bottom-sheet-title">Create</h2>
        <div className="bottom-sheet-options">
          {MENU_OPTIONS.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              className="bottom-sheet-option"
              onClick={() => { onSelect(type); onClose(); }}
            >
              <span className="bottom-sheet-option-icon">{icon}</span>
              <span className="bottom-sheet-option-label">{label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

interface CreateButtonProps {
  variant?: "navbar" | "fab" | "bottom-nav";
}

export default function CreateButton({ variant = "navbar" }: CreateButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openForm } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((type: ContentType) => {
    openForm(type);
    setIsMenuOpen(false);
  }, [openForm]);

  const toggle = useCallback(() => setIsMenuOpen((o) => !o), []);
  const close = useCallback(() => setIsMenuOpen(false), []);

  if (variant === "fab") {
    return (
      <>
        <button
          type="button"
          className="create-fab"
          onClick={toggle}
          aria-label="Create content"
          aria-expanded={isMenuOpen}
        >
          <PlusIcon />
        </button>
        <CreateBottomSheet isOpen={isMenuOpen} onSelect={handleSelect} onClose={close} />
      </>
    );
  }

  if (variant === "bottom-nav") {
    return (
      <>
        <button
          type="button"
          className="bottom-nav-create-btn"
          onClick={toggle}
          aria-label="Create content"
          aria-expanded={isMenuOpen}
        >
          <PlusIcon />
        </button>
        <CreateBottomSheet isOpen={isMenuOpen} onSelect={handleSelect} onClose={close} />
      </>
    );
  }

  // Default: navbar variant (desktop/tablet — hidden on mobile via CSS)
  return (
    <div className="create-btn-wrap" ref={containerRef}>
      <button
        type="button"
        className="create-navbar-btn"
        onClick={toggle}
        aria-label="Create content"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <PlusIcon />
        <span>Create</span>
      </button>
      {isMenuOpen && (
        <CreatePopover onSelect={handleSelect} onClose={close} />
      )}
      {/* Mobile bottom sheet for the navbar button touch */}
      <CreateBottomSheet isOpen={isMenuOpen} onSelect={handleSelect} onClose={close} />
    </div>
  );
}
