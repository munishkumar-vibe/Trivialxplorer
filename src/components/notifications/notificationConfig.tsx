import { API_BASE_URL } from "@/lib/api/config";
import type { NotificationItem } from "@/types/content";

// ─────────────────────────────────────────────────────────────────────────
// The ENTIRE per-type surface of the notification system lives here.
//
// To support a new notification type (e.g. 'comment'), add ONE entry to this
// map. The modal and the row component require ZERO changes — they only ever
// look up `NOTIFICATION_CONFIG[notification.type]` and call these functions.
// ─────────────────────────────────────────────────────────────────────────

export interface NotificationTypeConfig {
  /** The human-readable line, including the actor's username. */
  message: (n: NotificationItem) => string;
  /** Small image URL to show, or null to fall back to actor initials. */
  thumbnail: (n: NotificationItem) => string | null;
  /** Where clicking the row navigates. */
  link: (n: NotificationItem) => string;
}

// Prefix relative upload paths with the API origin.
function mediaUrl(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0) return null;
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : path;
}

export const NOTIFICATION_CONFIG: Record<string, NotificationTypeConfig> = {
  like: {
    message: (n) => `${n.actor?.username ?? "Someone"} liked your blog post`,
    thumbnail: (n) => mediaUrl(n.entity?.imageUrl),
    link: (n) => `/posts/${n.entityId}`,
  },
  follow: {
    message: (n) => `${n.actor?.username ?? "Someone"} started following you`,
    thumbnail: () => null, // no avatars yet → row shows actor initials
    link: (n) => `/profile/${n.actor?.id ?? ""}`,
  },
  // comment: {  ← this is all it takes to add a new type
  //   message: (n) => `${n.actor?.username} commented on your post`,
  //   thumbnail: (n) => mediaUrl(n.entity?.imageUrl),
  //   link: (n) => `/posts/${n.entityId}`,
  // },
};
