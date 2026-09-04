import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Log in — TravelXplorer",
};

export default function LoginPage() {
  return <AuthPage initialView="login" />;
}
