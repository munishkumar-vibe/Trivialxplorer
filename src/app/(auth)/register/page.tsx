import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Sign up — TravelXplorer",
};

export default function RegisterPage() {
  return <AuthPage initialView="signup" />;
}
