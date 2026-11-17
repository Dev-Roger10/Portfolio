// Temas basados en paletas reales de editores de código. Cada uno define las
// variables --t-* que index.css convierte en los tokens de Tailwind (ink, accent,
// mint, chart, syn…), así que cambiar de tema es solo reescribir estas variables.

export type ThemeId = "kali" | "ubuntu" | "tokyo" | "github" | "onedark" | "catppuccin" | "dracula";

type Tokens = {
  bg: string; // fondo del editor
  panel: string; // barras laterales / ventanas
  elevated: string;
  surface: string;
  line: string;
  muted: string;
  fg: string;
  fgDim: string;
  comment: string;
  accent: string;
  onAccent: string;
  secondary: string;
  danger: string;
  keyword: string;
  string: string;
  number: string;
  fn: string;
  chart: [string, string, string, string, string, string];
};

export type Theme = { id: ThemeId; name: string; tokens: Tokens };

export const themes: Theme[] = [
  {
    // Kali Linux: negro azulado, el azul del dragón de Kali y colores de zsh-syntax-highlighting.
    id: "kali",
    name: "Kali Linux",
    tokens: {
      bg: "#15171c", panel: "#0e0f13", elevated: "#1c1f26", surface: "#252932", line: "#323743", muted: "#4a5161",
      fg: "#e4e6ec", fgDim: "#b3b8c5", comment: "#6c7488",
      accent: "#2f6fe0", onAccent: "#ffffff", secondary: "#23d18b", danger: "#f14c4c",
      keyword: "#d670d6", string: "#f5f543", number: "#ff9e57", fn: "#29b8db",
      chart: ["#2f6fe0", "#23d18b", "#29b8db", "#f5f543", "#d670d6", "#f14c4c"],
    },
  },
  {
    // Terminal de Ubuntu: fondo berenjena, naranja Ubuntu y la paleta Tango de GNOME.
    id: "ubuntu",
    name: "Ubuntu Terminal",
    tokens: {
      bg: "#300a24", panel: "#240719", elevated: "#3a0f2d", surface: "#4a1a3c", line: "#5e2750", muted: "#7a4a6c",
      fg: "#eeeeec", fgDim: "#c9b9c4", comment: "#8f7a88",
      accent: "#e95420", onAccent: "#1c0514", secondary: "#8ae234", danger: "#ef2929",
      keyword: "#ad7fa8", string: "#8ae234", number: "#fce94f", fn: "#729fcf",
      chart: ["#e95420", "#8ae234", "#729fcf", "#fce94f", "#ad7fa8", "#34e2e2"],
    },
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    tokens: {
      bg: "#1a1b26", panel: "#16161e", elevated: "#1f2335", surface: "#292e42", line: "#3b4261", muted: "#545c7e",
      fg: "#c0caf5", fgDim: "#a9b1d6", comment: "#565f89",
      accent: "#7aa2f7", onAccent: "#16161e", secondary: "#73daca", danger: "#f7768e",
      keyword: "#bb9af7", string: "#9ece6a", number: "#ff9e64", fn: "#7dcfff",
      chart: ["#7aa2f7", "#73daca", "#bb9af7", "#e0af68", "#f7768e", "#9ece6a"],
    },
  },
  {
    id: "github",
    name: "GitHub Dark",
    tokens: {
      bg: "#0d1117", panel: "#010409", elevated: "#161b22", surface: "#21262d", line: "#30363d", muted: "#484f58",
      fg: "#e6edf3", fgDim: "#9198a1", comment: "#6e7681",
      accent: "#4493f8", onAccent: "#0d1117", secondary: "#3fb950", danger: "#ff7b72",
      keyword: "#ff7b72", string: "#a5d6ff", number: "#79c0ff", fn: "#d2a8ff",
      chart: ["#4493f8", "#3fb950", "#d2a8ff", "#ffa657", "#ff7b72", "#79c0ff"],
    },
  },
  {
    id: "onedark",
    name: "One Dark Pro",
    tokens: {
      bg: "#282c34", panel: "#21252b", elevated: "#2c313a", surface: "#333842", line: "#3e4451", muted: "#4b5263",
      fg: "#c8ccd4", fgDim: "#abb2bf", comment: "#5c6370",
      accent: "#61afef", onAccent: "#1e2227", secondary: "#98c379", danger: "#e06c75",
      keyword: "#c678dd", string: "#98c379", number: "#d19a66", fn: "#56b6c2",
      chart: ["#61afef", "#98c379", "#c678dd", "#e5c07b", "#e06c75", "#56b6c2"],
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin Mocha",
    tokens: {
      bg: "#1e1e2e", panel: "#181825", elevated: "#24243a", surface: "#313244", line: "#45475a", muted: "#585b70",
      fg: "#cdd6f4", fgDim: "#a6adc8", comment: "#7f849c",
      accent: "#cba6f7", onAccent: "#11111b", secondary: "#a6e3a1", danger: "#f38ba8",
      keyword: "#cba6f7", string: "#a6e3a1", number: "#fab387", fn: "#89b4fa",
      chart: ["#cba6f7", "#89b4fa", "#a6e3a1", "#f9e2af", "#f38ba8", "#94e2d5"],
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    tokens: {
      bg: "#282a36", panel: "#21222c", elevated: "#2d2f3d", surface: "#343746", line: "#44475a", muted: "#6272a4",
      fg: "#f8f8f2", fgDim: "#c5c8d6", comment: "#6272a4",
      accent: "#bd93f9", onAccent: "#21222c", secondary: "#50fa7b", danger: "#ff5555",
      keyword: "#ff79c6", string: "#f1fa8c", number: "#ffb86c", fn: "#8be9fd",
      chart: ["#bd93f9", "#8be9fd", "#50fa7b", "#ffb86c", "#ff79c6", "#f1fa8c"],
    },
  },
];

export const defaultTheme: ThemeId = "kali";
export const themeById = (id: string) => themes.find((t) => t.id === id);

const STORAGE_KEY = "portfolio-theme";

export const themeLabel = (id: ThemeId) => (themeById(id) ?? themes[0]).name;

export function loadTheme(): ThemeId {
  // ?theme=dracula permite compartir un enlace con un tema concreto.
  const fromUrl = new URLSearchParams(window.location.search).get("theme");
  if (fromUrl && themeById(fromUrl)) return fromUrl as ThemeId;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themeById(saved)) return saved as ThemeId;
  } catch {
    // sin storage (modo privado): uso el tema por defecto
  }
  return defaultTheme;
}

/** Variables CSS (--t-*) de un tema. Sirven para el sitio entero o para una ventana con su propio tema. */
export function themeVars(id: ThemeId): Record<string, string> {
  const t = (themeById(id) ?? themes[0]).tokens;
  const vars: Record<string, string> = {
    bg: t.bg, panel: t.panel, elevated: t.elevated, surface: t.surface, line: t.line, muted: t.muted,
    fg: t.fg, "fg-dim": t.fgDim, comment: t.comment,
    accent: t.accent, "on-accent": t.onAccent, secondary: t.secondary, danger: t.danger,
    keyword: t.keyword, string: t.string, number: t.number, fn: t.fn,
    // "hi" es el color de máximo contraste; index.css lo usa como --color-white.
    hi: "#ffffff",
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) out[`--t-${k}`] = v;
  t.chart.forEach((c, i) => (out[`--t-chart-${i + 1}`] = c));
  return out;
}

export function applyTheme(id: ThemeId) {
  const theme = themeById(id) ?? themes[0];
  const t = theme.tokens;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(themeVars(id))) root.style.setProperty(k, v);
  root.dataset.theme = id;
  root.style.colorScheme = "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.panel);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // no pasa nada si no se puede guardar
  }
}
