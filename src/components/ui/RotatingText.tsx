import { useEffect, useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/** Va rotando entre frases cada `interval` ms, con un fade + slide vertical. */
export function RotatingText({ items, interval = 2600, className = "" }: { items: readonly string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval, reducedMotion]);

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      {/* Reserva el ancho del ítem más largo para que el layout no salte. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        {items.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={items[index]}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="col-start-1 row-start-1 whitespace-nowrap text-accent-300"
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
