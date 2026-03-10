/**
 * Apply a theme to the document root element.
 * Dark mode is the default (no class needed).
 * Light mode requires the "light" class on <html>.
 */
export function applyTheme(theme: "dark" | "light" | "system"): void {
  const root = document.documentElement;
  root.classList.remove("light");
  if (theme === "light") {
    root.classList.add("light");
  } else if (theme === "system") {
    const preferLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    if (preferLight) root.classList.add("light");
  }
  // "dark" is the default — no class needed
}

/**
 * Read saved theme from localStorage and apply it immediately.
 */
export function applyStoredTheme(): void {
  try {
    const raw = localStorage.getItem("lsh_user_settings");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { theme?: string };
    const theme = parsed?.theme;
    if (theme === "light" || theme === "dark" || theme === "system") {
      applyTheme(theme);
    }
  } catch {
    // Ignore parse errors — keep default dark theme
  }
}
