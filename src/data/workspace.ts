// Datos derivados de profile.ts para las vistas interactivas del workspace
// (pipeline, arquitecturas por proyecto, tablas de la consola SQL, uso de cada skill).
import { education, experience, projects, skillGroups } from "./profile";
import type { Row, Table } from "../workspace/lib/sql";

/* ---------- Pipeline de la experiencia ---------- */

export type PipelineNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  bullet: number; // índice en experience[0].bullets
  kind: "source" | "process" | "serve" | "consume";
  metric?: { value: string; label: string };
  stack: string[];
};

export const pipelineNodes: PipelineNode[] = [
  { id: "src", label: "Carteras", sub: "sector financiero", x: 70, y: 150, bullet: 0, kind: "source", stack: [] },
  {
    id: "etl", label: "ETL Python", sub: "extract · transform", x: 225, y: 150, bullet: 1, kind: "process",
    metric: { value: "−75%", label: "tiempo de procesamiento" }, stack: ["Python"],
  },
  {
    id: "sql", label: "SQL Server", sub: "queries + índices", x: 380, y: 150, bullet: 2, kind: "process",
    metric: { value: "−70%", label: "respuesta en reportes críticos" }, stack: ["SQL Server", "T-SQL"],
  },
  { id: "api", label: "API REST", sub: "FastAPI · Flask", x: 545, y: 70, bullet: 4, kind: "serve", stack: ["Python", "FastAPI", "Flask", "REST API"] },
  { id: "ui", label: "Angular", sub: "pagos y comisiones", x: 710, y: 70, bullet: 4, kind: "consume", stack: ["Angular"] },
  { id: "bi", label: "Power BI", sub: "dashboards + KPIs", x: 545, y: 230, bullet: 3, kind: "serve", stack: ["Power BI"] },
  { id: "kpi", label: "Gerencia", sub: "seguimiento semanal", x: 710, y: 230, bullet: 3, kind: "consume", stack: [] },
];

export const pipelineEdges: [string, string][] = [
  ["src", "etl"],
  ["etl", "sql"],
  ["sql", "api"],
  ["api", "ui"],
  ["sql", "bi"],
  ["bi", "kpi"],
];

/* ---------- Arquitectura por proyecto ---------- */

export type Layer = { name: string; items: string[] };

export const projectLayers: Record<string, Layer[]> = {
  Datos: [
    { name: "Origen", items: ["Excel DATA_BUSES", "Power Query: tipos y limpieza"] },
    { name: "Modelo", items: ["Esquema estrella", "Calendario en DAX", "12 medidas"] },
    { name: "Reporte", items: ["KPIs y tendencias", "Árbol de descomposición", "Segmentadores"] },
  ],
  "Full-Stack": [
    { name: "Presentación", items: ["Vistas Razor", "Bootstrap", "Menú según el rol"] },
    { name: "Controladores y servicios", items: ["ASP.NET Core MVC", "PrestamoService: reglas de préstamo"] },
    { name: "Datos", items: ["Entity Framework Core", "SQL Server"] },
  ],
  Transaccional: [
    { name: "Vistas", items: ["JSP", "Panel administrativo"] },
    { name: "Lógica", items: ["Servlets", "Pago simulado", "Reportes"] },
    { name: "Datos / Servidor", items: ["MySQL", "Apache Tomcat"] },
  ],
  Redes: [
    { name: "Acceso", items: ["VLAN 802.1Q", "Router-on-a-Stick", "DHCP"] },
    { name: "Distribución", items: ["HSRP", "EtherChannel"] },
    { name: "Núcleo / WAN", items: ["OSPF", "PPP entre sedes"] },
  ],
};

/* ---------- Tablas de la consola SQL ---------- */

const bulletMeta: { categoria: string; impacto_pct: number | null }[] = [
  { categoria: "Analítica", impacto_pct: null },
  { categoria: "ETL", impacto_pct: 75 },
  { categoria: "SQL", impacto_pct: 70 },
  { categoria: "BI", impacto_pct: null },
  { categoria: "Backend", impacto_pct: null },
];

const exp = experience[0];

const logros: Row[] = exp.bullets.map((descripcion, i) => ({
  id: i + 1,
  empresa: exp.company,
  categoria: bulletMeta[i].categoria,
  impacto_pct: bulletMeta[i].impacto_pct,
  descripcion,
}));

const proyectos: Row[] = projects.map((p, i) => ({
  id: i + 1,
  nombre: p.title,
  tipo: p.category,
  categoria: p.filter,
  n_tecnologias: p.stack.length,
  tecnologias: p.stack.join(", "),
}));

const skills: Row[] = skillGroups.flatMap((g) => g.items.map((nombre) => ({ nombre, area: g.title })));

const formacion: Row[] = [
  { tipo: "Carrera", nombre: education.degree, institucion: education.institution, detalle: education.period },
  ...education.extras.map((nombre) => ({ tipo: "Certificación", nombre, institucion: nombre.startsWith("Oracle Academy") ? "Oracle Academy" : /^(Cisco|Linux)/.test(nombre) ? "Cisco / NDG" : null, detalle: null })),
  ...education.languages.map((nombre) => ({ tipo: "Idioma", nombre, institucion: null, detalle: null })),
];

export const sqlTables: Table[] = [
  { name: "logros", description: "Resultados en Vértice Empresarial", columns: ["id", "empresa", "categoria", "impacto_pct", "descripcion"], rows: logros },
  { name: "proyectos", description: "Proyectos académicos y personales", columns: ["id", "nombre", "tipo", "categoria", "n_tecnologias", "tecnologias"], rows: proyectos },
  { name: "skills", description: "Stack técnico por área", columns: ["nombre", "area"], rows: skills },
  { name: "formacion", description: "Estudios, certificaciones e idiomas", columns: ["tipo", "nombre", "institucion", "detalle"], rows: formacion },
];

export const sqlExamples: { label: string; query: string }[] = [
  { label: "Impacto medible", query: "SELECT categoria, impacto_pct, descripcion\nFROM logros\nWHERE impacto_pct > 0\nORDER BY impacto_pct DESC" },
  { label: "Skills por área", query: "SELECT area, COUNT(*) AS herramientas\nFROM skills\nGROUP BY area\nORDER BY herramientas DESC" },
  { label: "Áreas del stack", query: "SELECT DISTINCT area\nFROM skills" },
  { label: "Stack de datos", query: "SELECT nombre\nFROM skills\nWHERE area = 'Datos & BI'" },
  { label: "Proyectos", query: "SELECT nombre, tipo, n_tecnologias\nFROM proyectos\nORDER BY n_tecnologias DESC" },
  { label: "Certificaciones", query: "SELECT nombre, institucion\nFROM formacion\nWHERE tipo = 'Certificación'" },
];

/* ---------- Dónde se usa cada skill ---------- */

// Alias entre el nombre en "skills" y cómo aparece en los stacks de experiencia/proyectos.
const aliases: Record<string, string[]> = {
  "sql / t-sql": ["t-sql", "sql server", "mysql"],
  "java web (servlets, jsp)": ["java web", "servlets", "jsp"],
  java: ["java web", "servlets", "jsp"],
  html5: ["html"],
  css3: ["css"],
  "cisco ios (ccna)": ["cisco ios"],
  "rest api": ["rest api"],
  kpis: ["kpi"],
  "query optimization": ["optimic"],
  "data analytics": ["analicé"],
  "arquitectura mvc": ["asp.net core mvc"],
};

export type Usage = { experience: string[]; projects: string[] };

export function usageOf(skill: string): Usage {
  const key = skill.toLowerCase();
  const terms = aliases[key] ?? [key];
  const inStack = (stack: string[]) => stack.some((s) => terms.includes(s.toLowerCase()));
  const bulletsText = exp.bullets.join(" ").toLowerCase();
  const inBullets = terms.some((t) => t.length >= 3 && bulletsText.includes(t));

  return {
    experience: inStack(exp.stack) || inBullets ? [`${exp.role} · ${exp.company}`] : [],
    projects: projects.filter((p) => inStack(p.stack)).map((p) => p.title),
  };
}
