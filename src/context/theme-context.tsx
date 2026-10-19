"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyThemeClass(targetTheme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (targetTheme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with lazy initializer to avoid setState in effect
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("versaly_theme") as Theme | null;
      return savedTheme === "light" ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("versaly_theme", newTheme);
    }
    applyThemeClass(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
