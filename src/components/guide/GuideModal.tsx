"use client";

import { useEffect, useState, type ReactNode } from "react";

interface GuideModalProps {
  onClose: () => void;
}

interface GuideStep {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  /** Ordered "how it works" points shown as a mini-stepper inside the step. */
  points?: { label: string; text: string }[];
}

// ── Icons ──────────────────────────────────────────────────────────
function MapIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function PenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function MountainIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20l5.5-11L13 17l3-5 5 8H3z" />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" />
      <path d="M9 19h5a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h0" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ── Guide content ──────────────────────────────────────────────────
const STEPS: GuideStep[] = [
  {
    icon: <MapIcon />,
    title: "Welcome to TravelXplorer",
    subtitle: "Your map to trails, treks and a fitness-driven travel life.",
    description:
      "TravelXplorer is a publishing platform for trekkers and travel creators. It's built around two kinds of stories: Blogs and Itineraries. Blogs are for fitness + travel writing, and Itineraries are for detailed, day-by-day travel and trek routes. This guide walks you through the whole platform, node by node.",
    points: [
      { label: "Blogs", text: "Fitness + travel articles — training, gear, recovery, and the places you went." },
      { label: "Itineraries", text: "Travel & trek routes where you share the real experience of a trek, day by day." },
    ],
  },
  {
    icon: <GridIcon />,
    title: "Your Dashboard",
    subtitle: "The home base for everything you create and follow.",
    description:
      "The dashboard is your command center. The left sidebar navigates the whole app — Dashboard, Explore, My Posts, Itineraries, Saved — plus your Community links. The top bar holds the Create button, notifications bell, and your profile.",
    points: [
      { label: "Sidebar", text: "Jump between your content, the community feed, and saved items." },
      { label: "Create", text: "The button in the top bar starts a new blog or itinerary." },
      { label: "Notifications", text: "The bell shows likes and follows as they happen." },
    ],
  },
  {
    icon: <CompassIcon />,
    title: "Explore the community feed",
    subtitle: "Discover trek stories and routes from explorers worldwide.",
    description:
      "Explore is the global feed of published blogs and itineraries from the whole community. You can filter by type, search by title, author or topic, like posts, and save the ones you want to revisit.",
    points: [
      { label: "Filter & search", text: "Narrow the feed to Blogs or Itineraries, or search for anything." },
      { label: "Like", text: "Tap the heart on any blog to show appreciation — the author gets notified." },
      { label: "Save", text: "Bookmark a post to find it later under Saved." },
    ],
  },
  {
    icon: <PenIcon />,
    title: "Blog posts — fitness + travel",
    subtitle: "Write the story behind the journey.",
    description:
      "Blogs are long-form articles that blend fitness and travel: training for a trek, gear reviews, recovery, nutrition, and the experience of the destination itself. A blog has a title, a short description, a cover image, and a rich text body with images.",
    points: [
      { label: "Great for", text: "Fitness journeys, gear breakdowns, trip reflections, how-to guides." },
      { label: "Rich content", text: "Headings, lists, quotes, and inline images make it magazine-quality." },
    ],
  },
  {
    icon: <PenIcon />,
    title: "How to publish a blog",
    subtitle: "From idea to published, step by step.",
    description:
      "Publishing a blog is a guided flow. Everything you submit goes through a quick review before it appears in the public Explore feed — this keeps quality high across the community.",
    points: [
      { label: "1 · Create", text: "Click Create in the top bar and choose Blog." },
      { label: "2 · Fill it in", text: "Add a title, a short description, and a cover image." },
      { label: "3 · Write", text: "Compose the body in the rich editor and drop in images." },
      { label: "4 · Submit", text: "Submit for review — your post is marked Pending." },
      { label: "5 · Published", text: "Once an admin approves it, it goes live in Explore for everyone." },
    ],
  },
  {
    icon: <MountainIcon />,
    title: "Itineraries — travel & trek routes",
    subtitle: "Share the real, day-by-day experience of a trek.",
    description:
      "Itineraries are specifically for travel and trek routes. Instead of one article, an itinerary is structured by days — each day captures a stage of the journey so others can actually follow in your footsteps.",
    points: [
      { label: "Structured by day", text: "Every day has its own title, description, and location." },
      { label: "Trek detail", text: "Capture elevation, distance, and difficulty so hikers know what to expect." },
      { label: "Real experience", text: "This is where you share what a trek was truly like to do." },
    ],
  },
  {
    icon: <RouteIcon />,
    title: "How to publish an itinerary",
    subtitle: "Build a route others can follow.",
    description:
      "Creating an itinerary walks you through the trip overview and then each day. Like blogs, it's reviewed before publishing so the routes in the feed stay trustworthy.",
    points: [
      { label: "1 · Create", text: "Click Create and choose Itinerary." },
      { label: "2 · Overview", text: "Set the title, region, cover image, difficulty and best months." },
      { label: "3 · Add days", text: "Add each day with its title, description, location, elevation and distance." },
      { label: "4 · Submit", text: "Submit for review — it's marked Pending." },
      { label: "5 · Published", text: "After approval it appears in Explore as a followable route." },
    ],
  },
  {
    icon: <UsersIcon />,
    title: "Community & engagement",
    subtitle: "Follow people, get followed, stay in the loop.",
    description:
      "TravelXplorer is social. Follow creators whose journeys you like, and they can follow you back. Likes and follows generate notifications, so you always know when your work resonates.",
    points: [
      { label: "Follow", text: "Follow any creator from their profile or a post byline." },
      { label: "Likes", text: "Like blogs across the app — counts update instantly." },
      { label: "Notifications", text: "The bell collects likes and follows in one place." },
      { label: "Saved", text: "Everything you bookmark lives under Saved for later." },
    ],
  },
  {
    icon: <RocketIcon />,
    title: "You're all set",
    subtitle: "Time to share your first story.",
    description:
      "That's the whole platform. Whether it's a fitness + travel blog or a day-by-day trek itinerary, hit Create in the top bar to begin. Your story helps the next explorer plan theirs.",
    points: [
      { label: "Start a blog", text: "Share a training log, a gear review, or a trip reflection." },
      { label: "Map a trek", text: "Turn your last trek into an itinerary others can follow." },
    ],
  },
];

export default function GuideModal({ onClose }: GuideModalProps) {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const isFirst = active === 0;
  const isLast = active === STEPS.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && active < STEPS.length - 1) setActive((a) => a + 1);
      if (e.key === "ArrowLeft" && active > 0) setActive((a) => a - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);

  return (
    <div className="guide-overlay" role="dialog" aria-modal="true" aria-label="Platform guide" onClick={onClose}>
      <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="guide-close" onClick={onClose} aria-label="Close guide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="guide-body">
          {/* ── Left rail: vertical line + nodes ── */}
          <aside className="guide-rail">
            <p className="guide-rail-title">Platform guide</p>
            <ol className="guide-nodes">
              {STEPS.map((s, i) => {
                const state = i < active ? "done" : i === active ? "active" : "todo";
                return (
                  <li key={s.title} className={`guide-node-row guide-node-row--${state}`}>
                    <button
                      type="button"
                      className="guide-node-btn"
                      onClick={() => setActive(i)}
                      aria-current={i === active ? "step" : undefined}
                    >
                      <span className="guide-node-dot">
                        {i < active ? <CheckIcon /> : <span>{i + 1}</span>}
                      </span>
                      <span className="guide-node-text">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* ── Right: active step content ── */}
          <section className="guide-content" key={active}>
            <span className="guide-content-icon">{step.icon}</span>
            <span className="guide-step-count">Step {active + 1} of {STEPS.length}</span>
            <h2 className="guide-content-title">{step.title}</h2>
            <p className="guide-content-subtitle">{step.subtitle}</p>
            <p className="guide-content-desc">{step.description}</p>

            {step.points && (
              <ul className="guide-points">
                {step.points.map((p) => (
                  <li key={p.label} className="guide-point">
                    <span className="guide-point-label">{p.label}</span>
                    <span className="guide-point-text">{p.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="guide-actions">
              <button
                type="button"
                className="btn-ghost guide-back"
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                disabled={isFirst}
              >
                <ArrowLeft /> Back
              </button>

              <div className="guide-progress" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <span key={i} className={`guide-progress-dot${i === active ? " guide-progress-dot--active" : ""}`} />
                ))}
              </div>

              {isLast ? (
                <button type="button" className="btn-primary guide-next" onClick={onClose}>
                  Get started <ArrowRight />
                </button>
              ) : (
                <button type="button" className="btn-primary guide-next" onClick={() => setActive((a) => a + 1)}>
                  Next <ArrowRight />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
