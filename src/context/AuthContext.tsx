"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiRefreshToken, apiSignout, apiGetMe } from "@/lib/api/auth";
import type { PublicUser } from "@/lib/api/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  role: "user" | "admin";
}

interface AuthContextValue {
  data: { user: AuthUser } | null;
  status: "loading" | "authenticated" | "unauthenticated";
  accessToken: string | null;
  setSession: (user: PublicUser, token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// sessionStorage key for the access token
const TOKEN_KEY = "accessToken";

function toAuthUser(u: PublicUser): AuthUser {
  return {
    id:       u.id,
    name:     u.name,
    email:    u.email,
    username: u.username,
    image:    null,
    role:     u.role ?? "user",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status,      setStatus]      = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();

  // Restore session on page load:
  //   1. If sessionStorage has a token → verify it with /me
  //   2. If token missing/expired    → try the httpOnly refresh-token cookie
  //   3. If both fail                → unauthenticated
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);

    if (saved) {
      apiGetMe(saved)
        .then((res) => {
          if (res.success && res.data) {
            setUser(toAuthUser(res.data.user));
            setAccessToken(saved);
            setStatus("authenticated");
          } else {
            sessionStorage.removeItem(TOKEN_KEY);
            return tryRefresh();
          }
        })
        .catch(() => {
          sessionStorage.removeItem(TOKEN_KEY);
          tryRefresh();
        });
    } else {
      tryRefresh();
    }
  }, []);

  function tryRefresh(): Promise<void> {
    return apiRefreshToken()
      .then((res) => {
        if (res.success && res.data) {
          sessionStorage.setItem(TOKEN_KEY, res.data.userAccessToken);
          setUser(toAuthUser(res.data.user));
          setAccessToken(res.data.userAccessToken);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
  }

  // Called by LoginForm after a successful /signin response
  function setSession(publicUser: PublicUser, token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
    setUser(toAuthUser(publicUser));
    setAccessToken(token);
    setStatus("authenticated");
  }

  async function signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    try {
      await apiSignout();
    } catch {
      // Clear local state regardless
    }
    setUser(null);
    setAccessToken(null);
    setStatus("unauthenticated");
    // Hard navigation — clears Next.js router cache so back button
    // can't replay cached dashboard pages after logout.
    window.location.replace("/");
  }

  return (
    <AuthContext.Provider value={{ data: user ? { user } : null, status, accessToken, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
