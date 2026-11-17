import { useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { Briefcase, MapPin, Workflow } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { experience } from "../../data/profile";
import { pipelineEdges, pipelineNodes, type PipelineNode } from "../../data/workspace";
import { Panel } from "../Panel";

const job = experience[0];
const W = 124;
const H = 58;
const nodeById = Object.fromEntries(pipelineNodes.map((n) => [n.id, n]));

const kindColor: Record<PipelineNode["kind"], string> = {
  source: "var(--color-chart-4)",
  process: "var(--color-chart-2)",
  serve: "var(--color-chart-1)",
  consume: "var(--color-chart-3)",
};
const kindLabel: Record<PipelineNode["kind"], string> = {
  source: "Fuente",
  process: "Procesamiento",
  serve: "Servicio",
  consume: "Consumo",
};

const edgePath = (from: PipelineNode, to: PipelineNode) => {
  const x1 = from.x + W / 2;
  const x2 = to.x - W / 2;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${from.y} C${mx} ${from.y} ${mx} ${to.y} ${x2} ${to.y}`;
};

function Diagram({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 780 300" className="mx-auto min-w-[640px]" role="group" aria-label="Diagrama del flujo de datos">
        {pipelineEdges.map(([a, b], i) => {
          const d = edgePath(nodeById[a], nodeById[b]);
          const active = selected === a || selected === b;
          return (
            <g key={`${a}-${b}`}>
              <path d={d} fill="none" style={{ stroke: active ? "var(--t-accent)" : "var(--t-line)" }} strokeWidth={active ? 2 : 1.5} strokeDasharray="4 5" />
              {!reduced && (
                <circle r="3.2" style={{ fill: "var(--t-secondary)" }}>
                  <animateMotion dur="2.6s" begin={`-${i * 0.45}s`} repeatCount="indefinite" path={d} />
                </circle>
              )}
            </g>
          );
        })}
        {pipelineNodes.map((n) => {
          const on = selected === n.id;
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${n.label}: ${n.sub}`}
              onClick={() => onSelect(n.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(n.id))}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-white"
            >
              <rect
                x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx="12"
                style={{ fill: on ? "color-mix(in srgb, var(--t-accent) 16%, var(--t-elevated))" : "var(--t-elevated)", stroke: on ? "var(--t-accent)" : "var(--t-line)" }}
                strokeWidth={on ? 1.8 : 1}
              />
              <circle cx={n.x - W / 2 + 14} cy={n.y - 11} r="3.5" style={{ fill: kindColor[n.kind] }} />
              <text x={n.x - W / 2 + 24} y={n.y - 7} style={{ fill: "var(--color-zinc-100)" }} fontSize="12.5" fontWeight="600" fontFamily="var(--font-display)">{n.label}</text>
              <text x={n.x - W / 2 + 14} y={n.y + 14} style={{ fill: "var(--t-comment)" }} fontSize="9.5" fontFamily="var(--font-mono)">{n.sub}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Detail({ node }: { node: PipelineNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="space-y-4 p-5"
      >
        <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: kindColor[node.kind] }}>
          <span className="h-2 w-2 rounded-full" style={{ background: kindColor[node.kind] }} />
          {kindLabel[node.kind]}
        </div>
        <h3 className="font-display text-xl font-medium text-white">{node.label}</h3>
        {node.metric && (
          <div className="inline-flex items-baseline gap-3 rounded-lg border border-mint-400/25 bg-mint-400/[0.06] px-4 py-2.5">
            <span className="font-display text-3xl font-medium text-mint-400">{node.metric.value}</span>
            <span className="text-xs text-zinc-400">{node.metric.label}</span>
          </div>
        )}
        <p className="text-sm leading-relaxed text-zinc-300">{job.bullets[node.bullet]}</p>
        {node.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {node.stack.map((s) => <Badge key={s}>{s}</Badge>)}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function Experience() {
  const [selected, setSelected] = useState("etl");
  const node = nodeById[selected];

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-12">
      <Panel title="ultimo_rol.json" icon={Briefcase} className="lg:col-span-12" bodyClassName="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-medium text-white sm:text-2xl">{job.role}</h1>
          <p className="text-sm text-zinc-400">{job.company} · {job.area}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-zinc-500">
          <span className="text-mint-400">{job.period}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={12} />{job.location}</span>
        </div>
      </Panel>

      <Panel title="pipeline.flow · clic en un nodo" icon={Workflow} className="lg:col-span-8" bodyClassName="p-4">
        <Diagram selected={selected} onSelect={setSelected} />
        <p className="mt-1 text-center font-mono text-[11px] text-zinc-600 sm:hidden">desliza el diagrama para ver todo el flujo →</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 font-mono text-[11px] text-zinc-500">
          {(Object.keys(kindColor) as PipelineNode["kind"][]).map((k) => (
            <li key={k} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: kindColor[k] }} />{kindLabel[k]}</li>
          ))}
        </ul>
      </Panel>

      <Panel title={`detalle/${node.id}`} className="lg:col-span-4">
        <Detail node={node} />
      </Panel>

      <Panel title="git log --logros" icon={Briefcase} className="lg:col-span-12" bodyClassName="divide-y divide-white/5">
        {job.bullets.map((b, i) => {
          const owner = pipelineNodes.find((n) => n.bullet === i)!;
          return (
            <button key={i} onClick={() => setSelected(owner.id)} className="flex w-full gap-4 px-5 py-3 text-left transition-colors hover:bg-white/[0.03]">
              <span className="mt-0.5 flex-none font-mono text-xs text-accent-400">#{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-relaxed text-zinc-400">{b}</span>
            </button>
          );
        })}
        <div className="flex flex-wrap gap-2 p-5">
          {job.stack.map((s) => <Badge key={s}>{s}</Badge>)}
        </div>
      </Panel>
    </div>
  );
}
