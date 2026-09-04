import type { ContentStatus } from "@/types/creator";

const LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  processing: "Processing",
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`} aria-label={`Status: ${LABELS[status]}`}>
      {status === "processing" && <span className="status-badge-pulse" aria-hidden="true" />}
      {LABELS[status]}
    </span>
  );
}
