// Mini motor SQL en memoria para la consola del portafolio.
// Soporta: SELECT [DISTINCT] cols | * | COUNT(*) FROM t [WHERE a AND b OR c] [GROUP BY c] [ORDER BY c [DESC]] [LIMIT n]
// No pretende ser SQL completo: alcanza para explorar mis datos de forma real.

export type Cell = string | number | null;
export type Row = Record<string, Cell>;
export type Table = { name: string; description: string; columns: string[]; rows: Row[] };
export type QueryResult = { ok: true; columns: string[]; rows: Row[]; ms: number } | { ok: false; error: string };

type Cond = { col: string; op: string; value: Cell };

const SELECT_RE =
  /^select\s+(distinct\s+)?(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+group\s+by\s+(\w+))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/is;

const fail = (error: string): QueryResult => ({ ok: false, error });

function parseValue(raw: string): Cell | undefined {
  const t = raw.trim();
  const quoted = t.match(/^'(.*)'$|^"(.*)"$/s);
  if (quoted) return quoted[1] ?? quoted[2];
  if (/^null$/i.test(t)) return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return undefined;
}

function parseCond(raw: string): Cond | string {
  const m = raw.trim().match(/^(\w+)\s*(<>|!=|>=|<=|=|>|<|like)\s*(.+)$/i);
  if (!m) return `No pude interpretar la condición: ${raw.trim()}`;
  const value = parseValue(m[3]);
  if (value === undefined) return `Valor inválido en "${raw.trim()}". Los textos van entre comillas simples.`;
  return { col: m[1].toLowerCase(), op: m[2].toLowerCase(), value };
}

function test(cell: Cell, { op, value }: Cond): boolean {
  if (cell === null || value === null) return op === "=" ? cell === value : op === "!=" || op === "<>" ? cell !== value : false;
  if (op === "like") {
    const pattern = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
    return new RegExp(`^${pattern}$`, "i").test(String(cell));
  }
  const bothNumbers = typeof cell === "number" && typeof value === "number";
  const a = bothNumbers ? cell : String(cell).toLowerCase();
  const b = bothNumbers ? value : String(value).toLowerCase();
  switch (op) {
    case "=": return a === b;
    case "!=":
    case "<>": return a !== b;
    case ">": return a > b;
    case "<": return a < b;
    case ">=": return a >= b;
    case "<=": return a <= b;
    default: return false;
  }
}

const compare = (a: Cell, b: Cell) => {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es");
};

export function runQuery(sql: string, tables: Table[]): QueryResult {
  const started = performance.now();
  const text = sql.trim().replace(/;+\s*$/, "").replace(/\s+/g, " ");
  if (!text) return fail("Escribe una consulta. Prueba: SELECT * FROM proyectos");

  const m = text.match(SELECT_RE);
  if (!m) return fail("Solo entiendo consultas SELECT … FROM …  (ver los ejemplos de la izquierda).");

  const [, distinctRaw, selectRaw, tableRaw, whereRaw, groupRaw, orderRaw, dirRaw, limitRaw] = m;
  const table = tables.find((t) => t.name === tableRaw.toLowerCase());
  if (!table) return fail(`La tabla '${tableRaw}' no existe. Tablas: ${tables.map((t) => t.name).join(", ")}`);

  const known = (col: string) => table.columns.includes(col);
  const unknown = (col: string) => fail(`La columna '${col}' no existe en '${table.name}'. Disponibles: ${table.columns.join(", ")}`);

  // WHERE: grupos OR de condiciones AND
  let groups: Cond[][] = [];
  if (whereRaw) {
    for (const part of whereRaw.split(/\s+or\s+/i)) {
      const conds: Cond[] = [];
      for (const piece of part.split(/\s+and\s+/i)) {
        const c = parseCond(piece);
        if (typeof c === "string") return fail(c);
        if (!known(c.col)) return unknown(c.col);
        conds.push(c);
      }
      groups.push(conds);
    }
  }
  groups = groups.filter((g) => g.length);
  let rows = groups.length ? table.rows.filter((r) => groups.some((g) => g.every((c) => test(r[c.col], c)))) : table.rows;

  // SELECT
  const items = selectRaw.split(",").map((s) => s.trim());
  const cols: { kind: "col" | "count"; src: string; out: string }[] = [];
  for (const item of items) {
    if (item === "*") {
      table.columns.forEach((c) => cols.push({ kind: "col", src: c, out: c }));
      continue;
    }
    const count = item.match(/^count\(\s*\*\s*\)(?:\s+as\s+(\w+))?$/i);
    if (count) {
      cols.push({ kind: "count", src: "*", out: count[1]?.toLowerCase() ?? "total" });
      continue;
    }
    const col = item.match(/^(\w+)(?:\s+as\s+(\w+))?$/i);
    if (!col) return fail(`No pude interpretar '${item}' en el SELECT.`);
    const src = col[1].toLowerCase();
    if (!known(src)) return unknown(src);
    cols.push({ kind: "col", src, out: col[2]?.toLowerCase() ?? src });
  }

  const hasCount = cols.some((c) => c.kind === "count");
  const groupCol = groupRaw?.toLowerCase();
  if (groupCol && !known(groupCol)) return unknown(groupCol);
  if (hasCount || groupCol) {
    const bad = cols.find((c) => c.kind === "col" && c.src !== groupCol);
    if (bad) return fail(`Con COUNT(*) o GROUP BY, la columna '${bad.src}' debe ser la del GROUP BY.`);
    const buckets = new Map<Cell, Row[]>();
    for (const r of rows) {
      const key = groupCol ? r[groupCol] : "all";
      buckets.set(key, [...(buckets.get(key) ?? []), r]);
    }
    if (!groupCol && !buckets.size) buckets.set("all", []);
    rows = [...buckets.entries()].map(([key, list]) => {
      const out: Row = {};
      for (const c of cols) out[c.out] = c.kind === "count" ? list.length : key;
      return out;
    });
  } else {
    rows = rows.map((r) => Object.fromEntries(cols.map((c) => [c.out, r[c.src]])));
  }

  if (distinctRaw) {
    const seen = new Set<string>();
    rows = rows.filter((r) => {
      const k = JSON.stringify(cols.map((c) => r[c.out]));
      return seen.has(k) ? false : (seen.add(k), true);
    });
  }

  // ORDER BY (sobre las columnas de salida)
  if (orderRaw) {
    const key = orderRaw.toLowerCase();
    if (!cols.some((c) => c.out === key)) return fail(`ORDER BY '${key}': esa columna no está en el resultado.`);
    const dir = dirRaw?.toLowerCase() === "desc" ? -1 : 1;
    rows = [...rows].sort((a, b) => compare(a[key], b[key]) * dir);
  }
  if (limitRaw) rows = rows.slice(0, Number(limitRaw));

  return { ok: true, columns: cols.map((c) => c.out), rows, ms: Math.max(0.1, performance.now() - started) };
}
