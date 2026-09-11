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
  authorId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isSelf: boolean;
}

// A row in a followers / following list
export interface FollowPerson {
  id: string;
  name: string;
  username: string;
  isFollowing: boolean;
  isSelf: boolean;
}

export type ExploreContentType = "blog" | "itinerary" | "video";

export interface ExploreItem {
  id: string;
  type: ExploreContentType;
  title: string;
  description: string;
  coverUrl?: string;
  author: { id?: string; name: string; initials: string };
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
