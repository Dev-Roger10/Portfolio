import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Database, Play, Table2, TerminalSquare } from "lucide-react";
import { sqlExamples, sqlTables } from "../../data/workspace";
import { runQuery, type QueryResult } from "../lib/sql";
import { Panel } from "../Panel";
import { useWorkspace } from "../context";
import { modKey } from "../platform";

const KEYWORDS = /\b(select|from|where|group by|order by|limit|and|or|like|as|desc|asc|count)\b/gi;

function Highlighted({ code }: { code: string }) {
  const parts = code.split(/('[^']*'|\b\d+\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={part.startsWith("'") ? "text-syn-string" : "text-syn-number"}>{part}</span>
        ) : (
          part.split(KEYWORDS).map((seg, j) =>
            j % 2 === 1 ? <span key={j} className="text-syn-keyword">{seg.toUpperCase()}</span> : seg,
          )
        ),
      )}
      {"\n"}
    </>
  );
}

export function SqlConsole() {
  const { sql } = useWorkspace();
  const [query, setQuery] = useState(sqlExamples[0].query);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const run = (q: string) => {
    setQuery(q);
    setResult(runQuery(q, sqlTables));
  };

  // Corre la consulta inicial al abrir, y cualquier consulta enviada desde otra vista o la terminal.
  useEffect(() => {
    run(sql.nonce ? sql.query : sqlExamples[0].query);
    // eslint-disable-next-line
  }, [sql.nonce]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[260px_1fr]">
      <div className="grid content-start gap-4">
        <Panel title="esquema" icon={Database} bodyClassName="p-2">
          <ul>
            {sqlTables.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => setActiveTable(activeTable === t.name ? null : t.name)}
                  aria-expanded={activeTable === t.name}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/[0.04]"
                >
                  <Table2 size={14} className="flex-none text-mint-400" />
                  <span className="font-mono text-sm text-zinc-200">{t.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-zinc-600">{t.rows.length}</span>
                </button>
                {activeTable === t.name && (
                  <div className="mb-1 ml-5 border-l border-white/10 pl-4">
                    <p className="py-1 text-[11px] text-zinc-600">{t.description}</p>
                    {t.columns.map((c) => (
                      <button key={c} onClick={() => run(`SELECT ${c}\nFROM ${t.name}`)} className="block w-full py-0.5 text-left font-mono text-xs text-zinc-500 hover:text-accent-300">
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="consultas_guardadas" icon={TerminalSquare} bodyClassName="p-2">
          <ul>
            {sqlExamples.map((e) => (
              <li key={e.label}>
                <button onClick={() => run(e.query)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.04] ${query === e.query ? "text-white" : "text-zinc-400"}`}>
                  {e.label}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <Panel
          title="consulta.sql"
          icon={TerminalSquare}
          right={
            <button onClick={() => run(query)} className="inline-flex items-center gap-1.5 rounded-md bg-mint-400 px-2.5 py-1 font-mono text-[11px] font-medium text-ink-950 transition-colors hover:bg-mint-400/80">
              <Play size={11} fill="currentColor" /> Ejecutar <span className="hidden opacity-60 sm:inline">{modKey}↵</span>
            </button>
          }
        >
          <div className="relative min-h-[132px]">
            <pre ref={preRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-6 text-zinc-300">
              <Highlighted code={query} />
            </pre>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onScroll={(e) => preRef.current && (preRef.current.scrollTop = e.currentTarget.scrollTop)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  run(query);
                }
              }}
              spellCheck={false}
              aria-label="Editor SQL"
              rows={Math.max(5, query.split("\n").length + 1)}
              className="relative block w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-6 text-transparent caret-white outline-none selection:bg-accent-500/40"
            />
          </div>
        </Panel>

        <Panel
          title="resultado"
          icon={Table2}
          right={result?.ok && <span className="font-mono text-[11px] text-zinc-500">{result.rows.length} filas · {result.ms.toFixed(1)} ms</span>}
        >
          {result === null ? null : !result.ok ? (
            <div role="alert" className="flex items-start gap-3 p-5 text-sm text-danger">
              <AlertTriangle size={16} className="mt-0.5 flex-none" />
              {result.error}
            </div>
          ) : result.rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-600">0 filas. Ninguna coincide con el filtro.</p>
          ) : (
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-max border-collapse text-left text-[13px]">
                <thead className="sticky top-0 bg-ink-800">
                  <tr>
                    <th className="w-10 border-b border-white/10 px-3 py-2 font-mono text-[11px] font-normal text-zinc-600">#</th>
                    {result.columns.map((c) => (
                      <th key={c} className="border-b border-white/10 px-3 py-2 font-mono text-[11px] font-medium text-mint-400">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-b border-white/5 align-top hover:bg-white/[0.03]">
                      <td className="px-3 py-2 font-mono text-[11px] text-zinc-600">{i + 1}</td>
                      {result.columns.map((c) => {
                        const v = r[c];
                        return (
                          <td key={c} className={`max-w-[420px] px-3 py-2 ${typeof v === "number" ? "font-mono text-syn-number" : v === null ? "font-mono text-zinc-600" : "text-zinc-300"}`}>
                            {v === null ? "NULL" : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
