import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Database, FileText, FolderGit2, GraduationCap, PieChart, RotateCcw } from "lucide-react";
import { Counter } from "../../components/ui/Counter";
import { RotatingText } from "../../components/ui/RotatingText";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { education, profile, skillGroups, stats } from "../../data/profile";
import { Panel } from "../Panel";
import { useWorkspace } from "../context";

const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)", "color-mix(in srgb, var(--color-chart-3) 55%, var(--t-fg))", "color-mix(in srgb, var(--color-chart-6) 55%, var(--t-fg))"];

type Seg = [text: string, className: string];

// Lo que se "escribe" en bienvenida.md, línea por línea, como si fuera código.
const intro: Seg[] = [["whoami", "text-syn-fn"]];
const heading: Seg[] = [["Hola, soy Roger Antezana", "text-white"]];
const lines: Seg[][] = [intro, heading];
const PAUSE = 9; // "teclas" de pausa entre líneas
const lengths = lines.map((l) => l.reduce((n, [t]) => n + t.length, 0));
const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((n, len) => n + len + PAUSE, 6));
const TOTAL = starts[starts.length - 1] + lengths[lengths.length - 1];

/** Avanza un contador de caracteres; con "reducir movimiento" muestra todo de una. */
function useTypewriter(total: number, speed = 30) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) {
      setN(total);
      return;
    }
    setN(0);
    const id = setInterval(() => setN((v) => (v >= total ? v : v + 1)), speed);
    return () => clearInterval(id);
  }, [total, speed, reduced, run]);

  return [n, () => setRun((r) => r + 1)] as const;
}

const Cursor = () => <span aria-hidden="true" className="cursor-blink ml-0.5 -mr-[0.6em] inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-accent-400" />;

/** Una línea tecleada: reserva el ancho final (texto invisible) para que nada salte. */
function TypedLine({ index, n, done }: { index: number; n: number; done: boolean }) {
  const visible = Math.max(0, Math.min(n - starts[index], lengths[index]));
  const typing = n >= starts[index] && n < starts[index] + lengths[index] + PAUSE && !done;
  const isLast = index === lines.length - 1;
  let left = visible;
  return (
    <span className="relative block">
      <span className="invisible">{lines[index].map(([t]) => t).join("")}</span>
      <span className="absolute inset-0">
        {lines[index].map(([t, cls], i) => {
          const part = t.slice(0, Math.max(0, left));
          left -= t.length;
          return part ? <span key={i} className={cls}>{part}</span> : null;
        })}
        {(typing || (done && isLast)) && <Cursor />}
      </span>
    </span>
  );
}

function Hero() {
  const { open, runSql } = useWorkspace();
  const [n, replay] = useTypewriter(TOTAL);
  const done = n >= TOTAL;
  // El resto aparece cuando termina de "compilar".
  const reveal = `transition-[opacity,transform] duration-500 ${done ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0"}`;

  return (
    <Panel
      title="bienvenida.md"
      icon={FileText}
      className="panel-featured lg:col-span-8"
      right={
        <>
          <span className={`hidden items-center gap-1.5 font-mono text-[11px] sm:inline-flex ${done ? "text-mint-400" : "text-syn-number"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-mint-400" : "animate-pulse bg-syn-number"}`} />
            {done ? "compilado" : "escribiendo…"}
          </span>
          <button onClick={replay} aria-label="Repetir animación" title="Repetir" className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-white/10 hover:text-zinc-100">
            <RotateCcw size={12} />
          </button>
        </>
      }
    >
      <div className="relative flex h-full flex-col gap-5 p-5 sm:p-7">
        <div className="relative flex items-center gap-4 sm:gap-5">
          <div className="min-w-0 flex-1">
            <p className="flex font-mono text-xs sm:text-sm">
              <span className="mr-2 select-none text-mint-400">$</span>
              <TypedLine index={0} n={n} done={done} />
            </p>
            <h1 aria-label="Hola, soy Roger Antezana" className="mt-1 font-display text-[clamp(1.6rem,1rem+2.6vw,2.6rem)] font-medium leading-tight">
              <TypedLine index={1} n={n} done={done} />
            </h1>
          </div>
        </div>

        <p className={`${reveal} relative max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base`}>
          {profile.tagline}
        </p>
        <div className={`${reveal} relative flex items-center gap-2 font-mono text-xs text-zinc-500 sm:text-sm`}>
          <span aria-hidden="true" className="text-mint-400">▸</span>
          <RotatingText items={profile.rotatingCapabilities} />
        </div>
        <div className={`${reveal} relative mt-auto flex flex-wrap gap-2.5 pt-1`}>
          <button onClick={() => open("proyectos")} className="group inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-400 transition-colors">
            <FolderGit2 size={15} /> Explorar proyectos
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button onClick={() => runSql("SELECT categoria, impacto_pct, descripcion\nFROM logros\nWHERE impacto_pct > 0\nORDER BY impacto_pct DESC")} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08]">
            <Database size={15} /> Consultar mis datos
          </button>
        </div>
      </div>
    </Panel>
  );
}

function Kpis() {
  return (
    <Panel title="kpis_clave" icon={BarChart3} className="lg:col-span-4" bodyClassName="flex flex-col divide-y divide-white/10">
      {stats.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-4 px-5 py-4">
          <span aria-hidden="true" className="h-10 w-1 flex-none rounded-full" style={{ background: palette[i] }} />
          <div className="w-20 flex-none font-display text-4xl font-medium text-white"><Counter value={s.value} suffix={s.suffix} /></div>
          <p className="text-sm leading-snug text-zinc-400">{s.label}</p>
        </div>
      ))}
    </Panel>
  );
}

function StackDonut() {
  const [hover, setHover] = useState<number | null>(null);
  const total = skillGroups.reduce((n, g) => n + g.items.length, 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const focus = hover === null ? null : skillGroups[hover];

  return (
    <Panel title="stack_por_area" icon={PieChart} className="lg:col-span-5" bodyClassName="flex flex-col items-center gap-5 p-5 sm:flex-row">
      <div className="relative h-40 w-40 flex-none">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          {skillGroups.map((g, i) => {
            const len = (g.items.length / total) * C;
            const el = (
              <circle
                key={g.title}
                cx="70" cy="70" r={R} fill="none"
                style={{ stroke: palette[i] }} strokeWidth={hover === i ? 20 : 14}
                strokeDasharray={`${len - 2} ${C - len + 2}`} strokeDashoffset={-offset}
                opacity={hover === null || hover === i ? 1 : 0.25}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-3xl font-medium text-white">{focus ? focus.items.length : total}</span>
          <span className="max-w-[80px] text-[11px] leading-tight text-zinc-500">{focus ? focus.title : "herramientas"}</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-1">
        {skillGroups.map((g, i) => (
          <li key={g.title} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="flex cursor-default items-center gap-2 text-zinc-400 hover:text-white">
            <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: palette[i] }} />
            <span className="flex-1 truncate">{g.title}</span>
            <span className="font-mono text-zinc-500">{g.items.length}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Readme() {
  return (
    <Panel title="sobre_mi.md" icon={FileText} className="lg:col-span-7" bodyClassName="space-y-3 p-5 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
      {profile.summary.map((p, i) => (
        <p key={i} className={i === 0 ? "text-zinc-200" : ""}>{p}</p>
      ))}
    </Panel>
  );
}

function Education() {
  return (
    <Panel title="formacion.json" icon={GraduationCap} className="lg:col-span-12" bodyClassName="space-y-4 p-5">
      <div>
        <p className="font-display text-base font-medium text-white">{education.degree}</p>
        <p className="text-sm text-zinc-400">{education.institution}</p>
        <p className="mt-1 font-mono text-xs text-mint-400">{education.period}</p>
      </div>
      <ul className="space-y-1.5 border-t border-white/10 pt-4 text-xs text-zinc-400">
        {education.extras.map((e) => (
          <li key={e} className="flex gap-2"><span className="text-accent-400">▸</span>{e}</li>
        ))}
      </ul>
      <p className="border-t border-white/10 pt-4 font-mono text-xs text-zinc-500">{education.languages.join(" · ")}</p>
    </Panel>
  );
}

export function Overview() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-12">
      <Hero />
      <Kpis />
      <Readme />
      <StackDonut />
      <Education />
    </div>
  );
}
