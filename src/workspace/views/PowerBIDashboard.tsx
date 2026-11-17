import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Image as ImageIcon, Minus, Plus, RotateCcw, X, XCircle, ZoomIn } from "lucide-react";
import { calendarDax, daxMeasures, dimensions, factTable, monthly, reportPages, summary, years, type YearKey } from "../../data/expresoNacional";
import informesShot from "../../assets/dashboard/informes.webp";
import { Panel } from "../Panel";

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
const num = new Intl.NumberFormat("es-PE");
const soles = (v: number) => (v >= 1e6 ? `S/ ${(v / 1e6).toFixed(2)} M` : `S/ ${(v / 1e3).toFixed(0)} k`);

/* ---------- Controles ---------- */

type Metric = "ingresos" | "viajes";
const metricCol = { ingresos: 2, viajes: 3 } as const;
const metricFmt: Record<Metric, (v: number) => string> = { ingresos: soles, viajes: (v) => num.format(v) };

function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { key: T; label: string }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-white/10 bg-ink-950/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-md px-3 py-1 font-mono text-[11px] transition-colors ${value === o.key ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:text-zinc-200"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Evolución mensual ---------- */

function RevenueLine({ year, metric, compare }: { year: YearKey; metric: Metric; compare: boolean }) {
  const col = metricCol[metric];
  const fmt = metricFmt[metric];
  const data = useMemo(() => monthly.filter(([y]) => year === "all" || String(y) === year), [year]);
  // Mismos meses del año anterior, solo si existen todos.
  const prev = useMemo(() => {
    if (!compare || year === "all") return null;
    const rows = data.map(([, m]) => monthly.find((r) => r[0] === Number(year) - 1 && r[1] === m));
    return rows.every((r) => r !== undefined) ? (rows as typeof monthly) : null;
  }, [compare, year, data]);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const active = hover ?? pinned;

  const W = 760;
  const H = 280;
  const pad = { l: 52, r: 16, t: 32, b: 28 };
  const step = metric === "ingresos" ? 50000 : 20;
  const values = [...data.map((d) => d[col]), ...(prev ? prev.map((d) => d[col]) : [])];
  const max = Math.ceil(Math.max(...values) / step) * step;
  const min = Math.floor(Math.min(...values) / step) * step;
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const line = (rows: typeof monthly) => rows.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[col]).toFixed(1)}`).join(" ");
  const path = line(data);
  const ticks = [min, (min + max) / 2, max];
  const tickLabel = (t: number) => (metric === "ingresos" ? `${(t / 1000).toFixed(0)}k` : String(t));
  const peak = data.reduce((best, d, i) => (d[col] > data[best][col] ? i : best), 0);
  // Con todos los años muestro solo enero de cada uno; con un año, todos los meses.
  const showTick = (m: number) => year !== "all" || m === 1;

  const indexAt = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return 0;
    const px = ((clientX - box.left) / box.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, i));
  };

  // Teclado: ← → recorren los meses, Esc limpia la selección.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const stepKey = e.key === "ArrowRight" ? 1 : -1;
      setPinned((p) => Math.max(0, Math.min(data.length - 1, (p ?? (stepKey === 1 ? -1 : data.length)) + stepKey)));
    } else if (e.key === "Escape") setPinned(null);
  };

  const h = active !== null ? data[active] : null;
  const hp = active !== null && prev ? prev[active] : null;
  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full cursor-crosshair touch-pan-y outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
        tabIndex={0}
        onPointerMove={(e) => setHover(indexAt(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const i = indexAt(e.clientX);
          setPinned((p) => (p === i ? null : i));
        }}
        onKeyDown={onKey}
        role="img"
        aria-label={`${metric === "ingresos" ? "Ingresos" : "Viajes"} por mes. Pasa el cursor, haz clic o usa las flechas para ver cada mes.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} style={{ stroke: "var(--t-line)", strokeWidth: 1, opacity: 0.6 }} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" style={{ fill: "var(--t-comment)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{tickLabel(t)}</text>
          </g>
        ))}
        {data.map(([yy, m], i) =>
          showTick(m) ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" style={{ fill: "var(--t-comment)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
              {year === "all" ? yy : meses[m - 1]}
            </text>
          ) : null,
        )}
        <path d={`${path} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`} style={{ fill: "color-mix(in srgb, var(--t-accent) 10%, transparent)" }} />
        {prev && <path d={line(prev)} style={{ fill: "none", stroke: "var(--t-fg-dim)", strokeWidth: 1.5, strokeDasharray: "4 4", opacity: 0.7 }} />}
        <path d={path} style={{ fill: "none", stroke: "var(--t-accent)", strokeWidth: 2, strokeLinejoin: "round" }} />
        {data.length <= 24 && data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d[col])} r={3} style={{ fill: "var(--t-panel)", stroke: "var(--t-accent)", strokeWidth: 1.5 }} />
        ))}
        {active !== peak && (
          <g>
            <circle cx={x(peak)} cy={y(data[peak][col])} r={4} style={{ fill: "var(--t-accent)" }} />
            <text x={Math.min(Math.max(x(peak), pad.l + 40), W - pad.r - 40)} y={y(data[peak][col]) - 10} textAnchor="middle" style={{ fill: "var(--t-fg-dim)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
              máx. {fmt(data[peak][col])}
            </text>
          </g>
        )}
        {active !== null && h && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={pad.t} y2={H - pad.b} style={{ stroke: "var(--t-fg-dim)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <circle cx={x(active)} cy={y(h[col])} r={6} style={{ fill: "var(--t-accent)", stroke: pinned === active ? "var(--t-fg)" : "var(--t-panel)", strokeWidth: 2 }} />
          </g>
        )}
      </svg>
      <p className="mt-2 font-mono text-[11px] text-zinc-500">Pasa el cursor, haz clic para fijar un mes o usa ← →.</p>
      {active !== null && h && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 font-mono text-[11px] shadow-lg"
          style={{ left: `${Math.max(10, Math.min(90, (x(active) / W) * 100))}%` }}
        >
          <p className="text-zinc-500">{meses[h[1] - 1]} {h[0]}</p>
          <p className="text-zinc-100">{fmt(h[col])}</p>
          <p className="text-zinc-400">{metric === "ingresos" ? `${h[3]} viajes` : soles(h[2])}</p>
          {hp && <p className="mt-1 border-t border-white/10 pt-1 text-zinc-500">{fmt(hp[col])} en {hp[0]}</p>}
        </div>
      )}
    </div>
  );
}

/* ---------- Barras horizontales ---------- */

function Bars({ rows, format, of }: { rows: [string, number][]; format: (v: number) => string; of?: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const focus = hover ?? picked;
  const max = Math.max(...rows.map((r) => r[1]));
  const scale = of ?? max;
  const sorted = [...rows].sort((a, b) => b[1] - a[1]);
  return (
    <ul className="space-y-3">
      {sorted.map(([label, v]) => (
        <li
          key={label}
          role="button"
          tabIndex={0}
          aria-pressed={picked === label}
          onMouseEnter={() => setHover(label)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(label)}
          onBlur={() => setHover(null)}
          onClick={() => setPicked((p) => (p === label ? null : label))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPicked((p) => (p === label ? null : label));
            }
          }}
          className="grid cursor-pointer grid-cols-[104px_1fr_auto] items-center gap-3 rounded text-xs outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
        >
          <span className={`truncate ${focus === label ? "text-zinc-100" : "text-zinc-400"}`}>{label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${(v / scale) * 100}%`, background: v === max ? "var(--t-accent)" : "color-mix(in srgb, var(--t-fg) 30%, transparent)", opacity: focus && focus !== label ? 0.4 : 1 }} />
          </span>
          <span className="w-20 whitespace-nowrap text-right font-mono text-zinc-300">{format(v)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Estado del servicio ---------- */

const statusMeta = {
  "A Tiempo": { color: "var(--t-secondary)", Icon: CheckCircle2 },
  "Con Retraso": { color: "var(--t-number)", Icon: Clock3 },
  Cancelado: { color: "var(--t-danger)", Icon: XCircle },
} as const;

function StatusBar({ estado }: { estado: Record<string, number> }) {
  const [focus, setFocus] = useState<keyof typeof statusMeta | null>(null);
  const total = Object.values(estado).reduce((a, b) => a + b, 0);
  const order = ["A Tiempo", "Con Retraso", "Cancelado"] as const;
  const shown = focus ?? "A Tiempo";
  return (
    <div>
      <p className="text-xs text-zinc-400">{shown === "A Tiempo" ? "Viajes a tiempo" : shown === "Con Retraso" ? "Viajes con retraso" : "Viajes cancelados"}</p>
      <p className="mt-1 font-display text-4xl font-medium tabular-nums text-zinc-100">
        {((estado[shown] / total) * 100).toFixed(1)}<span className="ml-0.5 text-xl text-zinc-500">%</span>
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{num.format(estado[shown])} de {num.format(total)} viajes</p>

      <div className="mt-5 flex h-2.5 gap-[2px] overflow-hidden rounded-full" onMouseLeave={() => setFocus(null)}>
        {order.map((k) => (
          <span
            key={k}
            onMouseEnter={() => setFocus(k)}
            style={{ width: `${(estado[k] / total) * 100}%`, background: statusMeta[k].color, opacity: focus && focus !== k ? 0.3 : 1 }}
            className="transition-[width,opacity] duration-300"
          />
        ))}
      </div>
      <ul className="mt-4 space-y-1" onMouseLeave={() => setFocus(null)}>
        {order.map((k) => {
          const { color: c, Icon } = statusMeta[k];
          return (
            <li key={k}>
              <button
                onMouseEnter={() => setFocus(k)}
                onFocus={() => setFocus(k)}
                onBlur={() => setFocus(null)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none transition-colors focus-visible:ring-1 focus-visible:ring-accent-500 ${focus === k ? "bg-white/[0.06] text-zinc-100" : "text-zinc-400"}`}
              >
                <Icon size={13} style={{ color: c }} />
                <span className="flex-1 text-left">{k}</span>
                <span className="font-mono tabular-nums text-zinc-300">{((estado[k] / total) * 100).toFixed(1)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Capturas del reporte real ---------- */

// Las capturas grandes se sirven desde Cloudinary para no inflar el repositorio ni el build.
const CDN = "https://res.cloudinary.com/ci1sb7sd/image/upload/v1794935552";
const menuShot = `${CDN}/menu-DMPmfe5J.webp`;
const generalShot = `${CDN}/dashboard-general-CV6rm9tS.webp`;
const detalleShot = `${CDN}/dashboard-detalle-BKB3QrYy.webp`;
const viajesShot = `${CDN}/detalle-viajes-OVZ-SQMP.webp`;

const shots = [
  { name: "Menú", src: menuShot, w: 781, h: 437, alt: "Portada del reporte con la marca Expreso Nacional y botones de navegación" },
  { name: "Informes", src: informesShot, w: 783, h: 435, alt: "Índice de reportes con los botones Menu, Informes, D.General y D.Detalle" },
  { name: "D. General", src: generalShot, w: 782, h: 438, alt: "Dashboard general con KPIs, ingresos por mes, viajes por servicio y por medio de pago, matriz origen destino e ingresos por agencia" },
  { name: "D. Detalle", src: detalleShot, w: 782, h: 440, alt: "Dashboard de detalle con gasto de combustible, pasajeros por tipo de servicio y por origen" },
  { name: "Detalle de viajes", src: viajesShot, w: 783, h: 442, alt: "Árbol de descomposición de viajes por agencia de destino, agencia de origen, origen y destino" },
];
const shotDetail: Record<string, string> = Object.fromEntries(reportPages.map((p) => [p.name, p.detail]));

const ZOOM_MAX = 5;

/** Imagen con zoom: rueda, pellizco, doble clic/toque, botones +/- y arrastre para moverla. */
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);

  // El desplazamiento nunca deja ver fuera de la imagen.
  const clamp = (s: number, x: number, y: number) => {
    const b = box.current;
    const i = img.current;
    if (!b || !i) return { s, x, y };
    const mx = Math.max(0, (i.offsetWidth * s - b.clientWidth) / 2);
    const my = Math.max(0, (i.offsetHeight * s - b.clientHeight) / 2);
    return { s, x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };
  // Zoom manteniendo fijo el punto (cx, cy), medido desde el centro del visor.
  const zoomAt = (next: (s: number) => number, cx = 0, cy = 0) =>
    setT((p) => {
      const s = Math.min(ZOOM_MAX, Math.max(1, next(p.s)));
      if (s === 1) return { s: 1, x: 0, y: 0 };
      const k = s / p.s;
      return clamp(s, cx - (cx - p.x) * k, cy - (cy - p.y) * k);
    });
  const fromCenter = (clientX: number, clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current > 0) {
        const c = fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
        const ratio = d / pinch.current;
        zoomAt((s) => s * ratio, c.x, c.y);
      }
      pinch.current = d;
    } else if (pointers.current.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setT((p) => (p.s > 1 ? clamp(p.s, p.x + dx, p.y + dy) : p));
    }
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinch.current = 0;
  };

  const btn = "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10";
  return (
    <div onClick={(e) => e.stopPropagation()} className="flex h-full min-h-0 min-w-0 flex-1 flex-col items-center gap-3 self-stretch">
      <div
        ref={box}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={(e) => {
          const c = fromCenter(e.clientX, e.clientY);
          zoomAt((s) => s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), c.x, c.y);
        }}
        onDoubleClick={(e) => {
          const c = fromCenter(e.clientX, e.clientY);
          zoomAt((s) => (s > 1 ? 1 : 2.5), c.x, c.y);
        }}
        className={`flex min-h-0 w-full flex-1 touch-none select-none items-center justify-center overflow-hidden rounded-lg ${t.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      >
        <img
          ref={img}
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})` }}
          className="max-h-full min-w-0 max-w-full rounded-lg object-contain will-change-transform"
        />
      </div>
      <div className="flex items-center gap-2" role="group" aria-label="Zoom">
        <button onClick={() => zoomAt((s) => s / 1.5)} disabled={t.s <= 1} aria-label="Alejar" className={btn}><Minus size={16} /></button>
        <span className="w-12 text-center font-mono text-xs text-zinc-300">{Math.round(t.s * 100)}%</span>
        <button onClick={() => zoomAt((s) => s * 1.5)} disabled={t.s >= ZOOM_MAX} aria-label="Acercar" className={btn}><Plus size={16} /></button>
        <button onClick={() => zoomAt(() => 1)} disabled={t.s <= 1} aria-label="Restablecer zoom" className={btn}><RotateCcw size={15} /></button>
      </div>
    </div>
  );
}

export function ReportGallery() {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const shot = shots[i];
  const go = (step: number) => setI((v) => (v + step + shots.length) % shots.length);

  // Con la captura ampliada: Esc la cierra y las flechas pasan a la anterior o la siguiente.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const arrow = "flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100";
  const onKey = (e: React.KeyboardEvent) => {
    if (zoom) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <Panel title="capturas_reporte.png" icon={ImageIcon} bodyClassName="p-4 sm:p-5">
      <div tabIndex={0} onKeyDown={onKey} aria-label="Galería de capturas del reporte. Usa las flechas del teclado para cambiar de captura." className="space-y-4 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-accent-500/60">
        <button onClick={() => setZoom(true)} aria-label={`Ampliar captura: ${shot.name}`} className="group relative block w-full overflow-hidden rounded-lg border border-white/10 bg-ink-950">
          <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" decoding="async" className="block h-auto w-full" />
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn size={12} /> ampliar
          </span>
        </button>

        <div className="flex items-center justify-center gap-3" role="group" aria-label="Páginas del reporte">
          <button onClick={() => go(-1)} aria-label="Captura anterior" className={arrow}>
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-[10rem] text-center">
            <p className="truncate text-sm font-medium text-zinc-100">{shot.name}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              {shots.map((s2, idx) => (
                <button
                  key={s2.name}
                  onClick={() => setI(idx)}
                  aria-label={`Ir a ${s2.name}`}
                  aria-current={idx === i}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${idx === i ? "w-6 bg-accent-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
          </div>
          <button onClick={() => go(1)} aria-label="Captura siguiente" className={arrow}>
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="text-center font-mono text-[11px] text-zinc-600">También puedes usar ← → del teclado</p>
        {shotDetail[shot.name] && <p className="text-xs leading-relaxed text-zinc-400">{shotDetail[shot.name]}</p>}

        {zoom && (
          <div role="dialog" aria-modal="true" aria-label={shot.name} onClick={() => setZoom(false)} className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/85 p-4">
            <button onClick={() => setZoom(false)} aria-label="Cerrar" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X size={18} />
            </button>
            <div className="flex min-h-0 w-full flex-1 items-center justify-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Captura anterior" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <ChevronLeft size={20} />
              </button>
              <ZoomImage key={shot.src} src={shot.src} alt={shot.alt} />
              <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Captura siguiente" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <ChevronRight size={20} />
              </button>
            </div>
            <p onClick={(e) => e.stopPropagation()} className="text-center font-mono text-xs text-zinc-300">{shot.name} · {i + 1} / {shots.length} · rueda o pellizco para zoom, doble clic para acercar</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* ---------- Dashboard ---------- */

function Card({ title, note, action, children, className = "" }: { title: string; note?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-white/10 bg-white/[0.02] p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
        {action ?? (note && <span className="font-mono text-[11px] text-zinc-500">{note}</span>)}
      </div>
      {children}
    </section>
  );
}

type Change = { pct: number; label: string } | null;

/** Variación contra el año anterior, comparando los mismos meses (2025 llega solo hasta junio). */
function yearChange(year: YearKey, col: 2 | 3): Change {
  if (year === "all") return null;
  const y = Number(year);
  const cur = monthly.filter((m) => m[0] === y);
  const months = new Set(cur.map((m) => m[1]));
  const prev = monthly.filter((m) => m[0] === y - 1 && months.has(m[1]));
  if (!prev.length) return null;
  const a = cur.reduce((n, m) => n + m[col], 0);
  const b = prev.reduce((n, m) => n + m[col], 0);
  return { pct: ((a - b) / b) * 100, label: y === 2025 ? `vs ene-jun ${y - 1}` : `vs ${y - 1}` };
}

function Delta({ change }: { change: Change }) {
  if (!change) return <p className="mt-1 font-mono text-[11px] text-zinc-500">ene 2022 - jun 2025</p>;
  const up = change.pct >= 0;
  return (
    <p className="mt-1 font-mono text-[11px] text-zinc-500">
      <span className={up ? "text-mint-400" : "text-danger"}>{up ? "+" : "-"}{Math.abs(change.pct).toFixed(1)}%</span> {change.label}
    </p>
  );
}

function Stat({ label, value, change, unit }: { label: string; value: string; change?: Change; unit?: string }) {
  return (
    <div className="bg-ink-900 px-4 py-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-medium tabular-nums text-zinc-100">
        {value}
        {unit && <span className="ml-1 text-sm text-zinc-500">{unit}</span>}
      </p>
      {change !== undefined && <Delta change={change} />}
    </div>
  );
}

/* ---------- Estacionalidad: año por mes ---------- */

function Heatmap({ metric, year, onYear }: { metric: Metric; year: YearKey; onYear: (y: YearKey) => void }) {
  const col = metricCol[metric];
  const fmt = metricFmt[metric];
  const rows = [2022, 2023, 2024, 2025];
  const all = monthly.map((r) => r[col]);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const [hov, setHov] = useState<[number, number] | null>(null);
  const cell = (yy: number, m: number) => monthly.find((r) => r[0] === yy && r[1] === m);
  const hovered = hov ? cell(hov[0], hov[1]) : undefined;

  return (
    <div>
      <div className="grid grid-cols-[44px_repeat(12,minmax(0,1fr))] gap-1" onMouseLeave={() => setHov(null)}>
        <span />
        {meses.map((m) => (
          <span key={m} className="pb-1 text-center font-mono text-[10px] text-zinc-500">{m}</span>
        ))}
        {rows.map((yy) => (
          <Fragment key={yy}>
            <button
              onClick={() => onYear(year === String(yy) ? "all" : (String(yy) as YearKey))}
              aria-pressed={year === String(yy)}
              aria-label={`Filtrar por ${yy}`}
              className={`flex items-center font-mono text-[11px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-accent-500 ${year === String(yy) ? "text-accent-300" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              {yy}
            </button>
            {meses.map((_, mi) => {
              const r = cell(yy, mi + 1);
              if (!r) return <span key={mi} className="h-9 rounded border border-dashed border-white/10" />;
              const t = (r[col] - lo) / (hi - lo || 1);
              const dim = year !== "all" && year !== String(yy);
              return (
                <button
                  key={mi}
                  onMouseEnter={() => setHov([yy, mi + 1])}
                  onFocus={() => setHov([yy, mi + 1])}
                  onBlur={() => setHov(null)}
                  aria-label={`${meses[mi]} ${yy}: ${fmt(r[col])}`}
                  className={`h-9 rounded outline-none transition-opacity focus-visible:ring-1 focus-visible:ring-accent-500 ${dim ? "opacity-30" : ""}`}
                  style={{ background: `color-mix(in srgb, var(--t-accent) ${Math.round(10 + t * 75)}%, transparent)` }}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3 font-mono text-[11px] text-zinc-500">
        <p>{hov && hovered ? `${meses[hov[1] - 1]} ${hov[0]}: ${fmt(hovered[col])}` : "Pasa el cursor sobre un mes. Haz clic en un año para filtrar."}</p>
        <span className="hidden items-center gap-1.5 sm:inline-flex" aria-hidden="true">
          menos
          {[15, 35, 55, 75].map((p) => (
            <i key={p} className="h-2.5 w-4 rounded-sm" style={{ background: `color-mix(in srgb, var(--t-accent) ${p}%, transparent)` }} />
          ))}
          más
        </span>
      </div>
    </div>
  );
}

/* ---------- Económico contra Ejecutivo ---------- */

type Svc = Record<string, { viajes: number; pasajeros: number; combustible: number; ingresos: number }>;
const svcOptions = [
  { key: "ingresos", label: "Ingresos" },
  { key: "viajes", label: "Viajes" },
  { key: "pasajeros", label: "Pasajeros" },
  { key: "combustible", label: "Combustible" },
] as const;
type SvcKey = (typeof svcOptions)[number]["key"];

function ServiceSplit({ servicio, ocupBus }: { servicio: Svc; ocupBus: Record<string, number> }) {
  const [m, setM] = useState<SvcKey>("ingresos");
  const fmt = m === "ingresos" || m === "combustible" ? soles : (v: number) => num.format(v);
  const entries = Object.entries(servicio);
  const total = entries.reduce((n, [, v]) => n + v[m], 0);
  const lead = Math.max(...entries.map(([, v]) => v[m]));
  return (
    <div>
      <Segmented value={m} onChange={setM} label="Métrica del servicio" options={svcOptions.map((o) => ({ key: o.key, label: o.label }))} />
      <div className="mt-5 grid grid-cols-2 gap-4">
        {entries.map(([name, v]) => (
          <div key={name}>
            <p className="text-xs text-zinc-400">{name}</p>
            <p className="mt-1 font-display text-2xl font-medium tabular-nums text-zinc-100">{fmt(v[m])}</p>
            <p className="font-mono text-[11px] text-zinc-500">{((v[m] / total) * 100).toFixed(1)}% del total</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-2.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={entries.map(([n, v]) => `${n} ${((v[m] / total) * 100).toFixed(1)}%`).join(", ")}>
        {entries.map(([name, v]) => (
          <span
            key={name}
            className="transition-[width] duration-500"
            style={{ width: `${(v[m] / total) * 100}%`, background: v[m] === lead ? "var(--t-accent)" : "color-mix(in srgb, var(--t-fg) 30%, transparent)" }}
          />
        ))}
      </div>
      <div className="mt-6 border-t border-white/5 pt-5">
        <p className="mb-3 text-xs text-zinc-400">Ocupación por tipo de bus</p>
        <Bars rows={Object.entries(ocupBus)} format={(v) => `${v}%`} of={100} />
      </div>
    </div>
  );
}

/* Ruta con paradas: origen, línea punteada y destino. Pasa el cursor, haz clic o usa Enter para ver su peso en el total. */
function RouteList({ rutas, total }: { rutas: [string, string, number][]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const focus = hover ?? picked;
  const current = rutas.find(([o, d]) => o + d === focus);
  const max = Math.max(...rutas.map((r) => r[2]));
  const toggle = (key: string) => setPicked((p) => (p === key ? null : key));
  return (
    <div>
      <ul>
        {rutas.map(([o, d, n]) => {
          const key = o + d;
          const on = focus === key;
          return (
            <li
              key={key}
              role="button"
              tabIndex={0}
              aria-pressed={picked === key}
              onMouseEnter={() => setHover(key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(key)}
              onBlur={() => setHover(null)}
              onClick={() => toggle(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(key);
                }
              }}
              className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-white/5 py-2.5 outline-none transition-opacity first:border-t-0 first:pt-0 focus-visible:ring-1 focus-visible:ring-accent-500 md:grid-cols-[minmax(0,360px)_1fr_auto] ${focus && !on ? "opacity-40" : ""}`}
            >
              <div className={`flex items-center gap-2.5 text-xs ${on ? "text-zinc-100" : "text-zinc-300"}`}>
                <span className="w-[72px] flex-none truncate">{o}</span>
                <span aria-hidden="true" className="flex min-w-6 flex-1 items-center">
                  <i className="h-1.5 w-1.5 flex-none rounded-full border border-zinc-500" />
                  <i className={`h-px flex-1 border-t border-dashed ${on ? "border-accent-400" : "border-white/20"}`} />
                  <i className="h-1.5 w-1.5 flex-none rounded-full bg-accent-400" />
                </span>
                <span className="w-[72px] flex-none truncate text-right">{d}</span>
              </div>
              <span aria-hidden="true" className="hidden h-2 overflow-hidden rounded-full bg-white/[0.05] md:block">
                <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${(n / max) * 100}%`, background: n === max ? "var(--t-accent)" : "color-mix(in srgb, var(--t-fg) 30%, transparent)" }} />
              </span>
              <span className="w-8 text-right font-mono text-xs tabular-nums text-zinc-200">{n}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 min-h-4 border-t border-white/5 pt-3 font-mono text-[11px] text-zinc-500">
        {current ? `${current[0]} → ${current[1]}: ${current[2]} viajes, ${((current[2] / total) * 100).toFixed(1)}% del total` : "Pasa el cursor o haz clic en una ruta."}
      </p>
    </div>
  );
}

export function PowerBIDashboard() {
  const [year, setYear] = useState<YearKey>("all");
  const [metric, setMetric] = useState<Metric>("ingresos");
  const [compare, setCompare] = useState(false);
  const s = summary[year];
  const canCompare = year !== "all" && year !== "2022";
  const dirty = year !== "all" || metric !== "ingresos" || compare;
  const reset = () => {
    setYear("all");
    setMetric("ingresos");
    setCompare(false);
  };

  return (
    <Panel title="dashboard_interactivo" icon={BarChart3} bodyClassName="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-medium text-zinc-100">Expreso Nacional</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Transporte interprovincial · {year === "all" ? "ene 2022 - jun 2025" : year === "2025" ? "ene - jun 2025" : year}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && (
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100">
              <RotateCcw size={12} /> restablecer
            </button>
          )}
          <Segmented value={year} onChange={(y) => { setYear(y); if (y === "all" || y === "2022") setCompare(false); }} label="Filtrar por año" options={years} />
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <div className="bg-ink-900 px-5 py-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-zinc-400">Ingresos</p>
          <p className="mt-1.5 font-display text-4xl font-medium tabular-nums text-zinc-100">{soles(s.kpi.ingresos)}</p>
          <Delta change={yearChange(year, 2)} />
        </div>
        <Stat label="Viajes" value={num.format(s.kpi.viajes)} change={yearChange(year, 3)} />
        <Stat label="Pasajeros" value={num.format(s.kpi.pasajeros)} />
        <Stat label="Ocupación" value={`${s.kpi.ocupacion}%`} />
        <Stat label="Satisfacción" value={String(s.kpi.satisfaccion)} unit="/ 5" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card
          title={metric === "ingresos" ? "Ingresos por mes" : "Viajes por mes"}
          className="lg:col-span-8"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCompare((c) => !c)}
                disabled={!canCompare}
                aria-pressed={compare}
                title={canCompare ? "Superponer el año anterior" : "Elige 2023, 2024 o 2025 para comparar"}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${compare ? "border-white/20 bg-white/10 text-zinc-100" : "border-white/10 text-zinc-500 enabled:hover:text-zinc-200"}`}
              >
                vs año anterior
              </button>
              <Segmented value={metric} onChange={setMetric} label="Métrica del gráfico" options={[{ key: "ingresos", label: "Ingresos" }, { key: "viajes", label: "Viajes" }]} />
            </div>
          }
        >
          <RevenueLine key={year} year={year} metric={metric} compare={compare} />
        </Card>
        <Card title="Estado del servicio" className="lg:col-span-4">
          <StatusBar estado={s.estado} />
        </Card>

        <Card title={metric === "ingresos" ? "Estacionalidad de ingresos" : "Estacionalidad de viajes"} note="año por mes" className="lg:col-span-7">
          <Heatmap metric={metric} year={year} onYear={(y) => { setYear(y); if (y === "all" || y === "2022") setCompare(false); }} />
        </Card>
        <Card title="Económico contra ejecutivo" className="lg:col-span-5">
          <ServiceSplit servicio={s.servicio} ocupBus={s.ocupBus} />
        </Card>

        <Card title="Ingresos por agencia de origen" className="lg:col-span-7">
          <Bars rows={Object.entries(s.agencias)} format={soles} />
        </Card>
        <Card title="Medio de pago" note="viajes" className="lg:col-span-5">
          <Bars rows={Object.entries(s.pagos)} format={(v) => num.format(v)} />
        </Card>

        <Card title="Rutas con más viajes" note="viajes" className="lg:col-span-12">
          <RouteList rutas={s.rutas} total={s.kpi.viajes} />
        </Card>
      </div>

      <p className="font-mono text-[11px] text-zinc-600">
        Datos ficticios · rendimiento {s.kpi.kmL} km/L · {s.kpi.horas} h promedio por viaje
      </p>
    </Panel>
  );
}

/* ---------- Modelo, DAX y páginas ---------- */

// Resalta lo básico del DAX: funciones, columnas entre corchetes y nombres de tabla.
function Dax({ code }: { code: string }) {
  const parts = code.split(/(\b[A-Z]+(?=\()|\[[^\]]+\]|'[^']+'|\b(?:Detalle_Buses|Dim_\w+)\b|"[^"]*"|--.*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        const cls = /^[A-Z]+$/.test(p)
          ? "text-syn-fn"
          : p.startsWith("[")
            ? "text-syn-keyword"
            : p.startsWith('"')
              ? "text-syn-string"
              : p.startsWith("--")
                ? "text-syn-comment"
                : /^'|^Detalle_|^Dim_/.test(p)
                  ? "text-syn-number"
                  : "text-zinc-400";
        return <span key={i} className={cls}>{p}</span>;
      })}
    </>
  );
}

const tabs = ["modelo", "medidas", "páginas"] as const;

export function PowerBIModel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("modelo");
  // Coloco las dimensiones en círculo alrededor de la tabla de hechos.
  const cx = 360;
  const cy = 190;
  const nodes = dimensions.map((d, i) => {
    const a = (i / dimensions.length) * Math.PI * 2 - Math.PI / 2;
    return { ...d, x: cx + Math.cos(a) * 290, y: cy + Math.sin(a) * 150 };
  });

  return (
    <Panel
      title="modelo_de_datos"
      icon={BarChart3}
      right={
        <div className="flex gap-1" role="tablist">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded px-2 py-0.5 font-mono text-[11px] ${tab === t ? "bg-accent-500/15 text-accent-300" : "text-zinc-500 hover:text-zinc-200"}`}>
              {t}
            </button>
          ))}
        </div>
      }
      bodyClassName="p-4 sm:p-5"
    >
      {tab === "modelo" && (
        <div>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 720 380" className="mx-auto block w-full min-w-[560px] max-w-3xl" role="img" aria-label="Modelo estrella: Detalle_Buses en el centro con nueve dimensiones">
              {nodes.map((n) => (
                <g key={n.name}>
                  <line x1={cx} y1={cy} x2={n.x} y2={n.y} style={{ stroke: "var(--t-line)", strokeWidth: 1.5 }} />
                  {/* "1" del lado de la dimensión y "*" del lado de los hechos */}
                  <text x={cx + (n.x - cx) * 0.78} y={cy + (n.y - cy) * 0.78 - 4} textAnchor="middle" style={{ fill: "var(--t-comment)", fontSize: 11, fontFamily: "var(--font-mono)" }}>1</text>
                  <text x={cx + (n.x - cx) * 0.3} y={cy + (n.y - cy) * 0.3 - 4} textAnchor="middle" style={{ fill: "var(--t-comment)", fontSize: 11, fontFamily: "var(--font-mono)" }}>*</text>
                </g>
              ))}
              {nodes.map((n) => (
                <g key={n.name} transform={`translate(${n.x} ${n.y})`}>
                  <rect x={-74} y={-20} width={148} height={40} rx={7} style={{ fill: "var(--t-elevated)", stroke: "var(--t-line)", strokeWidth: 1.5 }} />
                  <text y={-3} textAnchor="middle" style={{ fill: "var(--t-fg)", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>{n.name}</text>
                  <text y={12} textAnchor="middle" style={{ fill: "var(--t-comment)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{n.values} valores</text>
                </g>
              ))}
              <g transform={`translate(${cx} ${cy})`}>
                <rect x={-86} y={-30} width={172} height={60} rx={9} style={{ fill: "color-mix(in srgb, var(--t-accent) 18%, var(--t-elevated))", stroke: "var(--t-accent)", strokeWidth: 2 }} />
                <text y={-5} textAnchor="middle" style={{ fill: "var(--t-fg)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{factTable.name}</text>
                <text y={13} textAnchor="middle" style={{ fill: "var(--t-fg-dim)", fontSize: 10.5, fontFamily: "var(--font-mono)" }}>{num.format(factTable.rows)} filas · {factTable.columns} columnas</text>
              </g>
            </svg>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Una tabla de hechos con cada viaje y nueve dimensiones creadas en Power Query a partir del mismo Excel (quitando columnas y duplicados). El calendario se genera con DAX:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-ink-950/60 p-3 font-mono text-[12px] leading-5"><Dax code={calendarDax} /></pre>
        </div>
      )}

      {tab === "medidas" && (
        <ul className="grid gap-2 lg:grid-cols-2">
          {daxMeasures.map((m) => (
            <li key={m.name} className={`rounded-lg border border-white/10 bg-ink-950/50 p-3 ${m.dax.includes("\n") ? "lg:col-span-2" : ""}`}>
              <p className="font-mono text-[11px] text-mint-400">{m.name} =</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre font-mono text-[12px] leading-5"><Dax code={m.dax} /></pre>
            </li>
          ))}
        </ul>
      )}

      {tab === "páginas" && (
        <ol className="space-y-2">
          {reportPages.map((p, i) => (
            <li key={p.name} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <span className="font-mono text-xs text-accent-400">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-medium text-zinc-100">{p.name}</p>
                <p className="text-xs leading-relaxed text-zinc-400">{p.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
