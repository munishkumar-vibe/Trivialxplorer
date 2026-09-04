"use client";

import Image from "next/image";
import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPassword from "./ForgotPassword";

type View = "login" | "signup" | "forgot";

const PERKS = [
  {
    text: "Post your trek stories and photos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    text: "Publish itineraries other trekkers can follow",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  {
    text: "Share real trail experience and route notes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    text: "Get guidance from trekkers who've done it before",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

interface Props {
  initialView?: View;
}

export default function AuthPage({ initialView = "login" }: Props) {
  const [view, setView]  = useState<View>(initialView);
  const panelRef         = useRef<HTMLDivElement>(null);

  // Initial page entry animation
  useLayoutEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.05 }
    );
  }, []);

  const switchView = useCallback((next: View) => {
    const panel = panelRef.current;
    if (!panel) { setView(next); return; }

    gsap.to(panel, {
      opacity: 0,
      y: -8,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        // flushSync forces React to commit the new view synchronously
        // so the incoming animation runs against the new DOM content
        flushSync(() => setView(next));
        gsap.to(panel, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
      },
    });
  }, []);

  return (
    <div className="auth-page">

      {/* ── Left: marketing panel ──────────────────────── */}
      <div className="auth-left">
        <Image
          src="/images-hiking/sebastien-goldberg-BKLHxgbYFDI-unsplash.jpg"
          alt=""
          fill
          className="auth-left-img"
          sizes="50vw"
          priority
        />
        <div className="auth-left-overlay" />

        <div className="auth-left-content">
          {/* Brand */}
          <a href="/" className="auth-brand-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 20l4.5-9L12 16l4-6 5 10"/>
              <path d="M12 3L7 12"/>
            </svg>
            TravelXplorer
          </a>

          {/* Copy */}
          <div className="auth-marketing">
            <h1 className="auth-tagline">Join the trail.</h1>
            <p className="auth-tagline-sub">Your stories matter. Start sharing.</p>
            <ul className="auth-perks">
              {PERKS.map((p, i) => (
                <li key={i} className="auth-perk">
                  <span className="auth-perk-icon" aria-hidden="true">{p.icon}</span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-left-footer">© {new Date().getFullYear()} TravelXplorer</p>
        </div>
      </div>

      {/* ── Right: form panel ──────────────────────────── */}
      <div className="auth-right">
        <div ref={panelRef} className="auth-form-panel">
          {view === "login"  && <LoginForm   onSignup={() => switchView("signup")} onForgot={() => switchView("forgot")} />}
          {view === "signup" && <SignupForm  onLogin={() => switchView("login")} />}
          {view === "forgot" && <ForgotPassword onBack={() => switchView("login")} />}
        </div>
      </div>

    </div>
  );
}
