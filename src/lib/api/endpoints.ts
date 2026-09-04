import { API_BASE_URL } from "./config";

// All backend API endpoints in one place.
// Update only here if the backend routes change.
export const BLOG = {
  CREATE: `${API_BASE_URL}/api/blog`,
  LIST:   `${API_BASE_URL}/api/blog`,
  GET:    (id: string) => `${API_BASE_URL}/api/blog/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/api/blog/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/api/blog/${id}`,
} as const;

export const ITINERARY = {
  CREATE: `${API_BASE_URL}/api/itinerary`,
  LIST:   `${API_BASE_URL}/api/itinerary`,
  GET:    (id: string) => `${API_BASE_URL}/api/itinerary/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/api/itinerary/${id}`,
} as const;

export const VIDEO = {
  CREATE: `${API_BASE_URL}/api/video`,
  LIST:   `${API_BASE_URL}/api/video`,
} as const;

export const EXPLORE = {
  LIST: `${API_BASE_URL}/api/explore`,
} as const;

export const ADMIN = {
  COUNTS:              `${API_BASE_URL}/api/admin/counts`,
  BLOGS_PENDING:       `${API_BASE_URL}/api/admin/blogs/pending`,
  BLOG_APPROVE:  (id: string) => `${API_BASE_URL}/api/admin/blogs/${id}/approve`,
  BLOG_REJECT:   (id: string) => `${API_BASE_URL}/api/admin/blogs/${id}/reject`,
  ITINS_PENDING:       `${API_BASE_URL}/api/admin/itineraries/pending`,
  ITIN_APPROVE:  (id: string) => `${API_BASE_URL}/api/admin/itineraries/${id}/approve`,
  ITIN_REJECT:   (id: string) => `${API_BASE_URL}/api/admin/itineraries/${id}/reject`,
  VIDEOS_PENDING:      `${API_BASE_URL}/api/admin/videos/pending`,
  VIDEO_APPROVE: (id: string) => `${API_BASE_URL}/api/admin/videos/${id}/approve`,
  VIDEO_REJECT:  (id: string) => `${API_BASE_URL}/api/admin/videos/${id}/reject`,
} as const;

export const AUTH = {
  SIGNIN:          `${API_BASE_URL}/api/auth/signin`,
  SIGNUP:          `${API_BASE_URL}/api/auth/signup`,
  SIGNOUT:         `${API_BASE_URL}/api/auth/signout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD:  `${API_BASE_URL}/api/auth/reset-password`,
  REFRESH_TOKEN:   `${API_BASE_URL}/api/auth/refresh-token`,
  VERIFY:          `${API_BASE_URL}/api/auth/verify`,
  ME:              `${API_BASE_URL}/api/auth/me`,
} as const;
