export type AppThemeMode = "dark" | "light";

export function setAppTheme(mode: AppThemeMode) {
  if (typeof window === "undefined") return;

  localStorage.setItem("nexus-theme", mode);

  const root = document.documentElement;
  const body = document.body;

  if (mode === "dark") {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.setProperty('--bg', '#020305');
    root.style.setProperty('--surface', '#07090d');
    root.style.setProperty('--card', 'rgba(10, 12, 18, 0.82)');
    root.style.setProperty('--text', '#ffffff');
    root.style.setProperty('--muted', '#94a3b8');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.10)');
    root.setAttribute("data-theme", "dark");
    body.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.setProperty('--bg', '#f7f8fb');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--text', '#0b1220');
    root.style.setProperty('--muted', '#64748b');
    root.style.setProperty('--border', 'rgba(15, 23, 42, 0.12)');
    root.setAttribute("data-theme", "light");
    body.setAttribute("data-theme", "light");
  }

  // Dispatch custom event to notify other components/context
  window.dispatchEvent(
    new CustomEvent("nexus-theme-change", {
      detail: { mode }
    })
  );
}

export function getAppTheme(): AppThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("nexus-theme");
  return saved === "light" ? "light" : "dark";
}
