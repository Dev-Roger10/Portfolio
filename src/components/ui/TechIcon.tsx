import { techIconFor } from "../../data/techIcons";

/**
 * Logo oficial de la tecnología según su nombre (el mismo texto del badge),
 * sobre una fichita translúcida que toma el tono del tema. Si no hay logo registrado no renderiza nada y el
 * badge se queda solo con el texto.
 */
export function TechIcon({ name, size = 32 }: { name: string; size?: number }) {
  const icon = techIconFor(name);
  if (!icon) return null;

  return (
    <span
      aria-hidden="true"
      className="inline-flex flex-none items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10"
      style={{ width: size, height: size }}
    >
      <img
        src={icon.img}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ width: size * 0.64, height: size * 0.64, filter: icon.filter }}
      />
    </span>
  );
}
