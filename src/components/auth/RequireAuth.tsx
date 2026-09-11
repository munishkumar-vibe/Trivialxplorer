"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Guards protected areas (dashboard + reader). While the session is still
// resolving we show a loader; once we know the user is unauthenticated we
// bounce them to /login. Children only render for authenticated users, so the
// dashboard chrome never flashes for logged-out visitors.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="route-guard">
        <span className="route-guard-spinner" aria-hidden="true" />
        <span className="route-guard-text">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
