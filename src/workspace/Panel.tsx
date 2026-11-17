import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Ventana con barra de título: el contenedor base de todas las vistas. */
export function Panel({
  title,
  icon: Icon,
  right,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-ink-900/80 ${className}`}>
      <header className="flex h-9 flex-none items-center gap-3 border-b border-white/10 bg-white/[0.025] px-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-white/15" />
          <i className="h-2 w-2 rounded-full bg-white/15" />
          <i className="h-2 w-2 rounded-full bg-white/15" />
        </span>
        <h2 className="flex min-w-0 items-center gap-1.5 truncate font-mono text-xs text-zinc-400">
          {Icon && <Icon size={13} className="flex-none text-accent-400" />}
          <span className="truncate">{title}</span>
        </h2>
        {right && <div className="ml-auto flex flex-none items-center gap-2">{right}</div>}
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
