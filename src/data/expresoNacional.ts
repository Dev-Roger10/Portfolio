// Resumen del dashboard "Expreso Nacional" que armé en Power BI.
// Los números salen del mismo modelo del .pbix (6 000 viajes ficticios entre
// enero de 2022 y junio de 2025), agrupados por año para que la versión web
// pueda filtrar sin cargar la tabla completa.

export type YearKey = "all" | "2022" | "2023" | "2024" | "2025";

type Summary = {
  kpi: { viajes: number; pasajeros: number; ingresos: number; ocupacion: number; satisfaccion: number; kmL: number; horas: number };
  agencias: Record<string, number>;
  pagos: Record<string, number>;
  estado: Record<string, number>;
  servicio: Record<string, { viajes: number; pasajeros: number; combustible: number; ingresos: number }>;
  ocupBus: Record<string, number>;
  promo: Record<string, { sat: number; ocup: number }>;
  rutas: [origen: string, destino: string, viajes: number][];
};

export const years: { key: YearKey; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "2022", label: "2022" },
  { key: "2023", label: "2023" },
  { key: "2024", label: "2024" },
  { key: "2025", label: "2025 (ene-jun)" },
];

export const summary: Record<YearKey, Summary> = {
  "all": {
    kpi: {"viajes": 6000, "pasajeros": 165270, "ingresos": 14028340, "ocupacion": 61.3, "satisfaccion": 3.01, "kmL": 3.07, "horas": 15.9},
    agencias: {"Agencia Centro": 3620141, "Estación Norte": 3418977, "Estación Sur": 3389797, "Terminal Central": 3599425},
    pagos: {"Efectivo": 1191, "Plin": 1178, "Tarjeta": 1186, "Transferencia": 1207, "Yape": 1238},
    estado: {"A Tiempo": 4189, "Cancelado": 604, "Con Retraso": 1207},
    servicio: {"Económico": {"viajes": 2960, "pasajeros": 82717, "combustible": 669621, "ingresos": 6990910}, "Ejecutivo": {"viajes": 3040, "pasajeros": 82553, "combustible": 705811, "ingresos": 7037430}},
    ocupBus: {"Interprovincial": 60.3, "Urbano": 62.6},
    promo: {"No": {"sat": 3.02, "ocup": 61.9}, "Sí": {"sat": 2.99, "ocup": 61.0}},
    rutas: [["Chiclayo", "Cusco", 83], ["Tumbes", "Cusco", 82], ["Piura", "Cusco", 80], ["Trujillo", "Cusco", 80], ["Chiclayo", "Arequipa", 80]],
  },
  "2022": {
    kpi: {"viajes": 1668, "pasajeros": 45674, "ingresos": 3859151, "ocupacion": 61.0, "satisfaccion": 3.0, "kmL": 3.06, "horas": 16.2},
    agencias: {"Agencia Centro": 960633, "Estación Norte": 913328, "Estación Sur": 966323, "Terminal Central": 1018867},
    pagos: {"Efectivo": 350, "Plin": 317, "Tarjeta": 324, "Transferencia": 328, "Yape": 349},
    estado: {"A Tiempo": 1145, "Cancelado": 182, "Con Retraso": 341},
    servicio: {"Económico": {"viajes": 792, "pasajeros": 22124, "combustible": 182844, "ingresos": 1839397}, "Ejecutivo": {"viajes": 876, "pasajeros": 23550, "combustible": 209182, "ingresos": 2019754}},
    ocupBus: {"Interprovincial": 60.5, "Urbano": 61.6},
    promo: {"No": {"sat": 3.02, "ocup": 61.8}, "Sí": {"sat": 2.98, "ocup": 60.3}},
    rutas: [["Tarapoto", "Lima", 28], ["Tarapoto", "Piura", 28], ["Trujillo", "Tarapoto", 27], ["Lima", "Trujillo", 27], ["Chiclayo", "Huancayo", 27]],
  },
  "2023": {
    kpi: {"viajes": 1728, "pasajeros": 47070, "ingresos": 4015513, "ocupacion": 60.6, "satisfaccion": 2.99, "kmL": 3.07, "horas": 15.9},
    agencias: {"Agencia Centro": 1090934, "Estación Norte": 977955, "Estación Sur": 948671, "Terminal Central": 997953},
    pagos: {"Efectivo": 323, "Plin": 326, "Tarjeta": 345, "Transferencia": 354, "Yape": 380},
    estado: {"A Tiempo": 1220, "Cancelado": 173, "Con Retraso": 335},
    servicio: {"Económico": {"viajes": 860, "pasajeros": 24005, "combustible": 195180, "ingresos": 2033965}, "Ejecutivo": {"viajes": 868, "pasajeros": 23065, "combustible": 201718, "ingresos": 1981548}},
    ocupBus: {"Interprovincial": 59.3, "Urbano": 62.3},
    promo: {"No": {"sat": 3.0, "ocup": 61.8}, "Sí": {"sat": 2.98, "ocup": 59.8}},
    rutas: [["Lima", "Tarapoto", 28], ["Huancayo", "Lima", 27], ["Trujillo", "Tarapoto", 27], ["Piura", "Chiclayo", 26], ["Piura", "Cusco", 26]],
  },
  "2024": {
    kpi: {"viajes": 1738, "pasajeros": 48460, "ingresos": 4133194, "ocupacion": 62.1, "satisfaccion": 3.01, "kmL": 3.08, "horas": 15.8},
    agencias: {"Agencia Centro": 1069874, "Estación Norte": 1052120, "Estación Sur": 1002618, "Terminal Central": 1008582},
    pagos: {"Efectivo": 360, "Plin": 357, "Tarjeta": 336, "Transferencia": 345, "Yape": 340},
    estado: {"A Tiempo": 1204, "Cancelado": 164, "Con Retraso": 370},
    servicio: {"Económico": {"viajes": 881, "pasajeros": 24898, "combustible": 192184, "ingresos": 2135280}, "Ejecutivo": {"viajes": 857, "pasajeros": 23562, "combustible": 194753, "ingresos": 1997914}},
    ocupBus: {"Interprovincial": 61.3, "Urbano": 63.1},
    promo: {"No": {"sat": 3.03, "ocup": 62.0}, "Sí": {"sat": 2.99, "ocup": 62.4}},
    rutas: [["Chiclayo", "Cusco", 28], ["Huancayo", "Trujillo", 28], ["Ica", "Trujillo", 28], ["Huancayo", "Cusco", 27], ["Chiclayo", "Trujillo", 27]],
  },
  "2025": {
    kpi: {"viajes": 866, "pasajeros": 24066, "ingresos": 2020482, "ocupacion": 61.8, "satisfaccion": 3.05, "kmL": 3.09, "horas": 15.9},
    agencias: {"Agencia Centro": 498700, "Estación Norte": 475574, "Estación Sur": 472185, "Terminal Central": 574023},
    pagos: {"Efectivo": 158, "Plin": 178, "Tarjeta": 181, "Transferencia": 180, "Yape": 169},
    estado: {"A Tiempo": 620, "Cancelado": 85, "Con Retraso": 161},
    servicio: {"Económico": {"viajes": 427, "pasajeros": 11690, "combustible": 99413, "ingresos": 982268}, "Ejecutivo": {"viajes": 439, "pasajeros": 12376, "combustible": 100158, "ingresos": 1038214}},
    ocupBus: {"Interprovincial": 59.8, "Urbano": 64.1},
    promo: {"No": {"sat": 3.06, "ocup": 62.0}, "Sí": {"sat": 3.04, "ocup": 61.9}},
    rutas: [["Tumbes", "Cusco", 22], ["Piura", "Trujillo", 19], ["Chiclayo", "Arequipa", 16], ["Piura", "Tumbes", 15], ["Trujillo", "Piura", 15]],
  },
};

// [año, mes, ingresos, viajes] - es la serie de la gráfica "Ingresos Totales por Mes".
export const monthly: [number, number, number, number][] = [
    [2022, 1, 356849, 161],
  [2022, 2, 226215, 107],
  [2022, 3, 293290, 126],
  [2022, 4, 324851, 134],
  [2022, 5, 334846, 160],
  [2022, 6, 302657, 129],
  [2022, 7, 332295, 136],
  [2022, 8, 377831, 156],
  [2022, 9, 271335, 127],
  [2022, 10, 330642, 141],
  [2022, 11, 360750, 147],
  [2022, 12, 347590, 144],
  [2023, 1, 364973, 158],
  [2023, 2, 269060, 121],
  [2023, 3, 351564, 146],
  [2023, 4, 386925, 155],
  [2023, 5, 352230, 155],
  [2023, 6, 331895, 138],
  [2023, 7, 318738, 130],
  [2023, 8, 322665, 148],
  [2023, 9, 350682, 154],
  [2023, 10, 314611, 138],
  [2023, 11, 321558, 136],
  [2023, 12, 330612, 149],
  [2024, 1, 354674, 155],
  [2024, 2, 324097, 133],
  [2024, 3, 326019, 139],
  [2024, 4, 315260, 141],
  [2024, 5, 365749, 159],
  [2024, 6, 319805, 137],
  [2024, 7, 311218, 141],
  [2024, 8, 409911, 153],
  [2024, 9, 353940, 147],
  [2024, 10, 344260, 143],
  [2024, 11, 346672, 143],
  [2024, 12, 361589, 147],
  [2025, 1, 406488, 169],
  [2025, 2, 314288, 126],
  [2025, 3, 312250, 138],
  [2025, 4, 321001, 147],
  [2025, 5, 358102, 157],
  [2025, 6, 308353, 129],
];

// Las medidas tal cual están en la tabla "Medidas" del modelo.
export const daxMeasures: { name: string; dax: string }[] = [
  { name: "Ingresos Totales", dax: "SUMX(Detalle_Buses, Detalle_Buses[precio_pasaje] * Detalle_Buses[pasajeros_transportados])" },
  { name: "Total Viajes", dax: "COUNTROWS(Detalle_Buses)" },
  { name: "Pasajeros Transportados", dax: "SUM(Detalle_Buses[pasajeros_transportados])" },
  { name: "Ocupación Promedio", dax: "DIVIDE(SUM(Detalle_Buses[pasajeros_transportados]), SUM(Detalle_Buses[capacidad])) * 100" },
  { name: "Promedio Satisfacción", dax: "AVERAGE(Detalle_Buses[nivel_satisfaccion])" },
  {
    name: "Ingreso Acumulado Diario",
    dax: "CALCULATE(\n  SUMX(Detalle_Buses, Detalle_Buses[precio_pasaje] * Detalle_Buses[pasajeros_transportados]),\n  FILTER(ALL('Dim_Calendario'), 'Dim_Calendario'[Date] <= MAX('Dim_Calendario'[Date]))\n)",
  },
  { name: "Kilometros Totales", dax: "SUM(Detalle_Buses[kilometros_viaje])" },
  { name: "Combustible Total", dax: "SUM(Detalle_Buses[combustible_consumido])" },
  { name: "Rendimiento km/L", dax: "DIVIDE(SUM(Detalle_Buses[kilometros_viaje]), SUM(Detalle_Buses[combustible_consumido]))" },
  { name: "Tiempo Promedio por Viaje", dax: "AVERAGE(Detalle_Buses[tiempo_estimado_horas])" },
  { name: "Combustible Promedio por Viaje", dax: "AVERAGE(Detalle_Buses[combustible_consumido])" },
];

// El calendario no viene del Excel: lo genero con DAX desde 2022 hasta el último mes con viajes.
export const calendarDax = `ADDCOLUMNS(
  CALENDAR(DATE(2022, 1, 1), EOMONTH(MAX(Detalle_Buses[fecha]), 0)),
  "#Año", YEAR([Date]),
  "#Mes", MONTH([Date]),
  "Trimestre", "T" & FORMAT([Date], "Q"),
  "Año#Mes", FORMAT([Date], "YYYY/MM"),
  "SemanaMes", "Semana " & INT((DAY([Date]) - 1) / 7) + 1,
  "MesAño", FORMAT([Date], "mmm-yy")
  -- ...y 15 columnas más para ordenar y filtrar por fecha
)`;

// Modelo estrella: una tabla de hechos con 9 dimensiones colgando de ella (todas 1:N).
export const factTable = { name: "Detalle_Buses", rows: 6000, columns: 21 };
export const dimensions = [
  { name: "Dim_Origen", key: "origen", values: 10 },
  { name: "Dim_Destino", key: "destino", values: 10 },
  { name: "Dim_Agencia_Origen", key: "agencia_origen", values: 4 },
  { name: "Dim_Agencia_Destino", key: "agencia_destino", values: 4 },
  { name: "Dim_Tipo_Bus", key: "tipo_bus", values: 2 },
  { name: "Dim_Tipo_Servicio", key: "tipo_servicio", values: 2 },
  { name: "Dim_Tipo_Pago", key: "tipo_pago", values: 5 },
  { name: "Dim_Estado_Servicio", key: "estado_servicio", values: 3 },
  { name: "Dim_Promocion", key: "promocion_aplicada", values: 2 },
];

// Páginas del reporte y lo que tiene cada una.
export const reportPages = [
  { name: "Menú", detail: "Portada con navegación entre páginas" },
  { name: "Informes", detail: "Índice de reportes con botones" },
  {
    name: "D. General",
    detail: "5 tarjetas KPI, ingresos por mes, viajes por servicio y por medio de pago, matriz origen × destino e ingresos por agencia, con 4 segmentadores",
  },
  {
    name: "D. Detalle",
    detail: "Árbol de descomposición de viajes, combustible vs pasajeros por tipo de servicio y de bus, gasto mensual de combustible y pasajeros por origen",
  },
];

