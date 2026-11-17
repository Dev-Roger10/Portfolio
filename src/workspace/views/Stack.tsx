import { useMemo, useState } from "react";
import { Briefcase, FolderGit2, Layers, Search } from "lucide-react";
import { TechIcon } from "../../components/ui/TechIcon";
import { projects, skillGroups } from "../../data/profile";
import { usageOf } from "../../data/workspace";
import { Panel } from "../Panel";
import { useWorkspace } from "../context";

const all = "Todas";

export function Stack() {
  const { open, setProjectIndex } = useWorkspace();
  const [area, setArea] = useState(all);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState({ name: "Python", area: "Backend" });

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skillGroups
      .filter((g) => area === all || g.title === area)
      .map((g) => ({ ...g, items: g.items.filter((i) => !q || i.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length);
  }, [area, query]);

  const usage = usageOf(selected.name);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_340px]">
      <Panel title="stack.matrix" icon={Layers} bodyClassName="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar tecnología…"
              aria-label="Filtrar tecnología"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-accent-500/60"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[all, ...skillGroups.map((g) => g.title)].map((t) => (
              <button
                key={t}
                aria-pressed={area === t}
                onClick={() => setArea(t)}
                className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  area === t ? "border-accent-500/50 bg-accent-500/15 text-accent-300" : "border-white/10 text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 && <p className="py-10 text-center text-sm text-zinc-600">Nada coincide con “{query}”.</p>}
        {items.map((g) => (
          <div key={g.title}>
            <h2 className="mb-2.5 font-mono text-[11px] text-zinc-600">{g.title}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {g.items.map((name) => {
                const on = selected.name === name;
                return (
                  <button
                    key={name}
                    aria-pressed={on}
                    onClick={() => setSelected({ name, area: g.title })}
                    className={`border-orbit flex items-center gap-2.5 rounded-lg border p-2 text-left text-[13px] transition-colors ${
                      on ? "border-accent-500/25 bg-accent-500/10 text-white" : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/25"
                    }`}
                  >
                    <TechIcon name={name} size={30} />
                    <span className="min-w-0 flex-1 leading-tight">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title={`inspector/${selected.name.toLowerCase().replace(/\W+/g, "_")}`} className="self-start lg:sticky lg:top-6" bodyClassName="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <TechIcon name={selected.name} size={44} />
          <div>
            <h2 className="font-display text-lg font-medium text-white">{selected.name}</h2>
            <p className="font-mono text-xs text-mint-400">{selected.area}</p>
          </div>
        </div>

        {usage.experience.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-mono text-[11px] text-zinc-600"><Briefcase size={12} /> En experiencia</h3>
          {(
            usage.experience.map((e) => (
              <button key={e} onClick={() => open("experiencia")} className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.05]">{e}</button>
            ))
          )}
        </div>
        )}

        {usage.projects.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-mono text-[11px] text-zinc-600"><FolderGit2 size={12} /> En proyectos</h3>
          {(
            <ul className="space-y-1.5">
              {usage.projects.map((title) => (
                <li key={title}>
                  <button
                    onClick={() => {
                      setProjectIndex(Math.max(0, usageProjectIndex(title)));
                      open("proyectos");
                    }}
                    className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.05]"
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}
      </Panel>
    </div>
  );
}

const usageProjectIndex = (title: string) => projects.findIndex((p) => p.title === title);
