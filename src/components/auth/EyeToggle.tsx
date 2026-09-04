"use client";

import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface Props {
  fieldId: string;
  isVisible: boolean;
  onToggle: () => void;
  trackRef: React.RefObject<HTMLElement | null>;
}

export default function EyeToggle({ fieldId, isVisible, onToggle, trackRef }: Props) {
  const lidRef        = useRef<SVGRectElement>(null);
  const pupilRef      = useRef<SVGCircleElement>(null);
  const slashRef      = useRef<SVGLineElement>(null);
  const isWinkingRef  = useRef(false);
  const isVisibleRef  = useRef(isVisible);
  const blinkTmrRef   = useRef<gsap.core.Tween | null>(null);
  const blinkTLRef    = useRef<gsap.core.Timeline | null>(null);
  const doBlinkRef    = useRef<() => void>(() => {});
  const clipId        = `eye-lid-${fieldId}`;

  // Sync isVisibleRef so the blink loop can read it without re-running the effect
  useLayoutEffect(() => { isVisibleRef.current = isVisible; }, [isVisible]);

  // Sync slash / pupil opacity when visible state changes
  useLayoutEffect(() => {
    const slash  = slashRef.current;
    const pupil  = pupilRef.current;
    if (!slash || !pupil) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = prefersReduced ? 0 : 0.18;
    gsap.to(slash,  { opacity: isVisible ? 1 : 0, duration: dur, overwrite: "auto" });
    gsap.to(pupil,  { opacity: isVisible ? 0 : 1, duration: dur, overwrite: "auto" });
  }, [isVisible]);

  // Main GSAP setup: blink loop + pupil tracking
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lid   = lidRef.current;
    const pupil = pupilRef.current;
    if (!lid || !pupil || prefersReduced) return;

    // Lid starts fully above the eye (y = -16 slides it out of view above)
    gsap.set(lid, { y: -16 });

    const doBlink = () => {
      // Skip visual blink when winking or when eye appears "closed" (password visible)
      if (isWinkingRef.current || isVisibleRef.current) {
        blinkTmrRef.current = gsap.delayedCall(gsap.utils.random(2, 4), doBlink);
        return;
      }
      blinkTLRef.current = gsap.timeline({
        onComplete: () => {
          blinkTmrRef.current = gsap.delayedCall(gsap.utils.random(3, 6.5), doBlink);
        },
      })
        .to(lid, { y: 0,   duration: 0.07, ease: "power2.in" })
        .to(lid, { y: -16, duration: 0.12, ease: "power2.out" });
    };

    doBlinkRef.current = doBlink;
    blinkTmrRef.current = gsap.delayedCall(gsap.utils.random(1.5, 3), doBlink);

    // ── Pupil cursor tracking ─────────────────────────────────────────
    const trackEl = trackRef.current;
    if (!trackEl) {
      return () => {
        blinkTmrRef.current?.kill();
        blinkTLRef.current?.kill();
      };
    }

    const onMouseMove = (e: MouseEvent) => {
      const r = trackEl.getBoundingClientRect();
      const x = gsap.utils.clamp(-2.5, 2.5, ((e.clientX - r.left  - r.width  / 2) / (r.width  / 2)) * 2.5);
      const y = gsap.utils.clamp(-1.5, 1.5, ((e.clientY - r.top   - r.height / 2) / (r.height / 2)) * 1.5);
      gsap.to(pupil, { x, y, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    };

    const onMouseLeave = () => {
      gsap.to(pupil, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    };

    trackEl.addEventListener("mousemove", onMouseMove);
    trackEl.addEventListener("mouseleave", onMouseLeave);

    return () => {
      blinkTmrRef.current?.kill();
      blinkTLRef.current?.kill();
      trackEl.removeEventListener("mousemove", onMouseMove);
      trackEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(() => {
    const lid = lidRef.current;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !lid) {
      onToggle();
      return;
    }

    if (isWinkingRef.current) return;
    isWinkingRef.current = true;

    blinkTmrRef.current?.kill();
    blinkTLRef.current?.kill();

    gsap.timeline({
      onComplete: () => {
        isWinkingRef.current = false;
        // Restart blink loop only when eye is back to "open" state
        if (!isVisibleRef.current) {
          blinkTmrRef.current = gsap.delayedCall(gsap.utils.random(2, 4), doBlinkRef.current);
        }
      },
    })
      .to(lid, { y: 0,   duration: 0.1,  ease: "power2.in" })   // close lid
      .call(onToggle)                                              // swap type at midpoint
      .to(lid, { y: -16, duration: 0.15, ease: "power2.out" });  // open lid
  }, [onToggle]);

  return (
    <button
      type="button"
      className="eye-toggle-btn"
      onClick={handleClick}
      aria-label={isVisible ? "Hide password" : "Show password"}
      aria-pressed={isVisible}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        overflow="visible"
      >
        <defs>
          <clipPath id={clipId}>
            {/* Clip eyelid rect to the eye opening shape */}
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          </clipPath>
        </defs>

        {/* Eye outline */}
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Iris ring */}
        <circle
          cx="12" cy="12" r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        {/* Pupil — GSAP translates x/y for cursor tracking */}
        <circle
          ref={pupilRef}
          cx="12" cy="12" r="2"
          fill="currentColor"
        />

        {/*
          Eyelid — a rect clipped to the eye shape.
          Starts at y = -16 (above the eye), slides to y = 0 to close.
          fill matches the input background so it looks like a real lid.
        */}
        <rect
          ref={lidRef}
          x="0" y="4"
          width="24" height="16"
          fill="var(--color-surface-2)"
          clipPath={`url(#${clipId})`}
        />

        {/* Slash line — visible when password is shown (eye "closed/slashed") */}
        <line
          ref={slashRef}
          x1="3" y1="21" x2="21" y2="3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ opacity: 0 }}
        />
      </svg>
    </button>
  );
}
