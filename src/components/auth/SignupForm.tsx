"use client";

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import PasswordField from "./PasswordField";
import { apiSignup } from "@/lib/api/auth";

interface Props {
  onLogin: () => void;
}

interface Fields {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

type FieldErrors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields, touched: Partial<Record<keyof Fields, boolean>>): FieldErrors {
  const e: FieldErrors = {};

  if (touched.username) {
    if (!f.username.trim())          e.username = "Username is required";
    else if (f.username.length < 3)  e.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(f.username)) e.username = "Letters, numbers and _ only";
  }
  if (touched.firstName && !f.firstName.trim()) e.firstName = "First name is required";
  if (touched.lastName  && !f.lastName.trim())  e.lastName  = "Last name is required";

  if (touched.email) {
    if (!f.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  }

  if (touched.phone && !f.phone.trim()) e.phone = "Phone number is required";

  if (touched.dob) {
    if (!f.dob) {
      e.dob = "Date of birth is required";
    } else {
      const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 13) e.dob = "You must be at least 13 years old to sign up";
    }
  }

  if (touched.password) {
    if (!f.password)              e.password = "Password is required";
    else if (f.password.length < 8) e.password = "Password must be at least 8 characters";
  }

  if (touched.confirmPassword) {
    if (!f.confirmPassword)                     e.confirmPassword = "Please confirm your password";
    else if (f.password !== f.confirmPassword)  e.confirmPassword = "Passwords do not match";
  }

  if (touched.terms && !f.terms) e.terms = "You must accept the terms to continue";

  return e;
}

const EMPTY: Fields = {
  username: "", firstName: "", lastName: "", email: "",
  phone: "", dob: "", password: "", confirmPassword: "", terms: false,
};

export default function SignupForm({ onLogin }: Props) {
  const [fields,   setFields]   = useState<Fields>(EMPTY);
  const [touched,  setTouched]  = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [loading,  setLoading]  = useState(false);
  const [formErr,  setFormErr]  = useState("");
  const [success,  setSuccess]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const errors = validate(fields, touched);

  useLayoutEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, []);

  const set = (k: keyof Fields) => (v: string | boolean) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  const touch = (k: keyof Fields) => () =>
    setTouched((prev) => ({ ...prev, [k]: true }));

  const touchAll = (): Partial<Record<keyof Fields, boolean>> => {
    const all = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])) as
      Partial<Record<keyof Fields, boolean>>;
    setTouched(all);
    return all;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = touchAll();
    const errs = validate(fields, allTouched);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setFormErr("");
    try {
      const res = await apiSignup({
        username:        fields.username,
        firstName:       fields.firstName,
        lastName:        fields.lastName,
        email:           fields.email,
        phone:           fields.phone,
        dob:             fields.dob,
        password:        fields.password,
        confirmPassword: fields.confirmPassword,
        terms:           fields.terms,
      });
      if (!res.success) {
        throw new Error(res.message ?? "Registration failed. Please try again.");
      }
      setSuccess(true);
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state — prompt user to log in
  if (success) {
    return (
      <div ref={containerRef}>
        <div className="auth-confirm-box">
          <div className="auth-confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="auth-confirm-title">Account created!</h2>
          <p className="auth-confirm-text">
            Your TravelXplorer account is ready. Log in to start documenting your treks.
          </p>
          <button type="button" className="auth-link" onClick={onLogin}>
            Go to log in →
          </button>
        </div>
      </div>
    );
  }

  const field = (
    id: keyof Fields,
    label: string,
    type = "text",
    extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>
  ) => (
    <div className="auth-field-wrap">
      <label htmlFor={`signup-${id}`} className="auth-label">{label}</label>
      <div className="auth-input-inner">
        <input
          id={`signup-${id}`}
          type={type}
          value={fields[id] as string}
          onChange={(e) => { set(id)(e.target.value); if (touched[id]) setTouched((p) => ({ ...p, [id]: true })); }}
          onBlur={touch(id)}
          className={`auth-input${errors[id] ? " auth-input--error" : ""}`}
          aria-describedby={errors[id] ? `signup-${id}-error` : undefined}
          aria-invalid={!!errors[id]}
          {...extra}
        />
      </div>
      {errors[id] && (
        <p id={`signup-${id}-error`} className="auth-error-msg" role="alert">{errors[id]}</p>
      )}
    </div>
  );

  return (
    <div ref={containerRef}>
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-subtitle">Start documenting your treks today.</p>

      <form onSubmit={handleSubmit} noValidate>
        {formErr && (
          <p className="auth-error-msg" role="alert" style={{ marginBottom: "1rem" }}>{formErr}</p>
        )}

        {field("username",  "Username",      "text",  { autoComplete: "username",    placeholder: "trail_seeker" })}

        <div className="auth-row">
          {field("firstName", "First name",  "text",  { autoComplete: "given-name" })}
          {field("lastName",  "Last name",   "text",  { autoComplete: "family-name" })}
        </div>

        {field("email",  "Email address",   "email", { autoComplete: "email",       placeholder: "you@example.com" })}
        {field("phone",  "Phone number",    "tel",   { autoComplete: "tel",         placeholder: "+91 98765 43210" })}
        {field("dob",    "Date of birth",   "date",  { autoComplete: "bday",        max: new Date().toISOString().split("T")[0] })}

        <PasswordField
          id="signup-password"
          label="Password"
          value={fields.password}
          onChange={(v) => { set("password")(v); if (touched.password) setTouched((p) => ({ ...p, password: true })); }}
          onBlur={touch("password")}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Min. 8 characters"
        />

        <PasswordField
          id="signup-confirm"
          label="Confirm password"
          value={fields.confirmPassword}
          onChange={(v) => { set("confirmPassword")(v); if (touched.confirmPassword) setTouched((p) => ({ ...p, confirmPassword: true })); }}
          onBlur={touch("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="auth-checkbox-wrap">
          <input
            id="signup-terms"
            type="checkbox"
            className="auth-checkbox"
            checked={fields.terms}
            onChange={(e) => { set("terms")(e.target.checked); touch("terms")(); }}
            aria-describedby={errors.terms ? "signup-terms-error" : undefined}
            aria-invalid={!!errors.terms}
          />
          <label htmlFor="signup-terms" className="auth-checkbox-label">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </label>
        </div>
        {errors.terms && (
          <p id="signup-terms-error" className="auth-error-msg" role="alert" style={{ marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
            {errors.terms}
          </p>
        )}

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Creating account…</> : "Create account"}
        </button>
      </form>

      <div className="auth-switch-row">
        Already have an account?{" "}
        <button type="button" className="auth-link" onClick={onLogin}>
          Log in
        </button>
      </div>
    </div>
  );
}
