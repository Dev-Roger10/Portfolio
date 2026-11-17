import { useMemo, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { BarChart3, ChevronRight, Database, FileCode2, FolderGit2, FolderOpen, Layers, Network, ShoppingCart, type LucideIcon } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { projectFilters, projects } from "../../data/profile";
import { projectLayers } from "../../data/workspace";
import { Panel } from "../Panel";
import { NetworkTopology } from "./NetworkTopology";
import { PowerBIDashboard, PowerBIModel, ReportGallery } from "./PowerBIDashboard";
import { useWorkspace } from "../context";

const fileIcon: Record<string, LucideIcon> = { Datos: BarChart3, "Full-Stack": FileCode2, Transaccional: ShoppingCart, Redes: Network };
const layerColors = ["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-3)"];

export function Projects() {
  const { projectIndex, setProjectIndex, runSql } = useWorkspace();
  const [filter, setFilter] = useState<(typeof projectFilters)[number]>("Todos");

  const visible = useMemo(
    () => projects.map((p, i) => ({ p, i })).filter(({ p }) => filter === "Todos" || p.filter === filter),
    [filter],
  );
  const project = projects[projectIndex];
  const layers = projectLayers[project.filter];
  const Icon = fileIcon[project.filter] ?? FileCode2;

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[300px_1fr]">
      <Panel title="explorador" icon={FolderOpen} bodyClassName="p-2">
        <div className="flex flex-wrap gap-1.5 p-2">
          {projectFilters.map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                filter === f ? "border-accent-500/50 bg-accent-500/15 text-accent-300" : "border-white/10 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul role="listbox" aria-label="Proyectos">
          {visible.map(({ p, i }) => {
            const on = i === projectIndex;
            const I = fileIcon[p.filter] ?? FileCode2;
            return (
              <li key={p.title} role="option" aria-selected={on}>
                <button
                  onClick={() => setProjectIndex(i)}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${on ? "bg-accent-500/15" : "hover:bg-white/[0.04]"}`}
                >
                  <I size={15} className={`mt-0.5 flex-none ${on ? "text-accent-300" : "text-zinc-500"}`} />
                  <span className="min-w-0">
                    <span className={`block text-sm leading-snug ${on ? "text-white" : "text-zinc-300"}`}>{p.title}</span>
                    <span className="font-mono text-[11px] text-zinc-600">{p.category}</span>
                  </span>
                  {on && <ChevronRight size={14} className="ml-auto mt-1 flex-none text-accent-400" />}
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-zinc-600">Sin proyectos en esta categoría</li>}
        </ul>
      </Panel>

      <AnimatePresence mode="wait">
        <motion.div key={project.title} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid min-w-0 gap-4">
          <Panel title={`proyectos/${project.filter.toLowerCase()}/readme`} icon={Icon} bodyClassName="space-y-5 p-5 sm:p-6">
            <div>
              <span className="font-mono text-xs text-mint-400">{project.category}</span>
              <h1 className="mt-1 font-display text-xl font-medium text-white sm:text-2xl">{project.title}</h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">{project.description}</p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {project.highlights.map((h) => (
                <li key={h} className="rounded-lg border border-white/10 bg-white/[0.025] px-3.5 py-3 text-xs leading-snug text-zinc-300">
                  <span className="mb-1 block font-mono text-accent-400">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </Panel>

          {project.filter === "Redes" && <NetworkTopology />}
          {project.filter === "Datos" && (
            <>
              <ReportGallery />
              <PowerBIDashboard />
              <PowerBIModel />
            </>
          )}

          <Panel title="arquitectura.diagram" icon={Layers} bodyClassName="p-5">
            <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
              {layers.map((l, i) => (
                <li key={l.name} className="flex flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center">
                  <div className="flex-1 rounded-xl border bg-white/[0.02] p-4" style={{ borderColor: `color-mix(in srgb, ${layerColors[i]} 35%, transparent)` }}>
                    <p className="font-mono text-[11px]" style={{ color: layerColors[i] }}>{l.name}</p>
                    <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                      {l.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                  {i < layers.length - 1 && <ChevronRight size={18} className="mx-auto flex-none rotate-90 text-zinc-600 md:rotate-0" />}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="stack.config" icon={FolderGit2} bodyClassName="flex flex-wrap items-center gap-2 p-5">
            {project.stack.map((s) => <Badge key={s}>{s}</Badge>)}
            <button
              onClick={() => runSql(`SELECT nombre, tipo, tecnologias\nFROM proyectos\nWHERE id = ${projectIndex + 1}`)}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              <Database size={13} /> Ver en SQL
            </button>
          </Panel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
