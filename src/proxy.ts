import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/posts", "/itineraries", "/explore", "/saved", "/admin"];
const AUTH_ONLY = ["/login", "/register"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const VERIFY_URL = `${API_BASE}/api/auth/verify`;

async function isSessionValid(refreshTokenValue: string): Promise<boolean> {
  try {
    const res = await fetch(VERIFY_URL, {
      method: "GET",
      headers: {
        Cookie: `refreshToken=${refreshTokenValue}`,
      },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage  = AUTH_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtected && !isAuthPage) return NextResponse.next();

  const refreshToken = req.cookies.get("refreshToken")?.value;

  // No cookie at all — fast-path rejection without hitting the backend
  if (!refreshToken) {
    if (isProtected) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Verify the token is real and registered in the DB
  const authenticated = await isSessionValid(refreshToken);

  if (isProtected && !authenticated) {
    const url = req.nextUrl.clone();
    // Send to landing page — back button after logout lands here, not login
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.cookies.delete("refreshToken");
    return res;
  }

  if (isAuthPage && authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/posts/:path*",
    "/itineraries/:path*",
    "/explore/:path*",
    "/saved/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
  
};
