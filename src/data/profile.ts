// Toda la info del portafolio en un solo lugar.
// Si cambio algo acá, se actualiza en toda la web sin tocar componentes.

export const profile = {
  name: "Roger Anthony Antezana Quispe",
  shortName: "Roger Antezana",
  role: "Desarrollador de Software & Analista de Datos",
  location: "Lima, Perú",
  email: "antezana.rogeranthony10@gmail.com",
  phone: "+51 991 830 101",
  linkedin: "https://linkedin.com/in/roger-antezana-An10",
  github: "https://github.com/Dev-Roger10",
  linkedinLabel: "linkedin.com/in/roger-antezana-An10",
  githubLabel: "github.com/Dev-Roger10",
  tagline:
    "Soy desarrollador de software y analista de datos en formación. Me gusta construir aplicaciones web, APIs y automatizaciones. También convierto datos en información clara.",
  rotatingCapabilities: [
    "APIs y backends con Python (FastAPI, Flask)",
    "Aplicaciones web con C# y ASP.NET Core MVC",
    "Interfaces con Angular y React",
    "Bases de datos en SQL Server y MySQL",
    "Automatización de datos con Python (ETL)",
    "Dashboards en Power BI con DAX",
    "Redes Cisco: VLAN, OSPF y HSRP",
  ],
  summary: [
    "Estudiante de Ingeniería de Sistemas Computacionales (9.º ciclo). Trabajo en dos frentes: el desarrollo de software y el análisis de datos.",
    "Construyo aplicaciones completas, del backend y las APIs al frontend. También trabajo con los datos que esas aplicaciones generan para que sirvan al decidir. Conocer las dos partes me ayuda a ver cada proyecto de punta a punta.",
    "En desarrollo trabajo con Python, C#, ASP.NET Core MVC, Angular y React. En datos, con SQL Server, Power BI y automatización ETL. Sumo fundamentos de redes Cisco y Linux. Uso herramientas de IA para avanzar más rápido y reviso técnicamente lo que producen.",
    "Quiero seguir en proyectos donde el desarrollo y los datos se junten.",
  ],
} as const;

export type Stat = { value: number; suffix: string; label: string };

export const stats: Stat[] = [
  { value: 9, suffix: ".º", label: "ciclo de Ing. de Sistemas Computacionales (UPN)" },
  { value: 1, suffix: "+", label: "año de experiencia como Analista de Sistemas" },
  { value: 7, suffix: "", label: "cursos y certificaciones técnicas" },
];

export type Experience = {
  role: string;
  company: string;
  location: string;
  area: string;
  period: string;
  bullets: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    role: "Analista de Sistemas",
    company: "Vértice Empresarial",
    location: "Lima, Perú",
    area: "Área de Tecnologías de la Información (TI)",
    period: "Enero 2025 - Marzo 2026",
    bullets: [
      "Analicé carteras de clientes del sector financiero para identificar patrones de contactabilidad y clasificar registros según efectividad, calidad del número y tipo de contacto, priorizando la gestión y optimizando resultados.",
      "Automaticé procesos de extracción, transformación y carga (ETL) con Python, integrando datos de distintas fuentes y reduciendo el tiempo de procesamiento en aproximadamente un 75%.",
      "Optimicé consultas en SQL Server mediante reescritura de queries e indexación, reduciendo el tiempo de respuesta de reportes críticos en aproximadamente un 70%.",
      "Desarrollé y mantuve dashboards e indicadores KPI en Power BI utilizados semanalmente por gerencia para monitorear carteras, medir contactabilidad y dar seguimiento a la toma de decisiones.",
      "Desarrollé el backend de una plataforma de pagos y comisiones con Python (FastAPI, Flask), exponiendo APIs REST integradas a un frontend en Angular sobre SQL Server.",
    ],
    stack: ["Python", "FastAPI", "Flask", "Angular", "SQL Server", "T-SQL", "Power BI", "REST API", "Git"],
  },
];

export type Project = {
  title: string;
  category: string;
  filter: string;
  description: string;
  highlights: string[];
  stack: string[];
};

export const projectFilters = ["Todos", "Datos", "Full-Stack", "Transaccional", "Redes"] as const;

export const projects: Project[] = [
  {
    title: "Dashboard de Transporte Interprovincial \"Expreso Nacional\"",
    category: "Análisis de Datos · Power BI",
    filter: "Datos",
    description:
      "Proyecto personal con datos ficticios de una empresa de buses: 6 000 viajes entre 10 ciudades del Perú (2022 a mediados de 2025). Modelé los datos en estrella, escribí las medidas en DAX y armé un reporte de dos dashboards para seguir ingresos, ocupación, puntualidad, consumo de combustible y satisfacción de los pasajeros.",
    highlights: [
      "Modelo estrella: 1 tabla de hechos + 9 dimensiones y calendario en DAX",
      "12 medidas DAX: ingresos, ocupación, acumulado diario y rendimiento km/L",
      "Dashboard general y de detalle con árbol de descomposición y segmentadores",
    ],
    stack: ["Power BI", "DAX", "Power Query", "Excel", "Modelado estrella"],
  },
  {
    title: 'Sistema Integral de Gestión de Biblioteca "SIGB"',
    category: "Proyecto Full-Stack",
    filter: "Full-Stack",
    description:
      "Aplicación web para una biblioteca universitaria que reúne catálogo, reservas, préstamos, sanciones y reportes, con acceso según el rol de cada persona. Resuelve que el lector tenía que ir hasta la biblioteca solo para saber si un libro estaba disponible y pedirlo. Ahora consulta y reserva en línea. Luego pasa solo a recogerlo. Está hecha en ASP.NET Core MVC con una capa de servicios que concentra las reglas de préstamo. Así todos los módulos las aplican igual.",
    highlights: [
      "Reservas y préstamos en línea, con 4 roles y un panel propio para cada uno",
      "Reglas centralizadas: límite por usuario, plazo según el rol y multa diaria automática",
      "Contraseñas con PBKDF2 y sin credenciales dentro del repositorio",
    ],
    stack: ["ASP.NET Core MVC", "C#", "Entity Framework Core", "SQL Server", "Razor", "Bootstrap"],
  },
  {
    title: 'Sistema Web de Tickets de Viaje "Turbo Bus"',
    category: "Sistema Transaccional",
    filter: "Transaccional",
    description:
      "Sistema transaccional de reserva y venta de boletos con panel administrativo, CRUD completo, procesamiento de pago simulado y reportes, a partir de casos de uso y modelado de negocio.",
    highlights: ["Reserva y venta de boletos", "Panel administrativo y CRUD", "Pagos simulados y reportes"],
    stack: ["Java Web", "Servlets", "JSP", "MySQL", "Apache Tomcat"],
  },
  {
    title: "Red Empresarial Multi-Sede",
    category: "Infraestructura y Networking",
    filter: "Redes",
    description:
      "Red de una clínica con dos sedes (25 equipos): VLANs por área (administración, servicios y consultorio) con Router-on-a-Stick, gateway redundante HSRP, OSPF en área 0 y enlace WAN serial PPP entre sedes, validada en entorno físico y en Cisco Packet Tracer.",
    highlights: ["OSPF área 0 y HSRP activo/standby", "6 VLANs con Router-on-a-Stick 802.1Q y DHCP", "EtherChannel LACP/PAgP, Rapid PVST+ y port-security"],
    stack: ["Cisco IOS", "Packet Tracer", "OSPF", "HSRP", "VLAN", "EtherChannel", "DHCP", "PPP/WAN", "Rapid PVST+", "Port Security"],
  },
];

export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend",
    items: ["C#", ".NET", "ASP.NET Core MVC", "Python", "FastAPI", "Flask", "Java", "Java Web (Servlets, JSP)", "Node.js", "REST API", "Arquitectura MVC"],
  },
  {
    title: "Frontend",
    items: ["Angular", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Vite"],
  },
  {
    title: "Mobile",
    items: ["Kotlin", "Android Studio"],
  },
  {
    title: "Datos & BI",
    items: ["SQL Server", "MySQL", "SQL / T-SQL", "Power BI", "ETL", "Data Analytics", "KPIs", "Query Optimization"],
  },
  {
    title: "Diseño y ofimática",
    items: ["Figma", "Word", "PowerPoint", "Excel"],
  },
  {
    title: "Redes",
    items: ["Cisco IOS (CCNA)", "VLAN", "OSPF", "HSRP", "EtherChannel", "DHCP", "PPP/WAN"],
  },
  {
    title: "Linux y herramientas",
    items: ["Linux", "Git", "GitHub", "VS Code", "Visual Studio", "npm"],
  },
  {
    title: "IA",
    items: ["Claude", "ChatGPT", "GitHub Copilot"],
  },
];

export const education = {
  institution: "Universidad Privada del Norte (UPN)",
  degree: "Ingeniería de Sistemas Computacionales",
  period: "2022 - Actualidad · 9.º ciclo",
  extras: ["Cisco: Redes (CCNA)", "Cisco: Python", "Cisco: Introducción a la IA Moderna", "Linux (Cisco/NDG)", "Oracle Academy: Java Programming", "Oracle Academy: Database Programming with SQL", "Big Data Analyst (certificación por competencias)"],
  languages: ["Español (Nativo)", "Inglés (Básico)"],
};
