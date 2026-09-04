// NextAuth route handler — wire up once next-auth is installed.
// Run: npm install next-auth  (then replace this file with:)
//   import { handlers } from "@/auth";
//   export const { GET, POST } = handlers;

export async function GET() {
  return new Response("Auth not configured yet", { status: 501 });
}
export async function POST() {
  return new Response("Auth not configured yet", { status: 501 });
}
