"use client";

interface StickySubmitBarProps {
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  loadingLabel?: string;
}

function SpinnerIcon() {
  return (
    <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export default function StickySubmitBar({
  label = "Publish",
  isLoading = false,
  disabled = false,
  onClick,
  loadingLabel = "Publishing…",
}: StickySubmitBarProps) {
  return (
    <div className="sticky-submit-bar">
      <button
        type="submit"
        className="btn-primary sticky-submit-btn"
        disabled={disabled || isLoading}
        onClick={onClick}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            {loadingLabel}
          </>
        ) : label}
      </button>
    </div>
  );
}
