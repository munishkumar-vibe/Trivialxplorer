"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef } from "react";
import { useTheme } from "@/theme/ThemeContext";
import type { ThemeKey } from "@/theme/theme.config";
import CreateButton from "@/components/creator/CreateButton";
import ProfileModal from "@/components/profile/ProfileModal";
import NotificationBell from "@/components/notifications/NotificationBell";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 20 12 4 21 20 3 20" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const NEXT_ICON: Record<ThemeKey, JSX.Element> = {
  default: <SunIcon />,
  light: <MoonIcon />,
  dark: <MountainIcon />,
};

const NEXT_LABEL: Record<ThemeKey, string> = {
  default: "Switch to light theme",
  light: "Switch to dark theme",
  dark: "Switch to default theme",
};

const LANDING_LINKS = [
  { label: "Treks", href: "#treks" },
  { label: "Stories", href: "#stories" },
  { label: "About", href: "#about" },
];

const DASHBOARD_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
];

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

export default function Navbar({ variant = "landing" }: NavbarProps) {
  const { theme, cycleTheme } = useTheme();
  const { data: session, status, signOut } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = variant === "dashboard" ? DASHBOARD_LINKS : LANDING_LINKS;

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";


  return (
    <>
      <header className={`navbar${variant === "dashboard" ? " navbar--dashboard" : ""}`}>
        <div className="navbar-inner">
          <a href="/" className="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 20l4.5-9L12 16l4-6 5 10" />
              <path d="M12 3L7 12" />
            </svg>
            <span className="navbar-logo-wordmark">
              <span className="navbar-logo-travel">Travel</span>
              <span className="navbar-logo-xplorer">Xplorer</span>
            </span>
          </a>

          <div className="navbar-divider" aria-hidden="true" />

          <nav className="navbar-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="navbar-link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="navbar-actions">
            {variant === "dashboard" && <CreateButton variant="navbar" />}
            {variant === "dashboard" && <NotificationBell />}
            <button
              className="navbar-theme-btn"
              type="button"
              onClick={cycleTheme}
              aria-label={NEXT_LABEL[theme]}
              title={NEXT_LABEL[theme]}
            >
              {NEXT_ICON[theme]}
            </button>

            {status === "loading" ? (
              <div className="navbar-profile-skeleton skeleton-line" aria-hidden="true" />
            ) : session?.user ? (
              <div className="navbar-profile" ref={profileRef}>
                <button
                  type="button"
                  className="navbar-profile-btn"
                  onClick={() => setProfileModalOpen(true)}
                  aria-label="Open profile"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="navbar-avatar" />
                  ) : (
                    <span className="navbar-avatar navbar-avatar--initials" aria-hidden="true">
                      {initials}
                    </span>
                  )}
                  <span className="navbar-profile-name">{firstName}</span>
                  <span className="navbar-profile-chevron">
                    <ChevronDownIcon />
                  </span>
                </button>

                {profileModalOpen && (
                  <ProfileModal
                    onClose={() => setProfileModalOpen(false)}
                    onSignOut={signOut}
                  />
                )}
              </div>
            ) : (
              <Link href="/login" className="navbar-login-btn">
                Log In
              </Link>
            )}

            {/* Hamburger — only visible on mobile via CSS */}
            {variant === "landing" && (
              <button
                className="navbar-hamburger"
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className={`navbar-hamburger-bar${menuOpen ? " navbar-hamburger-bar--open" : ""}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && variant === "landing" && (
        <div className="navbar-mobile-menu" role="navigation" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          {!session?.user && (
            <Link href="/login" className="navbar-mobile-link navbar-mobile-link--cta" onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          )}
        </div>
      )}
    </>
  );
}
