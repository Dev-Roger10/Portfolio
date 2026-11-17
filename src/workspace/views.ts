import { Database, FolderGit2, LayoutDashboard, Layers, Mail, Workflow, type LucideIcon } from "lucide-react";

export type ViewId = "resumen" | "experiencia" | "proyectos" | "stack" | "sql" | "contacto";

export type ViewDef = { id: ViewId; label: string; file: string; icon: LucideIcon };

export const views: ViewDef[] = [
  { id: "resumen", label: "Resumen", file: "resumen.dashboard", icon: LayoutDashboard },
  { id: "experiencia", label: "Experiencia", file: "pipeline.flow", icon: Workflow },
  { id: "proyectos", label: "Proyectos", file: "proyectos/", icon: FolderGit2 },
  { id: "stack", label: "Stack", file: "stack.matrix", icon: Layers },
  { id: "sql", label: "Consola SQL", file: "consulta.sql", icon: Database },
  { id: "contacto", label: "Contacto", file: "contacto.msg", icon: Mail },
];

export const viewById = (id: ViewId) => views.find((v) => v.id === id)!;
export const isViewId = (v: string): v is ViewId => views.some((x) => x.id === v);
