import { Suspense, lazy } from "react";
import { AnimatePresence, LazyMotion, m as motion } from "framer-motion";
import { WorkspaceProvider } from "./workspace/WorkspaceProvider";
import { useWorkspace } from "./workspace/context";
import { ActivityBar, MobileNav, StatusBar, TabBar, TitleBar } from "./workspace/Chrome";
import type { ViewId } from "./workspace/views";
import { Overview } from "./workspace/views/Overview";

// Solo el Resumen (la vista inicial) va en el bundle principal; el resto se
// descarga cuando se abre, igual que la terminal y la paleta de comandos.
const loadMotionFeatures = () => import("./motionFeatures").then((m) => m.default);
const named = <T extends Record<string, React.ComponentType>>(load: () => Promise<T>, key: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[key] })));
const Experience = named(() => import("./workspace/views/Experience"), "Experience");
const Projects = named(() => import("./workspace/views/Projects"), "Projects");
const Stack = named(() => import("./workspace/views/Stack"), "Stack");
const SqlConsole = named(() => import("./workspace/views/SqlConsole"), "SqlConsole");
const Contact = named(() => import("./workspace/views/Contact"), "Contact");
const TerminalWindow = named(() => import("./workspace/TerminalWindow"), "TerminalWindow");
const CommandPalette = named(() => import("./workspace/CommandPalette"), "CommandPalette");

const viewComponents: Record<ViewId, React.ComponentType> = {
  resumen: Overview,
  experiencia: Experience,
  proyectos: Projects,
  stack: Stack,
  sql: SqlConsole,
  contacto: Contact,
};

function Workspace() {
  const { active } = useWorkspace();
  const View = viewComponents[active];

  return (
    <div className="flex h-[100dvh] flex-col bg-ink-950 text-zinc-200">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar />
          <main className="relative min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mx-auto max-w-[1400px]"
              >
                <Suspense fallback={<div className="min-h-[60vh]" />}>
                  <View />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <MobileNav />
      <StatusBar />
      <Suspense fallback={null}>
        <TerminalWindow />
        <CommandPalette />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    // Las funciones de animación (layout, drag) se bajan después del primer render.
    <LazyMotion features={loadMotionFeatures}>
      <WorkspaceProvider>
        <Workspace />
      </WorkspaceProvider>
    </LazyMotion>
  );
}

export default App;
