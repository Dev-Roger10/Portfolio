import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { useWorkspace } from "./context";
import { themeLabel, themes } from "./themes";

/** Selector de tema estilo "Color Theme" de VS Code, con muestras de cada paleta. */
export function ThemePicker() {
  const { theme, setTheme } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${themeLabel(theme)}: cambiar tema`}
        className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
      >
        <Palette size={16} />
        <span className="hidden whitespace-nowrap font-mono lg:inline">{themeLabel(theme)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Temas"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-10 z-[95] w-64 overflow-hidden rounded-xl border border-white/15 bg-ink-800 p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]"
          >
            <li className="flex items-center justify-between px-2.5 pb-1.5 pt-1">
              <span className="font-mono text-[10px] text-zinc-600">Tema de color</span>
            </li>
            {themes.map((t) => {
              const on = t.id === theme;
              const tk = t.tokens;
              return (
                <li key={t.id} role="option" aria-selected={on}>
                  <button
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${on ? "bg-accent-500/15 text-white" : "text-zinc-300 hover:bg-white/[0.05]"}`}
                  >
                    {/* Muestra: fondo real del tema con sus colores de sintaxis */}
                    <span className="flex h-6 w-12 flex-none items-center justify-center gap-0.5 rounded-md ring-1 ring-white/10" style={{ background: tk.bg }}>
                      {[tk.accent, tk.keyword, tk.string, tk.number].map((c) => (
                        <i key={c} className="h-2.5 w-1.5 rounded-sm" style={{ background: c }} />
                      ))}
                    </span>
                    <span className="flex-1">{themeLabel(t.id)}</span>
                    {on && <Check size={14} className="text-accent-400" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
