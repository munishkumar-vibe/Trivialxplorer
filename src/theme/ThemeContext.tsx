"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  themes,
  DEFAULT_THEME,
  type ThemeKey,
  type ThemeTokens,
} from "./theme.config";

interface ThemeContextValue {
  theme: ThemeKey;
  tokens: ThemeTokens;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const CYCLE: ThemeKey[] = ["default", "light", "dark"];

function applyTokens(tokens: ThemeTokens, theme: ThemeKey): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  for (const [key, value] of Object.entries(tokens)) {
    const cssVar =
      "--" +
      key
        .replace(/([A-Z])/g, "-$1")
        .replace(/([0-9]+)/g, "-$1")
        .toLowerCase();
    root.style.setProperty(cssVar, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const tokens = themes[theme];

  useEffect(() => {
    applyTokens(tokens, theme);
  }, [theme, tokens]);

  const cycleTheme = () =>
    setTheme((prev) => CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length]);

  return (
    <ThemeContext.Provider value={{ theme, tokens, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside <ThemeProvider>");
  return ctx;
}
