// Values come from .env.local (development) or your hosting provider's env (production).
// next.config.ts validates that NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL are set at build time.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
export const APP_URL      = process.env.NEXT_PUBLIC_APP_URL!;
export const APP_NAME     = process.env.NEXT_PUBLIC_APP_NAME ?? "TravelXplorer";
