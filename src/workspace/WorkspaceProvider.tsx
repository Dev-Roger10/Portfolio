import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { WorkspaceContext, type WorkspaceState } from "./context";
import { applyTheme, loadTheme, type ThemeId } from "./themes";
import { isViewId, views, type ViewId } from "./views";

const fromHash = (): ViewId => {
  const h = window.location.hash.replace("#", "");
  return isViewId(h) ? h : "resumen";
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ViewId>(fromHash);
  const [tabs, setTabs] = useState<ViewId[]>(() => [...new Set<ViewId>(["resumen", fromHash()])]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [projectIndex, setProjectIndex] = useState(0);
  const [sql, setSql] = useState({ query: "", nonce: 0 });
  const [theme, setTheme] = useState<ThemeId>(loadTheme);

  useEffect(() => applyTheme(theme), [theme]);

  const open = useCallback((id: ViewId) => {
    setTabs((t) => (t.includes(id) ? t : [...t, id]));
    setActive(id);
  }, []);

  const close = useCallback((id: ViewId) => {
    setTabs((t) => {
      if (t.length === 1) return t;
      const next = t.filter((x) => x !== id);
      setActive((a) => (a === id ? next[Math.max(0, t.indexOf(id) - 1)] : a));
      return next;
    });
  }, []);

  const runSql = useCallback(
    (query: string) => {
      setSql((s) => ({ query, nonce: s.nonce + 1 }));
      open("sql");
    },
    [open],
  );

  // URL compartible: #proyectos abre esa pestaña directamente.
  useEffect(() => {
    window.history.replaceState(null, "", `#${active}`);
  }, [active]);

  useEffect(() => {
    const onHash = () => open(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [open]);

  // Atajos: Ctrl/⌘+K paleta, Ctrl/⌘+D terminal, Alt+1..6 cambia de vista.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      } else if (e.altKey && /^[1-9]$/.test(e.key) && views[Number(e.key) - 1]) {
        e.preventDefault();
        open(views[Number(e.key) - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo<WorkspaceState>(
    () => ({ tabs, active, open, close, paletteOpen, setPaletteOpen, terminalOpen, setTerminalOpen, projectIndex, setProjectIndex, sql, runSql, theme, setTheme }),
    [tabs, active, open, close, paletteOpen, terminalOpen, projectIndex, sql, runSql, theme],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
