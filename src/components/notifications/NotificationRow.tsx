"use client";

import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/types/content";
import { NOTIFICATION_CONFIG } from "./notificationConfig";

interface NotificationRowProps {
  notification: NotificationItem;
  onRead: (id: string) => void;
  onClose: () => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function NotificationRow({ notification, onRead, onClose }: NotificationRowProps) {
  const router = useRouter();

  // The ONLY type-aware step in the entire component: look up the config.
  // Everything below is fully generic.
  const config = NOTIFICATION_CONFIG[notification.type];

  // Unknown/unconfigured type → render nothing rather than crash. This is the
  // absence-of-config case, not per-type logic.
  if (!config) return null;

  const message = config.message(notification);
  const thumbnail = config.thumbnail(notification);
  const link = config.link(notification);

  function handleClick() {
    if (!notification.isRead) onRead(notification.id);
    onClose();
    router.push(link);
  }

  return (
    <button
      type="button"
      className={`notif-row${notification.isRead ? "" : " notif-row--unread"}`}
      onClick={handleClick}
    >
      <span className="notif-row-media" aria-hidden="true">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="notif-row-thumb" />
        ) : (
          <span className="notif-row-avatar">{initials(notification.actor?.name)}</span>
        )}
      </span>

      <span className="notif-row-body">
        <span className="notif-row-message">{message}</span>
        <span className="notif-row-time">{relativeTime(notification.createdAt)}</span>
      </span>

      {!notification.isRead && <span className="notif-row-dot" aria-label="Unread" />}
    </button>
  );
}
