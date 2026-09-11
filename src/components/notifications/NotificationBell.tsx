"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NOTIFICATION } from "@/lib/api/endpoints";
import NotificationModal from "./NotificationModal";

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const { accessToken, status } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(NOTIFICATION.UNREAD_COUNT, {
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await res.json();
      if (res.ok) setUnread(Number(result.data?.unread ?? 0));
    } catch {
      /* leave prior value */
    }
  }, [accessToken]);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  if (status !== "authenticated") return null;

  return (
    <>
      <button
        type="button"
        className="navbar-theme-btn notif-bell"
        onClick={() => setOpen(true)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="notif-bell-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <NotificationModal
          onClose={() => setOpen(false)}
          onReadChange={refreshUnread}
        />
      )}
    </>
  );
}
