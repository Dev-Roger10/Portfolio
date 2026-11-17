import { useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { MousePointerClick, Network } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { deviceById, devices, linkStyles, links, topologyStats, vlanById, vlans, type Device, type Link } from "../../data/topology";
import { Panel } from "../Panel";

const kindLabel = { router: "Router", switch: "Switch", pc: "PC" } as const;

/** Extremos de un enlace, desplazados en paralelo para los pares de EtherChannel. */
function endpoints(l: Link) {
  const a = deviceById(l.a)!;
  const b = deviceById(l.b)!;
  const off = l.offset ?? 0;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = (-(b.y - a.y) / len) * off;
  const ny = ((b.x - a.x) / len) * off;
  return { x1: a.x + nx, y1: a.y + ny, x2: b.x + nx, y2: b.y + ny };
}

function DeviceIcon({ d, active }: { d: Device; active: boolean }) {
  const stroke = active ? "var(--t-accent)" : "var(--t-line)";
  const fill = "var(--t-elevated)";
  const glyph = "var(--t-fg-dim)";
  if (d.kind === "router")
    return (
      <g>
        <circle r={34} style={{ fill, stroke, strokeWidth: active ? 4 : 2.5 }} />
        {/* flechas cruzadas al estilo del ícono de router de Cisco */}
        <path d="M-15 -15 L15 15 M15 -15 L-15 15 M8 15 H15 V8 M-8 -15 H-15 V-8 M15 -8 V-15 H8 M-15 8 V15 H-8" style={{ stroke: "var(--t-accent)", strokeWidth: 3.2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }} />
      </g>
    );
  if (d.kind === "switch")
    return (
      <g>
        <rect x={-44} y={-24} width={88} height={48} rx={9} style={{ fill, stroke, strokeWidth: active ? 4 : 2.5 }} />
        <path d="M-26 -7 H22 M14 -14 L22 -7 L14 0 M26 7 H-22 M-14 0 L-22 7 L-14 14" style={{ stroke: "var(--t-fn)", strokeWidth: 3.2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }} />
      </g>
    );
  const vlan = vlanById(d.vlan);
  return (
    <g>
      <rect x={-28} y={-24} width={56} height={38} rx={5} style={{ fill, stroke: active ? "var(--t-accent)" : vlan?.color, strokeWidth: active ? 4 : 2.5 }} />
      <rect x={-20} y={-17} width={40} height={24} rx={2} style={{ fill: vlan?.color, opacity: 0.25 }} />
      <path d="M-12 22 H12 M0 14 V22" style={{ stroke: glyph, strokeWidth: 3, strokeLinecap: "round" }} />
    </g>
  );
}

export function NetworkTopology() {
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState("R3-LIM");
  const [hover, setHover] = useState<string | null>(null);
  const focus = hover ?? selected;
  const device = deviceById(selected)!;
  const touches = (l: Link) => l.a === focus || l.b === focus;
  const wan = links.find((l) => l.kind === "serial")!;
  const w = endpoints(wan);

  return (
    <Panel
      title="topologia_redes_clinica.pkt"
      icon={Network}
      bodyClassName="flex flex-col"
    >
      <div className="min-w-0 border-b border-white/10">
        <div className="overflow-x-auto">
          <svg viewBox="60 0 2230 850" className="block w-full min-w-[720px] select-none" role="img" aria-label="Topología de red de dos sedes conectadas por un enlace WAN serial">
            {[
              { x: 80, w: 920, label: "SEDE LIM · VLAN 10-30" },
              { x: 1215, w: 1060, label: "SEDE CHI · VLAN 40-60" },
            ].map((s) => (
              <g key={s.label}>
                <rect x={s.x} y={14} width={s.w} height={822} rx={26} style={{ fill: "color-mix(in srgb, var(--t-accent) 3%, transparent)", stroke: "var(--t-line)", strokeDasharray: "10 10", strokeWidth: 2 }} />
                <text x={s.x + s.w - 28} y={812} textAnchor="end" style={{ fill: "var(--t-comment)", fontFamily: "var(--font-mono)", fontSize: 26, letterSpacing: 3 }}>{s.label}</text>
              </g>
            ))}

            {links.map((l, i) => {
              const s = linkStyles[l.kind];
              const p = endpoints(l);
              const color = l.kind === "access" ? vlanById(deviceById(l.b)?.vlan)?.color : s.color;
              const lit = touches(l);
              return (
                <line
                  key={i}
                  {...p}
                  style={{ stroke: color, strokeWidth: lit ? s.width + 1.5 : s.width, strokeDasharray: s.dash, opacity: lit ? 1 : 0.55, transition: "opacity .2s, stroke-width .2s" }}
                />
              );
            })}

            {/* Paquete viajando por la WAN entre sedes */}
            {!reduced && (
              <circle r={7} style={{ fill: "var(--color-chart-6)" }}>
                <animateMotion dur="2.6s" repeatCount="indefinite" path={`M${w.x1},${w.y1} L${w.x2},${w.y2} L${w.x1},${w.y1}`} />
              </circle>
            )}

            <text x={(w.x1 + w.x2) / 2} y={(w.y1 + w.y2) / 2 - 18} textAnchor="middle" style={{ fill: "var(--color-chart-6)", fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>WAN · PPP</text>
            <text x={(w.x1 + w.x2) / 2} y={(w.y1 + w.y2) / 2 + 34} textAnchor="middle" style={{ fill: "var(--t-comment)", fontFamily: "var(--font-mono)", fontSize: 20 }}>200.200.200.0/30</text>

            {links.filter((l) => l.label).map((l, i) => {
              const p = endpoints(l);
              const mx = (p.x1 + p.x2) / 2;
              const my = (p.y1 + p.y2) / 2;
              return (
                <text key={i} x={mx} y={my - 12} textAnchor="middle" style={{ fill: touches(l) ? "var(--t-fg)" : "var(--t-comment)", fontFamily: "var(--font-mono)", fontSize: 22, paintOrder: "stroke", stroke: "var(--t-panel)", strokeWidth: 6 }}>
                  {l.label}
                </text>
              );
            })}

            {devices.map((d) => {
              const on = d.id === selected;
              return (
                <g
                  key={d.id}
                  transform={`translate(${d.x} ${d.y}) scale(1.3)`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${kindLabel[d.kind]} ${d.id}`}
                  aria-pressed={on}
                  onClick={() => setSelected(d.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(d.id))}
                  onMouseEnter={() => setHover(d.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer outline-none [&:focus-visible_circle]:[stroke-width:6] [&:focus-visible_rect]:[stroke-width:6]"
                >
                  {on && <circle r={d.kind === "pc" ? 46 : 58} style={{ fill: "color-mix(in srgb, var(--t-accent) 14%, transparent)" }} />}
                  <DeviceIcon d={d} active={on || hover === d.id} />
                  <text y={d.kind === "router" ? 60 : d.kind === "switch" ? 50 : 46} textAnchor="middle" style={{ fill: on ? "var(--t-fg)" : "var(--t-fg-dim)", fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: on ? 700 : 500, paintOrder: "stroke", stroke: "var(--t-panel)", strokeWidth: 6 }}>
                    {d.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3 font-mono text-[11px] text-zinc-500">
          {(["routed", "trunk", "etherchannel", "serial"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <svg width="22" height="8" aria-hidden="true">
                {(k === "etherchannel" ? [1.5, 6.5] : [4]).map((y) => (
                  <line key={y} x1="0" y1={y} x2="22" y2={y} style={{ stroke: linkStyles[k].color, strokeWidth: k === "etherchannel" ? 1.6 : 3, strokeDasharray: linkStyles[k].dash ? "5 3" : undefined }} />
                ))}
              </svg>
              {linkStyles[k].name}
            </span>
          ))}
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          {vlans.slice(0, 3).map((v) => (
            <span key={v.id} className="inline-flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-sm" style={{ background: v.color }} />
              {v.name}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-600"><MousePointerClick size={12} /> clic en un equipo</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="grid grid-cols-4 border-b border-white/10 md:grid-cols-2 md:border-b-0 md:border-r">
          {topologyStats.map((s) => (
            <div key={s.label} className="flex flex-col justify-center border-white/10 px-2 py-3 text-center [&:nth-child(odd)]:border-r md:[&:nth-child(-n+2)]:border-b">
              <p className="font-display text-lg font-medium text-white">{s.value}</p>
              <p className="font-mono text-[10px] text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={device.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 p-4">
            <p className="font-mono text-[11px] text-mint-400">
              {kindLabel[device.kind]} · {device.model} · sede {device.site}
            </p>
            <h3 className="mt-1 font-mono text-lg font-medium text-white">{device.id}</h3>
            <p className="text-sm text-zinc-400">{device.role}</p>
            <dl className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {device.info.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] text-zinc-600">{k}</dt>
                  <dd className="font-mono text-[12.5px] text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </Panel>
  );
}
