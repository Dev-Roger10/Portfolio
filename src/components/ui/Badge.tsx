import { techIconFor } from "../../data/techIcons";
import { TechIcon } from "./TechIcon";

const sizes = {
  md: { icon: 32, text: "text-sm", padIcon: "py-1.5 pl-1.5 pr-4", padPlain: "px-4 py-2", gap: "gap-2.5" },
  lg: { icon: 44, text: "text-base", padIcon: "py-2 pl-2 pr-5", padPlain: "px-5 py-2.5", gap: "gap-3" },
};

export function Badge({
  children,
  tone = "default",
  size = "md",
}: {
  children: string;
  tone?: "default" | "accent";
  size?: keyof typeof sizes;
}) {
  const hasIcon = Boolean(techIconFor(children));
  const s = sizes[size];
  const base = `inline-flex items-center ${s.gap} rounded-full font-mono ${s.text} tracking-tight ${
    hasIcon ? s.padIcon : s.padPlain
  }`;

  if (tone === "accent") {
    return (
      <span className={`${base} border border-accent-500/40 bg-accent-500/10 text-accent-300`}>
        <TechIcon name={children} size={s.icon} />
        {children}
      </span>
    );
  }

  return (
    <span className={`${base} border border-white/10 bg-white/[0.04] text-zinc-300`}>
      <TechIcon name={children} size={s.icon} />
      {children}
    </span>
  );
}
