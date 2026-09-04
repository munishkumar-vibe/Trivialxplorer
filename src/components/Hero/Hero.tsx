"use client";

import { useEffect, useRef } from "react";

const YT_ID = "EiwcsogwS9M";
const YT_EMBED = `https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&showinfo=0`;

export default function Hero() {
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip parallax on touch devices — no mouse to track
    if (window.matchMedia("(hover: none)").matches) return;

    let rafId: number;
    let tx = 0, ty = 0;   // target
    let cx = 0, cy = 0;   // current (lerped)

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;  // –1 → 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      // Smooth lerp toward target
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;

      // Video moves opposite — deeper layer
      if (videoWrapRef.current) {
        videoWrapRef.current.style.transform =
          `translate3d(${cx * -22}px, ${cy * -14}px, 0) scale(1.1)`;
      }
      // Text moves same direction — shallower layer
      if (contentRef.current) {
        contentRef.current.style.transform =
          `translate3d(${cx * 7}px, ${cy * 4}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg">
        {/* Fallback image — visible while YT loads / on reduced-motion */}
        <img
          src="/images-hiking/holly-mandarich-7MrXw_o7Eo4-unsplash.jpg"
          alt=""
          className="hero-fallback-img"
          aria-hidden="true"
        />

        {/* YouTube — ref receives parallax transform via JS */}
        <div className="hero-video-wrap" ref={videoWrapRef} aria-hidden="true">
          <iframe
            className="hero-video-frame"
            src={YT_EMBED}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            tabIndex={-1}
            title=""
          />
        </div>

        {/* Atmospheric glow — drifts slowly over the scene */}
        <div className="hero-glow" aria-hidden="true" />

        {/* Gradient overlay — keeps text readable */}
        <div className="hero-overlay" />
      </div>

      {/* Inset mask — covers YouTube's prev/pause/next controls at edges */}
      <div className="hero-edge-mask" aria-hidden="true" />

      {/* Content — ref gets subtle parallax in same direction as mouse */}
      <div className="hero-content" ref={contentRef}>
        <p className="hero-eyebrow">India&rsquo;s trekking platform</p>
        <h1 className="hero-headline">
          Every Mountain
          <br />
          Has a Story.
        </h1>
        <p className="hero-subtext">
          TravelXplorer is where India&rsquo;s trekking community documents,
          shares, and discovers real trail experiences — not glossy guides,
          but honest records from people who&rsquo;ve walked the path.
        </p>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <span className="hero-scroll-line" />
        <span className="hero-scroll-label">Scroll</span>
      </div>
    </section>
  );
}
