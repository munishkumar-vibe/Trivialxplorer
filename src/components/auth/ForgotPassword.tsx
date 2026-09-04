"use client";

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { apiForgotPassword } from "@/lib/api/auth";

interface Props {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: Props) {
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, []);

  const validate = () => {
    if (!email)                                           { setError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))      { setError("Enter a valid email address"); return false; }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // The backend always returns 200 here to prevent email enumeration —
      // we show the confirmation screen regardless of whether the email exists.
      await apiForgotPassword(email);
      setConfirmed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div ref={containerRef} className="auth-form-panel">
        <div className="auth-confirm-box">
          <div className="auth-confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="auth-confirm-title">Check your inbox</h2>
          <p className="auth-confirm-text">
            If an account with <strong>{email}</strong> exists, a reset link has been sent. Check your spam folder if you don&rsquo;t see it.
          </p>
          <button type="button" className="auth-link" onClick={onBack}>
            ← Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="auth-form-panel">
      <h2 className="auth-title">Reset your password</h2>
      <p className="auth-subtitle">
        Enter the email you signed up with and we&rsquo;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field-wrap">
          <label htmlFor="forgot-email" className="auth-label">Email address</label>
          <div className="auth-input-inner">
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              onBlur={validate}
              autoComplete="email"
              placeholder="you@example.com"
              className={`auth-input${error ? " auth-input--error" : ""}`}
              aria-describedby={error ? "forgot-email-error" : undefined}
              aria-invalid={!!error}
            />
          </div>
          {error && (
            <p id="forgot-email-error" className="auth-error-msg" role="alert">{error}</p>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Sending…</> : "Send reset link"}
        </button>
      </form>

      <div className="auth-switch-row">
        <button type="button" className="auth-link" onClick={onBack}>
          ← Back to log in
        </button>
      </div>
    </div>
  );
}
