// Auth route group layout — no navbar, no footer.
// ThemeProvider is already applied by the root layout.
// RedirectIfAuth bounces already-logged-in users to the dashboard so they can
// never land on /login or /register.
import RedirectIfAuth from "@/components/auth/RedirectIfAuth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RedirectIfAuth>{children}</RedirectIfAuth>;
}
