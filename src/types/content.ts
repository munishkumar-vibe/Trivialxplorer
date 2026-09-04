import type { ContentStatus } from "@/types/creator";

export interface PostDetail {
  id: string;
  title: string;
  description: string;
  content: string;
  coverUrl?: string;
  readingTimeMin: number;
  status: ContentStatus;
  createdAt: string;
  viewCount?: number;
  author: string;
}

export type ExploreContentType = "blog" | "itinerary" | "video";

export interface ExploreItem {
  id: string;
  type: ExploreContentType;
  title: string;
  description: string;
  coverUrl?: string;
  author: { name: string; initials: string };
  meta: string;
  viewCount: number;
  savedByMe: boolean;
  createdAt: string;
}

export type Difficulty = "Easy" | "Moderate" | "Difficult" | "Extreme";

export interface ItineraryDayDetail {
  dayNumber: number;
  title: string;
  description: string;
  location: string;
  elevationM?: number;
  distanceKm?: number;
  imageUrl?: string;
}

export interface ItineraryData {
  id: string;
  title: string;
  region: string;
  state: string;
  description: string;
  coverUrl?: string;
  dayCount: number;
  difficulty: Difficulty;
  maxElevationM: number;
  distanceKm: number;
  bestMonths: string;
  status: "published" | "draft";
  createdAt: string;
  viewCount: number;
  days: ItineraryDayDetail[];
}
