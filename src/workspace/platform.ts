const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Tecla modificadora que mostramos en los atajos. */
export const modKey = isMac ? "⌘" : "Ctrl";
