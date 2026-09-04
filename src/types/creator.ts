export type ContentType = "blog" | "video" | "itinerary";
export type ContentStatus = "draft" | "published" | "processing" | "pending" | "approved" | "rejected";

export interface ContentCard {
  id: string;
  type: ContentType;
  title: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  createdAt: string;
  viewCount?: number;
  description?: string;
  content?: string;
  author?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  location?: string;
  imageFile?: File | null;
}

// Form payloads — mirrors backend validators
export interface BlogPostPayload {
  title: string;
  description: string;
  content: string;
  image: File;
}

export interface VideoPayload {
  title: string;
  caption: string;
  description: string;
  video: File;
  thumbnail?: File;
}

export interface ItineraryPayload {
  title: string;
  description: string;
  coverImage: File;
  days: Omit<ItineraryDay, "id">[];
}

// Backend's unified response shape
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  field?: string;
  meta?: Record<string, unknown>;
}
