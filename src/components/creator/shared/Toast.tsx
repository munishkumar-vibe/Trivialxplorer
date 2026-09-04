"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ToastItem({ message, type }: { message: string; type: "success" | "error" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => setVisible(false), 3400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`creator-toast creator-toast--${type}${visible ? " creator-toast--visible" : ""}`} role="alert" aria-live="polite">
      <span className="creator-toast-icon">{type === "success" ? <CheckIcon /> : <XIcon />}</span>
      <span className="creator-toast-msg">{message}</span>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useDashboard();

  return (
    <div className="creator-toast-stack" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  );
}
