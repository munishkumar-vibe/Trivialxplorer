"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Keeps authenticated users out of the landing page and auth screens. On
// refresh, once the session resolves as authenticated, we send them straight
// to the dashboard. While loading (or when unauthenticated) we render the
// public page as normal so logged-out visitors aren't blocked.
export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Avoid flashing the public page during the redirect.
  if (status === "authenticated") return null;

  return <>{children}</>;
}
