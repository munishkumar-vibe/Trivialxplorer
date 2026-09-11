"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NOTIFICATION } from "@/lib/api/endpoints";
import type { NotificationItem } from "@/types/content";
import NotificationRow from "./NotificationRow";

interface NotificationModalProps {
  onClose: () => void;
  /** Notifies the bell so the unread badge can update. */
  onReadChange?: () => void;
}

export default function NotificationModal({ onClose, onReadChange }: NotificationModalProps) {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Paginated fetch — same page/limit style as the Follow lists in this app.
  const load = useCallback(
    async (pageToLoad: number) => {
      if (!accessToken) return;
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`${NOTIFICATION.LIST}?page=${pageToLoad}&limit=20`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("failed");
        const result = await res.json();
        const data = (result.data as NotificationItem[]) ?? [];
        setItems((prev) => (pageToLoad === 1 ? data : [...prev, ...data]));
        setTotalPages(result.pagination?.totalPages ?? 1);
        setPage(pageToLoad);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => { load(1); }, [load]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function markRead(id: string) {
    // Optimistic — flip locally, then persist.
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    onReadChange?.();
    try {
      await fetch(NOTIFICATION.READ(id), {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      /* best-effort */
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onReadChange?.();
    try {
      await fetch(NOTIFICATION.READ_ALL, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      /* best-effort */
    }
  }

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div
      className="follow-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      onClick={onClose}
    >
      <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h2 className="follow-modal-title" id="notif-modal-title">Notifications</h2>
          <div className="notif-modal-header-actions">
            {hasUnread && (
              <button type="button" className="notif-mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
            <button type="button" className="follow-modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="follow-modal-body">
          {loading && items.length === 0 ? (
            <p className="follow-modal-state">Loading…</p>
          ) : error ? (
            <p className="follow-modal-state">Couldn&apos;t load notifications.</p>
          ) : items.length === 0 ? (
            <p className="follow-modal-state">No notifications yet.</p>
          ) : (
            <>
              <div className="notif-list">
                {items.map((n) => (
                  <NotificationRow key={n.id} notification={n} onRead={markRead} onClose={onClose} />
                ))}
              </div>
              {page < totalPages && (
                <button
                  type="button"
                  className="notif-load-more"
                  onClick={() => load(page + 1)}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
