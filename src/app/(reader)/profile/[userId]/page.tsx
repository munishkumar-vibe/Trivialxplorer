"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { USERS } from "@/lib/api/endpoints";
import type { UserProfile, ExploreItem } from "@/types/content";
import FollowButton from "@/components/profile/FollowButton";
import FollowListModal from "@/components/profile/FollowListModal";
import ExploreCard from "@/components/explore/ExploreCard";

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function avatarInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function mapBlogToExploreItem(raw: Record<string, unknown>): ExploreItem {
  const authorObj = raw.author as { _id?: string; username?: string } | null;
  const wordCount = (raw.wordCount as number) ?? 0;
  return {
    id:          raw._id as string,
    type:        "blog",
    title:       raw.title as string,
    description: (raw.description as string) ?? "",
    coverUrl:    raw.imageUrl as string | undefined,
    author: {
      id:       authorObj?._id,
      name:     authorObj?.username ?? "Anonymous",
      initials: avatarInitials(authorObj?.username ?? "A"),
    },
    meta:        `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    viewCount:   (raw.viewCount as number) ?? 0,
    savedByMe:   false,
    createdAt:   raw.createdAt as string,
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, status } = useAuth();

  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts]     = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [modal, setModal]     = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    if (!userId || status === "loading") return;
    if (!accessToken) { setLoading(false); return; }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const [profileRes, blogsRes] = await Promise.all([
          fetch(USERS.PROFILE(userId as string), { credentials: "include", headers }),
          fetch(USERS.BLOGS(userId as string),   { credentials: "include", headers }),
        ]);
        if (!profileRes.ok) throw new Error("profile not found");

        const profileJson = await profileRes.json();
        const blogsJson   = blogsRes.ok ? await blogsRes.json() : { data: [] };

        if (!cancelled) {
          setProfile(profileJson.data as UserProfile);
          setPosts((blogsJson.data as Record<string, unknown>[]).map(mapBlogToExploreItem));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, accessToken, status]);

  // Keep the follower count in sync with the follow button on this profile.
  const handleFollowChange = useCallback((isFollowing: boolean) => {
    setProfile((prev) =>
      prev ? { ...prev, isFollowing, followerCount: prev.followerCount + (isFollowing ? 1 : -1) } : prev
    );
  }, []);

  if (loading) {
    return (
      <div className="profile-state">
        <p className="profile-state-body">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-state">
        <h1 className="profile-state-title">Profile not found</h1>
        <p className="profile-state-body">This user doesn&apos;t exist or may have been removed.</p>
        <button type="button" className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => router.back()}>
          <ArrowLeftIcon /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <button type="button" className="btn-ghost profile-back" onClick={() => router.back()}>
        <ArrowLeftIcon /> Back
      </button>

      {/* ── Header ──────────────────────────────────── */}
      <header className="profile-header">
        <span className="profile-avatar" aria-hidden="true">{avatarInitials(profile.name)}</span>

        <div className="profile-identity">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-username">@{profile.username}</p>
          <p className="profile-joined">Joined {formatJoined(profile.createdAt)}</p>
        </div>

        <div className="profile-header-action">
          <FollowButton
            userId={profile.id}
            initialIsFollowing={profile.isFollowing}
            onChange={handleFollowChange}
          />
        </div>
      </header>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.postCount}</span>
          <span className="profile-stat-label">Posts</span>
        </div>
        <button type="button" className="profile-stat profile-stat--btn" onClick={() => setModal("followers")}>
          <span className="profile-stat-value">{profile.followerCount}</span>
          <span className="profile-stat-label">Followers</span>
        </button>
        <button type="button" className="profile-stat profile-stat--btn" onClick={() => setModal("following")}>
          <span className="profile-stat-value">{profile.followingCount}</span>
          <span className="profile-stat-label">Following</span>
        </button>
      </div>

      {/* ── Posts ───────────────────────────────────── */}
      <section className="profile-posts">
        <h2 className="profile-section-title">
          {profile.isSelf ? "Your posts" : `Posts by ${profile.name}`}
        </h2>

        {posts.length === 0 ? (
          <div className="profile-posts-empty">
            <p className="empty-state-body">No published posts yet.</p>
          </div>
        ) : (
          <div className="explore-grid" role="list" aria-label="Published posts">
            {posts.map((item) => (
              <div key={item.id} role="listitem">
                <ExploreCard {...item} savedByMe={false} onBookmarkToggle={() => {}} />
              </div>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <FollowListModal userId={profile.id} mode={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
