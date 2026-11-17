import { createContext, useContext } from "react";
import type { ThemeId } from "./themes";
import type { ViewId } from "./views";

export type WorkspaceState = {
  tabs: ViewId[];
  active: ViewId;
  open: (id: ViewId) => void;
  close: (id: ViewId) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  projectIndex: number;
  setProjectIndex: (i: number) => void;
  sql: { query: string; nonce: number };
  runSql: (query: string) => void;
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
};

export const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace fuera de WorkspaceProvider");
  return ctx;
}
