"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TREK_CARDS = [
  {
    image: "/images-hiking/toomas-tartes-Yizrl9N_eDA-unsplash.jpg",
    category: "Trek",
    title: "Kedarkantha Ridge Line",
    description: "Six days above the treeline, chasing sunrise on a ridge that never stays still.",
    location: "Uttarakhand, India",
  },
  {
    image: "/images-hiking/holly-mandarich-7MrXw_o7Eo4-unsplash.jpg",
    category: "Summit",
    title: "First Light on Hampta Pass",
    description: "The valley below disappears. The cold doesn't.",
    location: "Himachal Pradesh",
  },
  {
    image: "/images-hiking/galen-crout-fItRJ7AHak8-unsplash.jpg",
    category: "Journey",
    title: "Crossing the Hampta River",
    description: "Boots off, packs up — the river decides your pace.",
    location: "Spiti Valley",
  },
  {
    image: "/images-hiking/simon-english-48nerZQCHgo-unsplash.jpg",
    category: "Trail Story",
    title: "The Roopkund Ascent",
    description: "Thin air, thinner margins. Every step above 4,800m earns its own story.",
    location: "Chamoli, Uttarakhand",
  },
  {
    image: "/images-hiking/gaurav-k-CV7KPRM6fHc-unsplash.jpg",
    category: "Locals",
    title: "Tea Houses of Sar Pass",
    description: "Every stop had a story — and a second cup of chai you couldn't refuse.",
    location: "Parvati Valley",
  },
  {
    image: "/images-hiking/neom-wUyMk7ziLT0-unsplash.jpg",
    category: "Summit",
    title: "Stok Kangri at 3am",
    description: "Headlamps in the dark. Summit before the sun. No other way to do it.",
    location: "Ladakh",
  },
  {
    image: "/images-hiking/sebastien-goldberg-BKLHxgbYFDI-unsplash.jpg",
    category: "Trek",
    title: "Goecha La Approach",
    description: "Kangchenjunga fills the horizon on day four. You stop counting steps.",
    location: "Sikkim",
  },
  {
    image: "/images-hiking/vivek-ADKiS6V2Za8-unsplash.jpg",
    category: "Journey",
    title: "Overland to Pin Parvati",
    description: "Two valleys, one high pass, and a route that rewards the patient.",
    location: "Kullu–Spiti",
  },
  {
    image: "/images-hiking/marvin-meyer-UDqVWLDiJXg-unsplash.jpg",
    category: "Trail Story",
    title: "Night Camp at Deoria Tal",
    description: "Mirror-still water, Chaukhamba reflected. Worth every uphill kilometre.",
    location: "Rudraprayag",
  },
];

// Per-column parallax drift (px): col 0 drifts most, col 1 least, col 2 mid
const COLUMN_DRIFT = [-55, -20, -38];

export default function TrekGallery() {
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs      = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const btnRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTLs     = useRef<(gsap.core.Timeline | null)[]>([]);

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);

    // ── Establish hover element initial states ────────────────────────────
    overlayRefs.current.forEach((el) => el && gsap.set(el, { opacity: 0 }));
    contentRefs.current.forEach((el) => el && gsap.set(el, { y: 18, opacity: 0 }));

    // ── One-time opacity reveal per card ──────────────────────────────────
    const revealSTs: ScrollTrigger[] = [];
    cards.forEach((card, i) => {
      const st = ScrollTrigger.create({
        trigger: card,
        start: "top 88%",
        once: true,
        onEnter() {
          gsap.to(card, {
            opacity: 1,
            duration: prefersReduced ? 0.3 : 0.75,
            delay: prefersReduced ? 0 : (i % 3) * 0.1,
            ease: "power2.out",
          });
        },
      });
      revealSTs.push(st);
    });

    // ── Scroll-linked per-column parallax (desktop, no reduced motion) ────
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      () => {
        const parallaxSTs: ScrollTrigger[] = [];
        cards.forEach((card, i) => {
          const tween = gsap.to(card, {
            y: COLUMN_DRIFT[i % 3],
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          });
          if (tween.scrollTrigger) parallaxSTs.push(tween.scrollTrigger);
        });
        return () => parallaxSTs.forEach((st) => st.kill());
      }
    );

    // ── Per-card hover timelines ──────────────────────────────────────────
    cards.forEach((_, i) => {
      const img     = imgRefs.current[i];
      const overlay = overlayRefs.current[i];
      const content = contentRefs.current[i];
      const btn     = btnRefs.current[i];
      if (!img || !overlay || !content || !btn) return;

      const tl = gsap.timeline({ paused: true });
      tl.to(img,     { scale: 1.07, duration: 0.55, ease: "power2.out" }, 0)
        .to(overlay, { opacity: 1,  duration: 0.4,  ease: "power2.out" }, 0)
        .to(content, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.08)
        .to(btn,     { rotation: 45, backgroundColor: "var(--color-accent)", color: "#fff", duration: 0.32, ease: "power2.out" }, 0);

      hoverTLs.current[i] = tl;
    });

    return () => {
      revealSTs.forEach((st) => st.kill());
      mm.revert();
      hoverTLs.current.forEach((tl) => tl?.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="tg-section">
      <div className="tg-header">
        <p className="tg-eyebrow">Trek Stories</p>
        <h2 className="tg-heading">From the trail, by the people who walked it</h2>
        <p className="tg-subhead">
          Real routes, honest conditions — the moments no guidebook captures.
        </p>
      </div>

      <div className="tg-grid">
        {TREK_CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="tg-card"
            onMouseEnter={() => hoverTLs.current[i]?.play()}
            onMouseLeave={() => hoverTLs.current[i]?.reverse()}
          >
            {/* Image */}
            <div className="tg-card-img-wrap">
              <Image
                ref={(el) => { imgRefs.current[i] = el; }}
                src={card.image}
                alt={card.title}
                fill
                className="tg-card-img"
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 400px"
              />
            </div>

            {/* Hover overlay */}
            <div
              ref={(el) => { overlayRefs.current[i] = el; }}
              className="tg-card-overlay"
            />

            {/* Always-visible badge */}
            <span className="tg-card-badge">{card.category}</span>

            {/* Hover content panel */}
            <div
              ref={(el) => { contentRefs.current[i] = el; }}
              className="tg-card-content"
            >
              <h3 className="tg-card-title">{card.title}</h3>
              <p className="tg-card-desc">{card.description}</p>
              <span className="tg-card-location">
                <svg
                  width="10" height="10" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {card.location}
              </span>
            </div>

            {/* View button */}
            <div
              ref={(el) => { btnRefs.current[i] = el; }}
              className="tg-card-btn"
              aria-hidden="true"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
