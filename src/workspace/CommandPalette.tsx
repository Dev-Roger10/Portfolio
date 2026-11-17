import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { CornerDownLeft, Copy, ExternalLink, FolderGit2, Palette, Search, SquareTerminal, type LucideIcon } from "lucide-react";
import { profile, projects } from "../data/profile";
import { useWorkspace } from "./context";
import { themeLabel, themes } from "./themes";
import { views } from "./views";

type Item = { id: string; group: string; label: string; hint?: string; icon: LucideIcon; run: () => void };

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, open, setProjectIndex, setTerminalOpen, runSql, theme, setTheme } = useWorkspace();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const close = () => {
    setPaletteOpen(false);
    setQuery("");
    setCursor(0);
  };

  const items = useMemo<Item[]>(
    () => [
      ...views.map<Item>((v, i) => ({ id: v.id, group: "Ir a", label: v.label, hint: `Alt ${i + 1}`, icon: v.icon, run: () => open(v.id) })),
      ...projects.map<Item>((p, i) => ({
        id: `p${i}`,
        group: "Proyectos",
        label: p.title,
        hint: p.category,
        icon: FolderGit2,
        run: () => {
          setProjectIndex(i);
          open("proyectos");
        },
      })),
      { id: "sql", group: "Acciones", label: "Ejecutar consulta de ejemplo", hint: "SQL", icon: Search, run: () => runSql("SELECT categoria, impacto_pct, descripcion\nFROM logros\nWHERE impacto_pct > 0\nORDER BY impacto_pct DESC") },
      { id: "term", group: "Acciones", label: "Abrir terminal", hint: "Ctrl D", icon: SquareTerminal, run: () => setTerminalOpen(true) },
      { id: "mail", group: "Acciones", label: "Copiar correo", hint: profile.email, icon: Copy, run: () => void navigator.clipboard?.writeText(profile.email) },
      ...themes.map<Item>((t) => ({ id: `t-${t.id}`, group: "Tema de color", label: themeLabel(t.id), hint: t.id === theme ? "activo" : undefined, icon: Palette, run: () => setTheme(t.id) })),
      { id: "gh", group: "Enlaces", label: "GitHub", hint: profile.githubLabel, icon: ExternalLink, run: () => window.open(profile.github, "_blank") },
      { id: "in", group: "Enlaces", label: "LinkedIn", hint: profile.linkedinLabel, icon: ExternalLink, run: () => window.open(profile.linkedin, "_blank") },
    ],
    [open, setProjectIndex, setTerminalOpen, runSql, theme, setTheme],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, [paletteOpen]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor, filtered]);

  const choose = (item?: Item) => {
    if (!item) return;
    close();
    item.run();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      choose(filtered[cursor]);
    }
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-label="Paleta de comandos"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-ink-800 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={16} className="text-zinc-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Buscar un comando"
                className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">esc</kbd>
            </div>
            <ul ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-zinc-500">Sin resultados para “{query}”</li>}
              {filtered.map((item, i) => (
                <li key={item.id} role="option" aria-selected={i === cursor}>
                  {(i === 0 || filtered[i - 1].group !== item.group) && (
                    <div className="px-3 pb-1 pt-3 font-mono text-[10px] text-zinc-600">{item.group}</div>
                  )}
                  <button
                    onMouseMove={() => setCursor(i)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === cursor ? "bg-accent-500/15 text-white" : "text-zinc-300"}`}
                  >
                    <item.icon size={15} className={i === cursor ? "text-accent-300" : "text-zinc-500"} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && <span className="hidden max-w-[40%] truncate font-mono text-[11px] text-zinc-500 sm:block">{item.hint}</span>}
                    {i === cursor && <CornerDownLeft size={13} className="text-zinc-500" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
