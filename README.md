# Portafolio - Roger Antezana

Portafolio personal de **Roger Antezana**, Desarrollador de Software y Analista de Datos. La interfaz imita un entorno de trabajo tipo IDE: pestañas, paleta de comandos, una terminal con aspecto de Kali Linux y una consola SQL con datos de ejemplo.

**Sitio web:** https://dev-roger10.github.io/Portfolio/

## Qué incluye

- **Resumen, Experiencia, Proyectos, Stack y Contacto** como vistas del workspace, con pestañas y navegación por URL (`#proyectos`, `#stack`, ...).
- **Paleta de comandos** (`Ctrl/Cmd + K`) para saltar entre vistas, cambiar de tema o abrir enlaces.
- **Terminal estilo Kali Linux** (`Ctrl/Cmd + D`) con zsh y el prompt de Kali, sin importar el tema del sitio. Comandos: `help`, `neofetch`, `whoami`, `ls`, `cd <vista>`, `cat`, `sql`, `theme`, `clear` y `exit`.
- **Consola SQL** que ejecuta consultas sobre los logros, proyectos, tecnologías y formación del portafolio.
- **Stack:** matriz de tecnologías por categoría (Backend, Frontend, Mobile, Datos & BI, Diseño y ofimática, Redes, Linux y herramientas, IA), con logos y la lista de dónde se usó cada una.
- **Proyectos:**
  - **Dashboard "Expreso Nacional" (Power BI):** capturas del reporte real con navegación entre imágenes, y una versión interactiva con filtro por año, comparación contra el año anterior, mapa de calor por mes y gráficos que responden al cursor, al clic y al teclado.
  - **Sistema Integral de Gestión de Biblioteca (SIGB):** aplicación en ASP.NET Core MVC con catálogo, reservas, préstamos y sanciones según el rol.
  - **Turbo Bus:** sistema transaccional de venta de boletos en Java Web.
  - **Red empresarial multi-sede:** topología interactiva de una clínica (Cisco Packet Tracer) con VLANs, HSRP y OSPF.
- **Temas de color** de editor (Kali, Ubuntu, Tokyo Night, GitHub, One Dark, Catppuccin y Dracula).
- Diseño responsive (celular, tablet y escritorio) que respeta la preferencia de movimiento reducido del sistema operativo.

## Tecnologías

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/) para animaciones
- [lucide-react](https://lucide.dev/) para los íconos de interfaz; los logos de cada tecnología están en `src/assets/logos`
- Tipografía [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) e [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
- [oxlint](https://oxc.rs/docs/guide/usage/linter) para el lint

## Requisitos

- [Node.js](https://nodejs.org/) 20.19 o superior
- npm

## Uso

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Revisar el código con el linter
npm run lint

# Build de producción (genera la carpeta dist/)
npm run build

# Previsualizar el build localmente
npm run preview
```

## Estructura

```
src/
├── assets/        # Capturas del dashboard y logos de tecnologías
├── data/          # Contenido del portafolio (perfil, proyectos, datos de ejemplo)
├── workspace/     # Interfaz tipo IDE: vistas, terminal, paleta de comandos, temas
├── components/ui/ # Componentes reutilizables (badges, contadores, íconos)
└── hooks/         # Hooks personalizados
public/            # Archivos estáticos (favicon)
```

Todo el contenido (datos personales, experiencia, proyectos y stack) se edita en [`src/data/profile.ts`](src/data/profile.ts).

## Despliegue en GitHub Pages

El sitio se compila y se publica solo con la GitHub Action de [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) cada vez que se sube un cambio a la rama `main`.

1. Sube el proyecto a un repositorio de GitHub llamado `Portfolio`.
2. En **Settings > Pages > Build and deployment**, elige **GitHub Actions** como fuente.
3. Haz push a `main`. La Action ejecuta `npm ci` y `npm run build`, y publica el contenido de `dist/`.

El `base` de Vite en [`vite.config.ts`](vite.config.ts) está configurado como `/Portfolio/` para el build. Si el repositorio tiene otro nombre, cambia ese valor para que coincida.

## Contacto

- GitHub: [github.com/Dev-Roger10](https://github.com/Dev-Roger10)
- LinkedIn y correo: disponibles en la vista **Contacto** del portafolio.
