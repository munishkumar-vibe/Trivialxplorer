"use client";

import { useState, useRef } from "react";
import EyeToggle from "./EyeToggle";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  autoComplete = "current-password",
  placeholder,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="auth-field-wrap">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div ref={wrapRef} className="auth-input-inner">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`auth-input auth-input--password${error ? " auth-input--error" : ""}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        <EyeToggle
          fieldId={id}
          isVisible={isVisible}
          onToggle={() => setIsVisible((v) => !v)}
          trackRef={wrapRef}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="auth-error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
