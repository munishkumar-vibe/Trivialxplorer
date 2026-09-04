"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import ReviewModal, { type ReviewContentType } from "./ReviewModal";

export interface PendingItem {
  _id: string;
  title: string;
  author?: { username?: string; firstName?: string; lastName?: string } | null;
  createdAt?: string;
}

interface ApprovalPageProps {
  title: string;
  pendingUrl: string;
  approveUrl: (id: string) => string;
  rejectUrl:  (id: string) => string;
  /** Content type — enables the in-page View preview modal. */
  contentType: ReviewContentType;
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApprovalPage({ title, pendingUrl, approveUrl, rejectUrl, contentType }: ApprovalPageProps) {
  const { accessToken } = useAuth();
  const [items,   setItems]   = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [reason,       setReason]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  const [previewId, setPreviewId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch(pendingUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setItems(res.data ?? []);
        else setError(res.message ?? "Failed to load");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [accessToken, pendingUrl]);

  useEffect(() => { load(); }, [load]);

  // Shared approve/reject — used by both the table row and the preview modal.
  const doApprove = useCallback(async (id: string) => {
    if (!accessToken) return;
    await fetch(approveUrl(id), { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, [accessToken, approveUrl]);

  const doReject = useCallback(async (id: string, why: string) => {
    if (!accessToken) return;
    await fetch(rejectUrl(id), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: why }),
    });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, [accessToken, rejectUrl]);

  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    setSubmitting(true);
    await doReject(rejectTarget, reason);
    setRejectTarget(null);
    setReason("");
    setSubmitting(false);
  }

  return (
    <div className="approval-page">
      <div className="approval-header">
        <h1 className="approval-header-title">{title}</h1>
        {items.length > 0 && <span className="approval-badge">{items.length}</span>}
      </div>

      {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading…</p>}
      {error && <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>{error}</p>}

      {!loading && !error && (
        <div className="approval-table-wrap">
          {items.length === 0 ? (
            <p className="approval-empty">No pending items — all caught up!</p>
          ) : (
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>
                      <span className="approval-author">
                        {item.author?.username
                          ?? (item.author?.firstName ? `${item.author.firstName} ${item.author.lastName ?? ""}`.trim() : null)
                          ?? "Unknown"}
                      </span>
                    </td>
                    <td><span className="approval-date">{fmt(item.createdAt)}</span></td>
                    <td>
                      <div className="approval-actions">
                        <button className="btn-view" onClick={() => setPreviewId(item._id)}>
                          View
                        </button>
                        <button className="btn-approve" onClick={() => doApprove(item._id)}>
                          Approve
                        </button>
                        <button className="btn-reject" onClick={() => { setRejectTarget(item._id); setReason(""); }}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {rejectTarget && (
        <div className="reject-dialog-overlay" role="dialog" aria-modal="true">
          <div className="reject-dialog">
            <p className="reject-dialog-title">Reject submission</p>
            <p className="reject-dialog-sub">Provide a reason so the creator can improve their content.</p>
            <textarea
              className="reject-dialog-textarea"
              placeholder="e.g. Content is incomplete, images missing…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="reject-dialog-actions">
              <button className="btn-ghost" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button
                className="btn-reject"
                disabled={!reason.trim() || submitting}
                onClick={handleRejectSubmit}
              >
                {submitting ? "Rejecting…" : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewId && (
        <ReviewModal
          contentType={contentType}
          itemId={previewId}
          onClose={() => setPreviewId(null)}
          onApprove={async (id) => { await doApprove(id); setPreviewId(null); }}
          onReject={async (id, why) => { await doReject(id, why); setPreviewId(null); }}
        />
      )}
    </div>
  );
}
