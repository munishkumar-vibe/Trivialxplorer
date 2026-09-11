"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: "01",
    title: "Document Your Trek",
    desc: "Build rich, day-by-day itineraries with route notes, camp spots, gear lists, and real-world tips — the stuff no guide tells you.",
    tag: "Placeholder — edit copy as needed",
    image: "/images-hiking/toomas-tartes-Yizrl9N_eDA-unsplash.jpg",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    label: "02",
    title: "Share Real Itineraries",
    desc: "Publish your trek logs as structured, searchable posts that other trekkers can actually follow on the trail.",
    tag: "Placeholder — edit copy as needed",
    image: "/images-hiking/holly-mandarich-7MrXw_o7Eo4-unsplash.jpg",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "03",
    title: "Connect With Fellow Trekkers",
    desc: "Follow creators who've walked your target trails. Get beta, find companions, build your trekking network.",
    tag: "Placeholder — edit copy as needed",
    image: "/images-hiking/joel-jasmin-forestbird-znoL1m6MD_k-unsplash.jpg",
  },
];

// Find the normalised progress (0–1) along `path` closest to `target`
function findProgress(
  path: SVGPathElement,
  target: { x: number; y: number },
  steps = 800,
): number {
  const len = path.getTotalLength();
  let closest = 0;
  let minDist = Infinity;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pt = path.getPointAtLength(t * len);
    const d = Math.hypot(pt.x - target.x, pt.y - target.y);
    if (d < minDist) {
      minDist = d;
      closest = t;
    }
  }
  return closest;
}

export default function Features() {
  const bodyRef   = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const pathBgRef = useRef<SVGPathElement>(null);
  const pathRef   = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const nodeRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const revealed  = useRef<boolean[]>(FEATURES.map(() => false));

  useLayoutEffect(() => {
    const body   = bodyRef.current;
    const svg    = svgRef.current;
    const pathBg = pathBgRef.current;
    const path   = pathRef.current;
    if (!body || !svg || !pathBg || !path) return;

    // Reset reveal state (handles dev hot-reload)
    revealed.current = FEATURES.map(() => false);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const isMobile = window.matchMedia("(max-width: 800px)").matches;

    // ── Mobile: simple per-card fade, skip all SVG animation ──────────
    if (isMobile) {
      const mobileSTs: ScrollTrigger[] = [];
      cardRefs.current.forEach((card) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 20 });
        mobileSTs.push(
          ScrollTrigger.create({
            trigger: card,
            start: "top 95%",
            onEnter() {
              gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
            },
          }),
        );
      });
      return () => { mobileSTs.forEach((st) => st.kill()); };
    }

    // ── Desktop: measure nodes, build S-curve path ──────────────────
    const bRect = body.getBoundingClientRect();
    const W = bRect.width;
    const H = bRect.height;

    const nodePositions = nodeRefs.current.map((el) => {
      if (!el) return { x: W / 2, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width  / 2 - bRect.left,
        y: r.top  + r.height / 2 - bRect.top,
      };
    });

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const [n1, n2, n3] = nodePositions;
    const d = [
      `M ${n1.x} ${n1.y}`,
      `C ${n2.x} ${n1.y}, ${n1.x} ${n2.y}, ${n2.x} ${n2.y}`,
      `C ${n1.x} ${n2.y}, ${n2.x} ${n3.y}, ${n1.x} ${n3.y}`,
    ].join(" ");
    pathBg.setAttribute("d", d);
    path.setAttribute("d", d);

    const pathLen  = path.getTotalLength();
    const checkpoints = nodePositions.map((n) => findProgress(path, n));

    // ── Initial hidden states ────────────────────────────────────────
    FEATURES.forEach((_, i) => {
      const isRight = i % 2 !== 0;
      const card = cardRefs.current[i];
      const img  = imageRefs.current[i];
      if (card) gsap.set(card, { opacity: 0, x: isRight ? 56 : -56 });
      if (img)  gsap.set(img,  { opacity: 0, x: isRight ? -40 : 40 });
    });

    gsap.set(path, { attr: { strokeDasharray: pathLen, strokeDashoffset: pathLen } });

    if (markerRef.current) {
      const pt0 = path.getPointAtLength(0);
      gsap.set(markerRef.current, {
        attr: { transform: `translate(${pt0.x},${pt0.y})` },
        opacity: 0,
      });
    }

    // ── Main scroll-scrubbed animation ──────────────────────────────
    const pathST = ScrollTrigger.create({
      trigger: body,
      start: "top 90%",
      end: "bottom 55%",
      scrub: 1.2,
      onUpdate(self) {
        const p = self.progress;

        // Draw path
        gsap.set(path, { attr: { strokeDashoffset: pathLen * (1 - p) } });

        // Move marker
        if (markerRef.current) {
          const pt = path.getPointAtLength(p * pathLen);
          gsap.set(markerRef.current, {
            attr: { transform: `translate(${pt.x},${pt.y})` },
            opacity: p > 0.01 ? 1 : 0,
          });
        }

        // Reveal cards/images and pulse nodes at checkpoints
        checkpoints.forEach((cp, i) => {
          const isRight = i % 2 !== 0;
          const card = cardRefs.current[i];
          const img  = imageRefs.current[i];
          const node = nodeRefs.current[i];

          if (p >= cp && !revealed.current[i]) {
            if (card) gsap.to(card, { opacity: 1, x: 0, duration: 0.7,  ease: "power2.out" });
            if (img)  gsap.to(img,  { opacity: 1, x: 0, duration: 0.65, ease: "power2.out" });
            if (node) {
              gsap.timeline()
                .to(node, { scale: 1.35, duration: 0.18, ease: "power2.out" })
                .to(node, { scale: 1,    duration: 0.28, ease: "elastic.out(1, 0.5)" });
            }
            revealed.current[i] = true;
          } else if (p < cp && revealed.current[i]) {
            // Scroll-back: instantly reset
            if (card) { gsap.killTweensOf(card); gsap.set(card, { opacity: 0, x: isRight ? 56  : -56  }); }
            if (img)  { gsap.killTweensOf(img);  gsap.set(img,  { opacity: 0, x: isRight ? -40 : 40   }); }
            if (node) { gsap.killTweensOf(node); gsap.set(node, { scale: 1 }); }
            revealed.current[i] = false;
          }

          // Active card border emphasis
          if (card) {
            const nextCp = checkpoints[i + 1] ?? 1.1;
            card.classList.toggle("trail-card--active", p >= cp && p < nextCp);
          }
        });
      },
    });

    return () => { pathST.kill(); };
  }, []);

  return (
    <section id="features" className="trail-section">
      <div className="trail-header">
        <p className="features-eyebrow">What&rsquo;s coming</p>
        <h2 className="features-heading">Built for how trekkers actually think</h2>
      </div>

      {/* Desktop: full GSAP trail map — hidden below 800px via CSS */}
      <div ref={bodyRef} className="trail-body">
        <svg ref={svgRef} className="trail-svg" aria-hidden="true">
          <path ref={pathBgRef} className="trail-path-bg" />
          <path ref={pathRef}   className="trail-path" />
          <g ref={markerRef} opacity="0">
            <circle r="20" className="trail-marker-pulse" />
            <circle r="12" className="trail-marker-badge" />
            <path d="M 0 -7 L 3.5 1 L 0 -1 L -3.5 1 Z" className="trail-marker-needle-n" />
            <path d="M 0  7 L 3.5 -1 L 0 1 L -3.5 -1 Z" className="trail-marker-needle-s" />
            <circle r="2" className="trail-marker-center" />
          </g>
        </svg>

        {FEATURES.map((f, i) => {
          const isRight = i % 2 !== 0;
          return (
            <div key={i} className={`trail-step trail-step--${isRight ? "right" : "left"}`}>
              <div className="trail-card-outer">
                <div ref={(el) => { cardRefs.current[i] = el; }} className="trail-card">
                  <span className="trail-card-label">{f.label}</span>
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                  <span className="feature-badge">{f.tag}</span>
                </div>
              </div>
              <div className="trail-gap">
                <div ref={(el) => { nodeRefs.current[i] = el; }} className="trail-node">
                  <span className="trail-node-inner" />
                </div>
              </div>
              <div className="trail-image-outer">
                <div ref={(el) => { imageRefs.current[i] = el; }} className="trail-image-wrap">
                  <Image src={f.image} alt={f.title} fill className="trail-image" sizes="400px" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: simple static cards — visible only below 800px via CSS */}
      <div className="trail-mobile">
        {FEATURES.map((f, i) => (
          <div key={i} className="trail-mobile-card">
            <div className="trail-mobile-card-img">
              <Image src={f.image} alt={f.title} fill className="trail-image" sizes="100vw" />
            </div>
            <div className="trail-mobile-card-body">
              <span className="trail-card-label">{f.label}</span>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
