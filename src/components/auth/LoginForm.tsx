"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import PasswordField from "./PasswordField";
import { useAuth } from "@/context/AuthContext";
import { apiSignin } from "@/lib/api/auth";

interface Props {
  onSignup: () => void;
  onForgot: () => void;
}

export default function LoginForm({ onSignup, onForgot }: Props) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading,  setLoading]  = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const { setSession }          = useAuth();
  const router                  = useRouter();

  useLayoutEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, []);

  const validate = (field?: "email" | "password") => {
    const next = { ...errors };
    if (!field || field === "email") {
      if (!email)                                           next.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
      else                                                  delete next.email;
    }
    if (!field || field === "password") {
      if (!password) next.password = "Password is required";
      else           delete next.password;
    }
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors((prev) => ({ ...prev, form: undefined }));
    try {
      const res = await apiSignin({ email, password });
      if (!res.success || !res.data) {
        throw new Error(res.message ?? "Invalid email or password.");
      }
      setSession(res.data.user, res.data.userAccessToken);
      router.replace("/dashboard");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Log in to your TravelXplorer account.</p>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <p className="auth-error-msg" role="alert" style={{ marginBottom: "1rem" }}>
            {errors.form}
          </p>
        )}

        <div className="auth-field-wrap">
          <label htmlFor="login-email" className="auth-label">Email address</label>
          <div className="auth-input-inner">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) validate("email"); }}
              onBlur={() => validate("email")}
              autoComplete="email"
              placeholder="you@example.com"
              className={`auth-input${errors.email ? " auth-input--error" : ""}`}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" className="auth-error-msg" role="alert">{errors.email}</p>
          )}
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(v) => { setPassword(v); if (errors.password) validate("password"); }}
          onBlur={() => validate("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-forgot-row">
          <button type="button" className="auth-forgot-link" onClick={onForgot}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Logging in…</> : "Log in"}
        </button>
      </form>

      <div className="auth-switch-row">
        Don&rsquo;t have an account?{" "}
        <button type="button" className="auth-link" onClick={onSignup}>
          Sign up
        </button>
      </div>
    </div>
  );
}
