"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("ms-theme", next ? "dark" : "light");
    } catch {
      // storage unavailable: the choice lasts for this page only
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-on-night/75 transition-colors hover:border-white/30 hover:text-on-night"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      {dark === null ? "Theme" : dark ? "Morning theme" : "Evening theme"}
    </button>
  );
}
