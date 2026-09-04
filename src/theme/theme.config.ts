export interface ThemeTokens {
  colorBg: string;
  colorSurface: string;
  colorSurface2: string;
  colorAccent: string;
  colorAccentWarm: string;
  colorText: string;
  colorTextMuted: string;
  colorTextFaint: string;
  colorBorder: string;
  colorNavBg: string;
  colorImgShadow: string;
  colorCardShadow: string;
  colorAccentSoft: string;
  colorShadowSm: string;
  colorShadowMd: string;
  colorShadowLg: string;
}

export type ThemeKey = "default" | "light" | "dark";

export const DEFAULT_THEME: ThemeKey = "light";

export const themes: Record<ThemeKey, ThemeTokens> = {
  default: {
    colorBg: "#0b100e",
    colorSurface: "#131b18",
    colorSurface2: "#1c2a25",
    colorAccent: "#5e9e6f",
    colorAccentWarm: "#b8863e",
    colorText: "#e8e4dc",
    colorTextMuted: "#8a8780",
    colorTextFaint: "#3d4e46",
    colorBorder: "#232e29",
    colorNavBg: "rgba(11, 16, 14, 0.78)",
    colorImgShadow: "rgba(0, 0, 0, 0.5)",
    colorCardShadow: "none",
    colorAccentSoft: "rgba(94, 158, 111, 0.1)",
    colorShadowSm: "0 1px 4px rgba(0,0,0,0.3)",
    colorShadowMd: "0 4px 20px rgba(0,0,0,0.4)",
    colorShadowLg: "0 8px 40px rgba(0,0,0,0.55)",
  },
  light: {
    colorBg: "#f4f7f5",
    colorSurface: "#ffffff",
    colorSurface2: "#edf2ee",
    colorAccent: "#1e6b3c",
    colorAccentWarm: "#9a5e18",
    colorText: "#0f1a14",
    colorTextMuted: "#52635a",
    colorTextFaint: "#9db0a4",
    colorBorder: "#dce5de",
    colorNavBg: "rgba(255, 255, 255, 0.96)",
    colorImgShadow: "rgba(0, 0, 0, 0.10)",
    colorCardShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)",
    colorAccentSoft: "rgba(30, 107, 60, 0.08)",
    colorShadowSm: "0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)",
    colorShadowMd: "0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
    colorShadowLg: "0 8px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
  },
  dark: {
    colorBg: "#060a08",
    colorSurface: "#0d1410",
    colorSurface2: "#132019",
    colorAccent: "#4a8c5e",
    colorAccentWarm: "#c49040",
    colorText: "#ece8e0",
    colorTextMuted: "#747270",
    colorTextFaint: "#2d3e35",
    colorBorder: "#182218",
    colorNavBg: "rgba(6, 10, 8, 0.88)",
    colorImgShadow: "rgba(0, 0, 0, 0.65)",
    colorCardShadow: "none",
    colorAccentSoft: "rgba(74, 140, 94, 0.12)",
    colorShadowSm: "0 1px 4px rgba(0,0,0,0.35)",
    colorShadowMd: "0 4px 20px rgba(0,0,0,0.45)",
    colorShadowLg: "0 8px 40px rgba(0,0,0,0.6)",
  },
};
