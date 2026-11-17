import { useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import { Command, Ellipsis, GitBranch, MapPin, Palette, Search, SquareTerminal, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/ui/BrandIcons";
import { profile } from "../data/profile";
import { useWorkspace } from "./context";
import { modKey } from "./platform";
import { ThemePicker } from "./ThemePicker";
import { themeLabel, themes } from "./themes";
import { views, viewById, type ViewId } from "./views";


export function TitleBar() {
  const { setPaletteOpen } = useWorkspace();
  return (
    <header className="flex h-12 flex-none items-center gap-3 border-b border-white/10 bg-ink-900 px-3 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
      <div className="flex flex-none items-center gap-3 md:min-w-56">
        <span aria-hidden="true" className="hidden gap-1.5 md:flex">
          <i className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <i className="h-3 w-3 rounded-full bg-[#ff9f1c]" />
          <i className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="whitespace-nowrap font-display text-sm font-medium text-white">
          Roger<span className="text-accent-400"> / </span>Antezana
        </span>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        aria-label="Buscar vistas, proyectos y comandos"
        className="ml-auto flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-xs text-zinc-500 transition-colors hover:border-white/20 hover:text-zinc-300 sm:mx-auto sm:h-8 sm:w-full sm:max-w-md sm:justify-start sm:gap-2 sm:px-3 sm:text-left"
      >
        <Search size={14} />
        <span className="hidden flex-1 truncate sm:block">Buscar vistas, proyectos y comandos</span>
        <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] sm:block">{modKey} K</kbd>
      </button>

      <div className="flex items-center gap-1.5 md:min-w-56 md:justify-end">
        <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white sm:inline-flex">
          <GithubIcon size={17} />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white sm:inline-flex">
          <LinkedinIcon size={17} />
        </a>
        <ThemePicker />
      </div>
    </header>
  );
}

/** Menú vertical estilo IDE (escritorio). */
export function ActivityBar() {
  const { active, open, terminalOpen, setTerminalOpen } = useWorkspace();
  return (
    <nav aria-label="Vistas" className="hidden w-14 flex-none flex-col items-center gap-1 border-r border-white/10 bg-ink-900 py-3 md:flex">
      {views.map((v, i) => {
        const on = active === v.id;
        return (
          <button key={v.id} onClick={() => open(v.id)} aria-label={v.label} aria-current={on} className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:text-zinc-100">
            {on && <motion.span layoutId="activity-pill" className="absolute inset-0 rounded-xl bg-accent-500/15 ring-1 ring-accent-500/40" transition={{ type: "spring", duration: 0.45, bounce: 0.2 }} />}
            <v.icon size={19} className={`relative ${on ? "text-accent-300" : ""}`} />
            <span className="pointer-events-none absolute left-full z-50 ml-3 hidden items-center gap-2 whitespace-nowrap rounded-md border border-white/10 bg-ink-800 px-2.5 py-1.5 text-xs text-zinc-200 shadow-xl group-hover:flex">
              {v.label}
              <kbd className="font-mono text-[10px] text-zinc-500">Alt {i + 1}</kbd>
            </span>
          </button>
        );
      })}
      <button
        onClick={() => setTerminalOpen(!terminalOpen)}
        aria-label="Terminal"
        aria-pressed={terminalOpen}
        className={`mt-auto flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:text-zinc-100 ${terminalOpen ? "text-mint-400" : "text-zinc-500"}`}
      >
        <SquareTerminal size={19} />
      </button>
    </nav>
  );
}

export function TabBar() {
  const { tabs, active, open, close } = useWorkspace();
  return (
    <div role="tablist" className="hidden h-10 flex-none items-stretch overflow-x-auto border-b border-white/10 bg-ink-900/60 md:flex">
      {tabs.map((id) => {
        const v = viewById(id);
        const on = id === active;
        return (
          <div key={id} className={`group relative flex min-w-0 flex-none items-center border-r border-white/10 ${on ? "bg-ink-950" : "hover:bg-white/[0.03]"}`}>
            {on && <motion.span layoutId="tab-line" className="absolute inset-x-0 top-0 h-0.5 bg-accent-500" />}
            <button role="tab" aria-selected={on} onClick={() => open(id)} className={`flex h-full items-center gap-2 pl-4 pr-2 font-mono text-xs ${on ? "text-white" : "text-zinc-500"}`}>
              <v.icon size={13} className={on ? "text-accent-400" : ""} />
              {v.file}
            </button>
            <button
              onClick={() => close(id)}
              disabled={tabs.length === 1}
              aria-label={`Cerrar ${v.label}`}
              className="mr-2 flex h-5 w-5 items-center justify-center rounded text-zinc-600 opacity-0 transition hover:bg-white/10 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 disabled:hidden"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const primaryIds: ViewId[] = ["resumen", "experiencia", "proyectos", "contacto"];

/** Navegación inferior en celular: 4 pestañas principales + "Más" con el resto. */
export function MobileNav() {
  const { active, open, setTerminalOpen, terminalOpen } = useWorkspace();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = primaryIds.map(viewById);
  const secondary = views.filter((v) => !primaryIds.includes(v.id));
  const moreActive = secondary.some((v) => v.id === active);

  const tab = (on: boolean) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${on ? "text-accent-300" : "text-zinc-500"}`;
  const pick = (id: ViewId) => {
    open(id);
    setMoreOpen(false);
  };

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] rounded-2xl border border-white/10 bg-ink-800 p-2 shadow-2xl"
          >
            {secondary.map((v) => (
              <button key={v.id} role="menuitem" onClick={() => pick(v.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${active === v.id ? "bg-accent-500/15 text-accent-300" : "text-zinc-300"}`}>
                <v.icon size={18} />
                {v.label}
              </button>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                setTerminalOpen(!terminalOpen);
                setMoreOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${terminalOpen ? "bg-mint-400/10 text-mint-400" : "text-zinc-300"}`}
            >
              <SquareTerminal size={18} />
              Terminal
            </button>
          </div>
        </div>
      )}
      <nav aria-label="Vistas" className="relative z-50 flex h-[4.25rem] flex-none items-stretch border-t border-white/10 bg-ink-900 px-2 pb-[env(safe-area-inset-bottom)] box-content md:hidden">
        {primary.map((v) => {
          const on = active === v.id;
          return (
            <button key={v.id} onClick={() => pick(v.id)} aria-current={on} className={tab(on)}>
              {on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-500" />}
              <v.icon size={22} />
              {v.label}
            </button>
          );
        })}
        <button onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} aria-haspopup="menu" className={tab(moreActive || moreOpen || terminalOpen)}>
          {moreActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-500" />}
          <Ellipsis size={22} />
          Más
        </button>
      </nav>
    </>
  );
}

function useLimaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }).format(now);
}

export function StatusBar() {
  const { setPaletteOpen, terminalOpen, setTerminalOpen, active, theme, setTheme } = useWorkspace();
  const nextTheme = () => setTheme(themes[(themes.findIndex((t) => t.id === theme) + 1) % themes.length].id);
  const time = useLimaClock();
  return (
    <footer className="hidden h-7 flex-none items-center gap-4 border-t border-white/10 bg-ink-900 px-3 font-mono text-[11px] text-zinc-500 md:flex">
      <span className="inline-flex items-center gap-1.5"><GitBranch size={12} /> main</span>
      <span className="inline-flex items-center gap-1.5 text-mint-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-mint-400" />
        </span>
        disponible para prácticas y proyectos
      </span>
      <span className="ml-auto hidden items-center gap-1.5 lg:inline-flex"><MapPin size={12} /> Lima · {time}</span>
      <span className="hidden xl:inline">{viewById(active).file}</span>
      <button onClick={nextTheme} title="Cambiar al siguiente tema" className="inline-flex items-center gap-1.5 hover:text-zinc-200"><Palette size={12} /> {themeLabel(theme)}</button>
      <button onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-1.5 hover:text-zinc-200"><Command size={12} /> {modKey} K</button>
      <button onClick={() => setTerminalOpen(!terminalOpen)} className={`inline-flex items-center gap-1.5 hover:text-zinc-200 ${terminalOpen ? "text-mint-400" : ""}`}>
        <SquareTerminal size={12} /> terminal
      </button>
    </footer>
  );
}
