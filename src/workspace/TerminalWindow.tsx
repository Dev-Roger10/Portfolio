import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m as motion, useDragControls } from "framer-motion";
import { education, experience, profile, projects, skillGroups } from "../data/profile";
import { sqlTables } from "../data/workspace";
import { runQuery, type Cell } from "./lib/sql";
import { useWorkspace } from "./context";
import { themeById, themeLabel, themes, themeVars } from "./themes";
import { isViewId, views } from "./views";

type Entry = { id: number; cmd?: string; ok?: boolean; path?: string; out: ReactNode };

const COMMANDS = ["help", "neofetch", "whoami", "ls", "cd", "cat", "sql", "theme", "clear", "exit"];
const SUGGESTIONS = ["neofetch", "cat proyectos", "sql SELECT area, COUNT(*) FROM skills GROUP BY area", "theme", "help"];
const BASE_PATH = "~/portafolio";
const pathOf = (dir: string) => (dir ? `${BASE_PATH}/${dir}` : BASE_PATH);

// El terminal siempre es una sesión de Kali Linux con zsh, sin importar el tema del sitio.
const HOST = "kali";
const SHELL = "zsh";

/** Línea superior del prompt de Kali: ┌──(usuario㉿host)-[ruta]. */
function PromptHead({ ok, path }: { ok: boolean; path: string }) {
  return (
    <p className="whitespace-pre text-accent-400">
      ┌──(<span className="font-bold">roger㉿{HOST}</span>)-[<span className="font-bold text-zinc-100">{path}</span>]
      {!ok && <span className="text-danger"> ✗</span>}
    </p>
  );
}

/** Lo que va justo antes del cursor: └─$ */
function PromptMark() {
  return <span className="mr-2 whitespace-pre text-accent-400">└─<span className="font-bold">$</span></span>;
}

// Completa con el primer comando (o "cat <tema>", "cd <vista>", "theme <id>") que empiece igual.
function completion(input: string): string {
  if (!input) return "";
  const lower = input.toLowerCase();
  const pool = [
    ...COMMANDS,
    ...["experiencia", "proyectos", "skills", "contacto"].map((t) => `cat ${t}`),
    ...views.map((v) => `cd ${v.id}`),
    "cd ..",
    ...themes.map((t) => `theme ${t.id}`),
  ];
  const hit = pool.find((c) => c.startsWith(lower) && c !== lower);
  return hit ? hit.slice(input.length) : "";
}

const C = {
  fn: "text-syn-fn",
  kw: "text-syn-keyword",
  str: "text-syn-string",
  num: "text-syn-number",
  dim: "text-syn-comment",
  ok: "text-mint-400",
  err: "text-danger",
  accent: "text-accent-400",
};

// La R del perfil hecha de cuadritos, con la forma de la R del favicon: marca fina arriba,
// lazo, cuerpo y una cola larga que termina en el azul de Kali. W = blanco, G = gris, B = azul.
const R_PIXELS = [
  ".W.....................",
  "..W....................",
  "..WW...................",
  "...W...................",
  "...WW..................",
  "....W..................",
  "...WWWWWWWW............",
  "..WWWWWWWWWWWW.........",
  ".WWW.W...WWWWWW........",
  "WWWW.......WWWW........",
  "WWW.........WWW........",
  "WWW........WWW.........",
  "WWW.......WWW..........",
  ".WW...WWW..............",
  ".WWG..WWWWWW...........",
  "..GG...WWWWWWW.........",
  "...GG....WWWWWWW.......",
  "....GG.....WWWWWW......",
  ".............WWWWWW....",
  "...............WWWWW...",
  ".................WWWB..",
  "...................BBB.",
  ".....................BB",
  "......................B",
];
const PIXEL_FILL: Record<string, string> = { W: "#f4f6fb", G: "#8f96a3", B: "var(--color-accent-400)" };

function LogoR() {
  const cell = 5;
  const pixels = R_PIXELS.flatMap((row, y) => [...row].flatMap((c, x) => (c === "." ? [] : [{ x, y, c }])));
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${23 * cell} ${24 * cell}`} className="hidden flex-none sm:block" style={{ width: 23 * 5, height: 24 * 5 }} shapeRendering="crispEdges">
      {pixels.map(({ x, y, c }) => (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} style={{ fill: PIXEL_FILL[c] }} />
      ))}
    </svg>
  );
}

/** Ficha del perfil; lee el tema activo para que "Tema" siga al selector. */
function Neofetch() {
  const { theme } = useWorkspace();
  const themeName = themeLabel(theme);
  const job = experience[0];
  const rows: [string, string][] = [
    ["Rol", "Developer + Data Analyst"],
    ["Experiencia", `${job.role}, ${job.company}`],
    ["Formación", `Ing. de Sistemas, ${education.period.split("·")[1]?.trim() ?? ""} (UPN)`],
    ...(["Backend", "Frontend", "Mobile", "Datos & BI", "Redes", "Linux y herramientas"] as const).map((t): [string, string] => [
      t,
      skillGroups.find((g) => g.title === t)?.items.join(", ") ?? "",
    ]),
    ["Ubicación", profile.location],
    ["Tema", themeName],
  ];
  return (
    <div className="flex flex-col gap-4 py-1 sm:flex-row sm:gap-6">
      <LogoR />
      <div className="min-w-0">
        <p>
          <span className={C.accent}>roger</span>
          <span className={C.dim}>@</span>
          <span className={C.ok}>kali</span>
        </p>
        <p className={C.dim}>{"─".repeat(22)}</p>
        {rows.map(([k, v]) => (
          <p key={k} className="leading-snug">
            <span className={`${C.kw} font-semibold`}>{k}</span>
            <span className={C.dim}>: </span>
            <span className="text-zinc-300">{v}</span>
          </p>
        ))}
        <p className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} className="h-3 w-5 rounded-sm" style={{ background: `var(--color-chart-${i})` }} />
          ))}
        </p>
      </div>
    </div>
  );
}

function AsciiTable({ columns, rows }: { columns: string[]; rows: Record<string, Cell>[] }) {
  const MAX = 26;
  const fmt = (v: Cell) => {
    const s = v === null ? "NULL" : String(v);
    return s.length > MAX ? `${s.slice(0, MAX - 1)}…` : s;
  };
  const shown = rows.slice(0, 8);
  const widths = columns.map((c) => Math.max(c.length, ...shown.map((r) => fmt(r[c]).length)));
  const sep = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  return (
    <div className="overflow-x-auto">
      <pre className="leading-snug">
        <span className={C.dim}>{sep}</span>
        {"\n"}
        <span className={C.dim}>|</span>
        {columns.map((c, i) => (
          <span key={c}>
            {" "}
            <span className={`${C.fn} font-semibold`}>{c.padEnd(widths[i])}</span>
            {" "}
            <span className={C.dim}>|</span>
          </span>
        ))}
        {"\n"}
        <span className={C.dim}>{sep}</span>
        {shown.map((r, ri) => (
          <span key={ri}>
            {"\n"}
            <span className={C.dim}>|</span>
            {columns.map((c, i) => {
              const v = r[c];
              const text = fmt(v);
              return (
                <span key={c}>
                  {" "}
                  <span className={typeof v === "number" ? C.num : v === null ? C.dim : C.str}>
                    {typeof v === "number" ? text.padStart(widths[i]) : text.padEnd(widths[i])}
                  </span>
                  {" "}
                  <span className={C.dim}>|</span>
                </span>
              );
            })}
          </span>
        ))}
        {"\n"}
        <span className={C.dim}>{sep}</span>
      </pre>
      <p className={C.dim}>
        {rows.length} fila{rows.length === 1 ? "" : "s"}
        {rows.length > shown.length ? ` (mostrando ${shown.length})` : ""} · <span className={C.fn}>↗</span> también abierta en la Consola SQL
      </p>
    </div>
  );
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const q = window.matchMedia("(min-width: 768px)");
    const on = () => setDesktop(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return desktop;
}

export function TerminalWindow() {
  const { terminalOpen, setTerminalOpen, open, runSql, theme, setTheme } = useWorkspace();
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 0, out: <Neofetch /> },
    { id: 1, out: <p className={C.dim}>Escribe <span className={C.fn}>help</span> para ver los comandos · <kbd>Tab</kbd> o <kbd>→</kbd> autocompleta · <kbd>↑</kbd> historial</p> },
  ]);
  const [input, setInput] = useState("");
  const [dir, setDir] = useState("");
  const [lastOk, setLastOk] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const history = useRef<string[]>([]);
  const histPos = useRef(0);
  const nextId = useRef(2);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bounds = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const desktop = useIsDesktop();
  const ghost = completion(input);
  const shell = SHELL;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [entries, minimized, maximized]);

  useEffect(() => {
    if (terminalOpen && !minimized) inputRef.current?.focus();
  }, [terminalOpen, minimized]);

  const execute = (raw: string): { ok: boolean; out: ReactNode } | null => {
    const [cmdRaw, ...rest] = raw.trim().split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(" ");
    const ok = (out: ReactNode) => ({ ok: true, out });
    const fail = (msg: string) => ({ ok: false, out: <p className={C.err}>{msg}</p> });

    switch (cmd) {
      case "":
        return ok(null);
      case "help": {
        const rows: [string, string, string][] = [
          ["neofetch", "", "resumen del perfil"],
          ["whoami", "", "quién soy"],
          ["ls", "", "vistas del workspace"],
          ["cd", "<vista>", "entra a una vista (cd .. para volver)"],
          ["cat", "<tema>", "experiencia · proyectos · skills · contacto"],
          ["sql", "<consulta>", "consulta mis datos y ve la tabla aquí"],
          ["theme", "[id]", "lista o cambia el tema de color"],
          ["clear", "", "limpia la pantalla"],
          ["exit", "", "cierra la terminal"],
        ];
        return ok(
          <div>
            {rows.map(([c, a, d]) => (
              <p key={c} className="whitespace-pre">
                <span className={C.fn}>{c.padEnd(9)}</span>
                <span className={C.str}>{a.padEnd(12)}</span>
                <span className={C.dim}>{d}</span>
              </p>
            ))}
          </div>,
        );
      }
      case "neofetch":
        return ok(<Neofetch />);
      case "whoami":
        return ok(
          <p>
            <span className="text-zinc-100">{profile.name}</span> <span className={C.dim}>·</span> <span className={C.kw}>{profile.role}</span>
          </p>,
        );
      case "ls":
        return ok(
          <p className="flex flex-wrap gap-x-5">
            {views.map((v) => (
              <span key={v.id} className={`${C.accent} font-semibold`}>{v.file}</span>
            ))}
          </p>,
        );
      case "cd": {
        if (arg === "" || arg === "~" || arg === ".." || arg === "../") {
          setDir("");
          return ok(null);
        }
        const target = arg.replace(/\/$/, "");
        if (!isViewId(target)) return fail(`cd: no existe el directorio: ${arg}. Prueba con ls.`);
        open(target);
        setDir(target);
        return ok(null);
      }
      case "cat":
        if (arg === "experiencia") {
          const job = experience[0];
          return ok(
            <div>
              <p><span className={C.kw}>{job.role}</span> <span className={C.dim}>@</span> <span className="text-zinc-100">{job.company}</span> <span className={C.dim}>({job.period})</span></p>
              {job.bullets.map((b) => <p key={b} className="pl-2"><span className={C.ok}>•</span> <span className="text-zinc-400">{b}</span></p>)}
            </div>,
          );
        }
        if (arg === "proyectos")
          return ok(
            <div>
              {projects.map((p, i) => (
                <p key={p.title}><span className={C.num}>{String(i + 1).padStart(2, "0")}</span> <span className="text-zinc-100">{p.title}</span> <span className={C.dim}>[{p.category}]</span></p>
              ))}
            </div>,
          );
        if (arg === "skills")
          return ok(
            <div>
              {skillGroups.map((g) => (
                <p key={g.title}><span className={`${C.kw} font-semibold`}>{g.title}</span><span className={C.dim}>: </span><span className={C.str}>{g.items.join(", ")}</span></p>
              ))}
            </div>,
          );
        if (arg === "contacto")
          return ok(
            <div>
              {[["email", profile.email], ["teléfono", profile.phone], ["linkedin", profile.linkedinLabel], ["github", profile.githubLabel]].map(([k, v]) => (
                <p key={k}><span className={C.fn}>{k.padEnd(9)}</span><span className={C.str}>"{v}"</span></p>
              ))}
            </div>,
          );
        return fail("cat: usa experiencia | proyectos | skills | contacto");
      case "sql": {
        if (!arg) return fail("sql: falta la consulta. Ej: sql SELECT * FROM proyectos");
        const r = runQuery(arg, sqlTables);
        if (!r.ok) return fail(`ERROR: ${r.error}`);
        runSql(arg); // deja la misma consulta lista en la consola SQL
        return ok(r.rows.length ? <AsciiTable columns={r.columns} rows={r.rows} /> : <p className={C.dim}>0 filas</p>);
      }
      case "theme": {
        if (!arg)
          return ok(
            <div>
              {themes.map((t) => (
                <p key={t.id}>
                  <span className={t.id === theme ? C.ok : C.dim}>{t.id === theme ? "●" : "○"}</span>{" "}
                  <span className={C.fn}>{t.id.padEnd(11)}</span>
                  <span className="text-zinc-300">{themeLabel(t.id)}</span>
                </p>
              ))}
              <p className={C.dim}>uso: theme &lt;id&gt;</p>
            </div>,
          );
        const t = themeById(arg.toLowerCase());
        if (!t) return fail(`theme: '${arg}' no existe. Prueba: ${themes.map((x) => x.id).join(", ")}`);
        setTheme(t.id);
        return ok(<p className={C.ok}>✓ tema cambiado a {themeLabel(t.id)}</p>);
      }
      case "clear":
        setEntries([]);
        return null;
      case "exit":
        setTerminalOpen(false);
        return null;
      default:
        return fail(`${shell}: comando no encontrado: ${cmdRaw}. Prueba 'help'.`);
    }
  };

  const submit = (raw: string) => {
    const result = execute(raw);
    if (raw.trim()) {
      history.current.push(raw);
      histPos.current = history.current.length;
    }
    if (result) {
      setLastOk(result.ok);
      setEntries((e) => [...e, { id: nextId.current++, cmd: raw, ok: result.ok, path: pathOf(dir), out: result.out }]);
    }
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit(input);
    else if ((e.key === "Tab" || (e.key === "ArrowRight" && e.currentTarget.selectionStart === input.length)) && ghost) {
      e.preventDefault();
      setInput(input + ghost);
    } else if (e.key === "Tab") e.preventDefault();
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      histPos.current = Math.max(0, histPos.current - 1);
      setInput(history.current[histPos.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      histPos.current = Math.min(history.current.length, histPos.current + 1);
      setInput(history.current[histPos.current] ?? "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  const dot = "group/dot flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-bold leading-none text-black/60";

  return (
    // El contenedor fijo hace de límite de arrastre; deja pasar los clics a la página.
    <div ref={bounds} className="pointer-events-none fixed inset-0 z-[90] flex items-end justify-end p-2 pb-[4.5rem] md:p-4 md:pb-10">
      <AnimatePresence>
        {terminalOpen && (
          <motion.div
            drag={desktop}
            dragControls={controls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={bounds}
            dragElastic={0}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={themeVars("kali") as React.CSSProperties}
            className={`theme-scope pointer-events-auto flex w-full flex-col overflow-hidden rounded-xl border border-white/15 bg-ink-950 font-mono text-[12.5px] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] transition-[width] duration-200 ${
              maximized ? "md:w-[min(920px,calc(100vw-2rem))]" : "md:w-[620px]"
            }`}
          >
            {/* Barra de título: los tres puntos funcionan (cerrar / minimizar / maximizar) */}
            <header
              onPointerDown={(e) => desktop && controls.start(e)}
              onDoubleClick={() => setMaximized((v) => !v)}
              className={`relative flex h-10 flex-none select-none items-center border-b border-white/10 bg-ink-900 px-3.5 ${desktop ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              <div className="group flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                <button onClick={() => setTerminalOpen(false)} aria-label="Cerrar terminal" className={`${dot} bg-danger`}><span className="opacity-0 group-hover:opacity-100">×</span></button>
                <button onClick={() => setMinimized((v) => !v)} aria-label="Minimizar" className={`${dot} bg-syn-number`}><span className="opacity-0 group-hover:opacity-100">−</span></button>
                <button onClick={() => { setMaximized((v) => !v); setMinimized(false); }} aria-label="Maximizar" className={`${dot} hidden bg-mint-400 md:flex`}><span className="opacity-0 group-hover:opacity-100">+</span></button>
              </div>
              <span className="pointer-events-none absolute inset-x-0 text-center text-[11.5px] text-zinc-500">
                <span className="text-zinc-300">roger@{HOST}</span>: {pathOf(dir)}
              </span>
              <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-600 sm:block">Ctrl D</kbd>
            </header>

            {!minimized && (
              <>
                <div
                  ref={scroller}
                  onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}
                  className={`overflow-y-auto px-4 py-3 leading-relaxed text-zinc-400 transition-[height] duration-200 ${maximized ? "h-[min(520px,60vh)]" : "h-[340px]"}`}
                >
                  {entries.map((e) => (
                    <div key={e.id} className="mb-2.5">
                      {e.cmd !== undefined &&
                        (
                          <>
                            <PromptHead ok path={e.path ?? BASE_PATH} />
                            <p className="break-all">
                              <PromptMark />
                              <span className="text-zinc-100">{e.cmd}</span>
                            </p>
                          </>
                        )}
                      {e.out}
                    </div>
                  ))}

                  <PromptHead ok={lastOk} path={pathOf(dir)} />
                  <div className="flex items-center">
                    <PromptMark />
                    <div className="relative min-w-0 flex-1">
                      {/* Sugerencia fantasma detrás del input */}
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre">
                        <span className="invisible">{input}</span>
                        <span className="text-zinc-600">{ghost}</span>
                      </div>
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        autoCapitalize="off"
                        aria-label="Comando"
                        className="relative w-full bg-transparent text-zinc-100 caret-accent-400 outline-none [caret-shape:block]"
                      />
                    </div>
                  </div>
                </div>

                {/* Comandos rápidos */}
                <div className="flex flex-none gap-1.5 overflow-x-auto border-t border-white/10 bg-ink-900/70 px-3 py-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="flex-none rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-accent-500/50 hover:text-zinc-100"
                    >
                      <span className={C.fn}>{s.split(" ")[0]}</span>
                      <span>{s.slice(s.split(" ")[0].length, 34)}{s.length > 34 ? "…" : ""}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
