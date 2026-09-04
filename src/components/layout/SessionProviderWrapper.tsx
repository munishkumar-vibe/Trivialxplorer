"use client";

// Stub wrapper — swap AuthProvider for next-auth's SessionProvider once next-auth is installed.
// Replace this entire file with:
//   import { SessionProvider } from "next-auth/react";
//   export default function SessionProviderWrapper({ children }) {
//     return <SessionProvider>{children}</SessionProvider>;
//   }

import { AuthProvider } from "@/context/AuthContext";

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
