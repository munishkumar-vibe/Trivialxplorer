"use client";

import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useAuth } from "@/context/AuthContext";
import { BLOG, ITINERARY, VIDEO } from "@/lib/api/endpoints";

export type ReviewContentType = "blog" | "itinerary" | "video";

interface ReviewModalProps {
  contentType: ReviewContentType;
  itemId: string;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

const DETAIL_URL: Record<ReviewContentType, (id: string) => string> = {
  blog:      BLOG.GET,
  itinerary: ITINERARY.GET,
  video:     VIDEO.GET,
};

const TYPE_LABEL: Record<ReviewContentType, string> = {
  blog:      "blog post",
  itinerary: "itinerary",
  video:     "video",
};

/* ── Content renderers ─────────────────────────────────────────── */

function BlogContent({ data }: { data: Record<string, unknown> }) {
  const cover = data.imageUrl as string | undefined;
  const content = (data.content as string) ?? "";
  return (
    <>
      {cover && <img src={cover} alt="" className="review-preview-cover" />}
      <h3 className="review-preview-title">{data.title as string}</h3>
      {data.description && <p className="review-preview-lead">{data.description as string}</p>}
      <div
        className="review-preview-richtext"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ["p","br","strong","em","u","s","h2","h3","ul","ol","li","blockquote","a","img","code","pre"],
            ALLOWED_ATTR: ["href","src","alt","class","target","rel"],
            ALLOW_DATA_ATTR: false,
            FORCE_BODY: true,
          }),
        }}
      />
    </>
  );
}

function ItineraryContent({ data }: { data: Record<string, unknown> }) {
  const cover = data.coverImageUrl as string | undefined;
  const days = (data.days as Record<string, unknown>[]) ?? [];
  return (
    <>
      {cover && <img src={cover} alt="" className="review-preview-cover" />}
      <h3 className="review-preview-title">{data.title as string}</h3>
      {data.description && <p className="review-preview-lead">{data.description as string}</p>}

      <div className="review-preview-days">
        {days.map((d, i) => {
          const images = (d.images as string[]) ?? [];
          const locations = (d.locations as Record<string, unknown>[]) ?? [];
          const location = (d.location as string) ?? (locations[0]?.name as string) ?? "";
          return (
            <div key={i} className="review-preview-day">
              <div className="review-preview-day-head">
                <span className="review-preview-day-badge">Day {d.dayNumber as number}</span>
                <span className="review-preview-day-title">{d.title as string}</span>
              </div>
              {location && <p className="review-preview-day-loc">{location}</p>}
              {images[0] && <img src={images[0]} alt="" className="review-preview-day-img" />}
              {d.description && <p className="review-preview-day-desc">{d.description as string}</p>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function VideoContent({ data }: { data: Record<string, unknown> }) {
  const videoUrl = data.videoUrl as string | undefined;
  const thumb = data.thumbnailUrl as string | undefined;
  return (
    <>
      {videoUrl && (
        <video className="review-preview-video" src={videoUrl} poster={thumb} controls preload="metadata" />
      )}
      <h3 className="review-preview-title">{data.title as string}</h3>
      {data.caption && <p className="review-preview-lead">{data.caption as string}</p>}
      {data.description && <p className="review-preview-desc">{data.description as string}</p>}
    </>
  );
}

/* ── Modal ─────────────────────────────────────────────────────── */

export default function ReviewModal({ contentType, itemId, onClose, onApprove, onReject }: ReviewModalProps) {
  const { accessToken } = useAuth();
  const [data, setData]       = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason]       = useState("");
  const [busy, setBusy]           = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(DETAIL_URL[contentType](itemId), {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("failed");
        const result = await res.json();
        if (!cancelled) setData(result.data as Record<string, unknown>);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contentType, itemId, accessToken]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleApprove() {
    setBusy(true);
    try { await onApprove(itemId); } finally { setBusy(false); }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setBusy(true);
    try { await onReject(itemId, reason.trim()); } finally { setBusy(false); }
  }

  return (
    <div className="review-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="review-preview-title" onClick={onClose}>
      <div className="review-preview-modal" onClick={(e) => e.stopPropagation()}>

        <div className="review-preview-header">
          <h2 className="review-preview-heading" id="review-preview-title">
            Review {TYPE_LABEL[contentType]}
          </h2>
          <button type="button" className="review-preview-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="review-preview-body">
          {loading ? (
            <p className="review-preview-state">Loading {TYPE_LABEL[contentType]}…</p>
          ) : error || !data ? (
            <p className="review-preview-state">Couldn&apos;t load this {TYPE_LABEL[contentType]}.</p>
          ) : contentType === "blog" ? (
            <BlogContent data={data} />
          ) : contentType === "itinerary" ? (
            <ItineraryContent data={data} />
          ) : (
            <VideoContent data={data} />
          )}
        </div>

        <div className="review-preview-footer">
          {rejecting ? (
            <div className="review-preview-reject">
              <textarea
                className="reject-dialog-textarea"
                placeholder="Reason for rejection — so the creator can improve their content…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
              <div className="review-preview-reject-actions">
                <button type="button" className="btn-ghost" onClick={() => { setRejecting(false); setReason(""); }} disabled={busy}>
                  Cancel
                </button>
                <button type="button" className="btn-reject" onClick={handleReject} disabled={!reason.trim() || busy}>
                  {busy ? "Rejecting…" : "Confirm reject"}
                </button>
              </div>
            </div>
          ) : (
            <div className="review-preview-decide">
              <button type="button" className="btn-reject" onClick={() => setRejecting(true)} disabled={busy || loading}>
                Reject
              </button>
              <button type="button" className="btn-approve" onClick={handleApprove} disabled={busy || loading}>
                {busy ? "Approving…" : "Approve"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
