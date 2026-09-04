"use client";

interface UnderReviewModalProps {
  type: "blog" | "itinerary" | "video";
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  blog:      "blog post",
  itinerary: "itinerary",
  video:     "video",
};

export default function UnderReviewModal({ type, onClose }: UnderReviewModalProps) {
  const label = TYPE_LABEL[type] ?? type;

  return (
    <div className="review-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div className="review-modal">
        <div className="review-modal-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h2 className="review-modal-title" id="review-modal-title">
          Your {label} is under review
        </h2>

        <p className="review-modal-body">
          Thanks for submitting! Our team will review your {label} and publish it once approved.
          You can track the status in your dashboard.
        </p>

        <button type="button" className="btn-primary review-modal-btn" onClick={onClose}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
