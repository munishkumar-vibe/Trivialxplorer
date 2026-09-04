// Auth route group layout — no navbar, no footer.
// ThemeProvider is already applied by the root layout.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
