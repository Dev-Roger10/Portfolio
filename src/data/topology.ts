// Topología extraída de "Topologia Redes Clinica.pkt" (Cisco Packet Tracer).
// Las posiciones son las del espacio lógico del archivo original; los datos de
// cada equipo salen de su running-config.

export type DeviceKind = "router" | "switch" | "pc";
export type Site = "LIM" | "CHI";

export type Device = {
  id: string;
  kind: DeviceKind;
  site: Site;
  x: number;
  y: number;
  model: string;
  role: string;
  /** Pares clave → valor que se muestran al seleccionar el equipo. */
  info: [string, string][];
  vlan?: number;
};

export type LinkKind = "trunk" | "etherchannel" | "routed" | "serial" | "access";
export type Link = { a: string; b: string; kind: LinkKind; label?: string; offset?: number };

export const vlans: { id: number; name: string; site: Site; color: string }[] = [
  { id: 10, name: "Administración", site: "LIM", color: "var(--color-chart-2)" },
  { id: 20, name: "Otros servicios", site: "LIM", color: "var(--color-chart-4)" },
  { id: 30, name: "Consultorio", site: "LIM", color: "var(--color-chart-5)" },
  { id: 40, name: "Administración", site: "CHI", color: "var(--color-chart-2)" },
  { id: 50, name: "Otros servicios", site: "CHI", color: "var(--color-chart-4)" },
  { id: 60, name: "Consultorio", site: "CHI", color: "var(--color-chart-5)" },
];
export const vlanById = (id?: number) => vlans.find((v) => v.id === id);

const pc = (id: string, site: Site, x: number, y: number, vlan: number, port: string, sw: string, secured = false): Device => ({
  id,
  kind: "pc",
  site,
  x,
  y,
  vlan,
  model: "PC-PT",
  role: "Estación de trabajo",
  info: [
    ["VLAN", `${vlan} · ${vlanById(vlan)?.name}`],
    ["Conectado a", `${sw} ${port}`],
    ["IP", `DHCP · 192.168.${vlan}.0/24`],
    ["Gateway", `192.168.${vlan}.1 (VIP HSRP)`],
    ...(secured ? ([["Seguridad", "port-security sticky · restrict"]] as [string, string][]) : []),
  ],
});

export const devices: Device[] = [
  // ---------- Sede LIM ----------
  {
    id: "R1-LIM", kind: "router", site: "LIM", x: 762, y: 330, model: "ISR4331", role: "Gateway HSRP activo + DHCP",
    info: [
      ["Subinterfaces", "Gi0/0/0.10 · .20 · .30 (802.1Q)"],
      ["IPs", "192.168.10.2 · 20.2 · 30.2"],
      ["HSRP", "activo · prioridad 100 · VIP .1"],
      ["DHCP", "pools VLAN10 / 20 / 30"],
      ["OSPF", "router-id 2.2.2.2 · área 0"],
      ["Hacia R3", "Gi0/0/1 · 192.168.100.1/24"],
    ],
  },
  {
    id: "R2-LIM", kind: "router", site: "LIM", x: 767, y: 510, model: "ISR4331", role: "Gateway HSRP en espera",
    info: [
      ["Subinterfaces", "Gi0/0/0.10 · .20 · .30 (802.1Q)"],
      ["IPs", "192.168.10.3 · 20.3 · 30.3"],
      ["HSRP", "standby · prioridad 90 · preempt"],
      ["OSPF", "router-id 6.6.6.6 · área 0"],
      ["Hacia R3", "Gi0/0/1 · 192.168.110.1/24"],
    ],
  },
  {
    id: "R3-LIM", kind: "router", site: "LIM", x: 905, y: 406, model: "ISR4331", role: "Borde WAN",
    info: [
      ["LAN", "192.168.100.3 · 192.168.110.3"],
      ["WAN", "S0/1/0 · 200.200.200.1/30"],
      ["Encapsulación", "PPP"],
      ["OSPF", "router-id 3.3.3.3 · área 0"],
    ],
  },
  {
    id: "S1-LIM", kind: "switch", site: "LIM", x: 568, y: 386, model: "2960-24TT", role: "Distribución",
    info: [
      ["Uplinks", "Gi0/1 → R1 · Gi0/2 → R2 (trunk)"],
      ["Po1", "Fa0/1-2 → S2 · LACP active"],
      ["Po2", "Fa0/3-4 → S3 · PAgP desirable"],
      ["Trunks", "VLAN 10,20,30 · nativa 1000"],
      ["STP", "Rapid PVST+"],
    ],
  },
  {
    id: "S2-LIM", kind: "switch", site: "LIM", x: 403, y: 288, model: "2960-24TT", role: "Acceso",
    info: [
      ["Po1", "Fa0/1-2 → S1 · LACP active"],
      ["Trunk", "Fa0/3 → S3 · nativa 1000"],
      ["Acceso", "VLAN 10 · 20 · 30 + PortFast"],
      ["Seguridad", "port-security sticky en VLAN 30"],
    ],
  },
  {
    id: "S3-LIM", kind: "switch", site: "LIM", x: 401, y: 440, model: "2960-24TT", role: "Acceso",
    info: [
      ["Po2", "Fa0/3-4 → S1 · PAgP auto"],
      ["Trunk", "Fa0/1 → S2 · nativa 1000"],
      ["Acceso", "VLAN 10 · 20 · 30 + PortFast"],
      ["STP", "Rapid PVST+"],
    ],
  },
  pc("PC9", "LIM", 544, 96, 10, "Fa0/5", "S2-LIM"),
  pc("PC10", "LIM", 214, 130, 20, "Fa0/7", "S2-LIM"),
  pc("PC11", "LIM", 170, 355, 30, "Fa0/8", "S2-LIM", true),
  pc("PC6", "LIM", 139, 607, 30, "Fa0/8", "S3-LIM"),
  pc("PC7", "LIM", 364, 787, 20, "Fa0/6", "S3-LIM"),
  pc("PC8", "LIM", 584, 627, 10, "Fa0/5", "S3-LIM"),

  // ---------- Sede CHI ----------
  {
    id: "R3-CHI", kind: "router", site: "CHI", x: 1290, y: 414, model: "ISR4331", role: "Borde WAN",
    info: [
      ["LAN", "192.168.200.3 · 192.168.210.3"],
      ["WAN", "S0/1/0 · 200.200.200.2/30 (DCE)"],
      ["Encapsulación", "PPP · clock rate 2 Mbps"],
      ["OSPF", "router-id 4.4.4.4 · área 0"],
    ],
  },
  {
    id: "R1-CHI", kind: "router", site: "CHI", x: 1456, y: 286, model: "ISR4331", role: "Gateway HSRP activo + DHCP",
    info: [
      ["Subinterfaces", "Gi0/0/0.40 · .50 · .60 (802.1Q)"],
      ["IPs", "192.168.40.1 · 50.1 · 60.1"],
      ["HSRP", "activo · prioridad 100 · VIP .1"],
      ["DHCP", "pools VLAN40 / 50 / 60"],
      ["OSPF", "router-id 5.5.5.5 · área 0"],
      ["Hacia R3", "Gi0/0/1 · 192.168.200.1/24"],
    ],
  },
  {
    id: "R2-CHI", kind: "router", site: "CHI", x: 1464, y: 508, model: "ISR4331", role: "Gateway HSRP en espera",
    info: [
      ["Subinterfaces", "Gi0/0/0.40 · .50 · .60 (802.1Q)"],
      ["IPs", "192.168.40.3 · 50.3 · 60.3"],
      ["HSRP", "standby · prioridad 90 · preempt"],
      ["OSPF", "router-id 7.7.7.7 · área 0"],
      ["Hacia R3", "Gi0/0/1 · 192.168.210.1/24"],
    ],
  },
  {
    id: "S1-CHI", kind: "switch", site: "CHI", x: 1649, y: 406, model: "2960-24TT", role: "Distribución",
    info: [
      ["Uplinks", "Gi0/1 → R1 · Gi0/2 → R2 (trunk)"],
      ["Po1", "Fa0/1-2 → S2 · LACP active"],
      ["Po2", "Fa0/3-4 → S3 · PAgP desirable"],
      ["Trunks", "VLAN 40,50,60 · nativa 1000"],
      ["STP", "Rapid PVST+"],
    ],
  },
  {
    id: "S2-CHI", kind: "switch", site: "CHI", x: 1839, y: 308, model: "2960-24TT", role: "Acceso",
    info: [
      ["Po1", "Fa0/1-2 → S1 · LACP active"],
      ["Trunk", "Fa0/3 → S3 · nativa 1000"],
      ["Acceso", "VLAN 40 · 50 · 60 + PortFast"],
      ["Seguridad", "port-security sticky en VLAN 60"],
    ],
  },
  {
    id: "S3-CHI", kind: "switch", site: "CHI", x: 1849, y: 508, model: "2960-24TT", role: "Acceso",
    info: [
      ["Po2", "Fa0/3-4 → S1 · PAgP auto"],
      ["Trunk", "Fa0/1 → S2 · nativa 1000"],
      ["Acceso", "VLAN 40 · 50 · 60 + PortFast"],
      ["STP", "Rapid PVST+"],
    ],
  },
  pc("PC0", "CHI", 1611, 86, 40, "Fa0/5", "S2-CHI"),
  pc("PC1", "CHI", 1968, 60, 50, "Fa0/6", "S2-CHI"),
  pc("PC2", "CHI", 2185, 299, 60, "Fa0/8", "S2-CHI", true),
  pc("PC3", "CHI", 1645, 703, 40, "Fa0/5", "S3-CHI"),
  pc("PC4", "CHI", 1977, 770, 50, "Fa0/7", "S3-CHI"),
  pc("PC5", "CHI", 2199, 585, 60, "Fa0/8", "S3-CHI"),
];

export const deviceById = (id: string) => devices.find((d) => d.id === id);

export const links: Link[] = [
  // LIM
  { a: "S1-LIM", b: "R1-LIM", kind: "trunk", label: "802.1Q" },
  { a: "S1-LIM", b: "R2-LIM", kind: "trunk", label: "802.1Q" },
  { a: "R1-LIM", b: "R3-LIM", kind: "routed" },
  { a: "R2-LIM", b: "R3-LIM", kind: "routed" },
  { a: "S2-LIM", b: "S1-LIM", kind: "etherchannel", offset: -7 },
  { a: "S2-LIM", b: "S1-LIM", kind: "etherchannel", offset: 7 },
  { a: "S3-LIM", b: "S1-LIM", kind: "etherchannel", offset: -7 },
  { a: "S3-LIM", b: "S1-LIM", kind: "etherchannel", offset: 7 },
  { a: "S2-LIM", b: "S3-LIM", kind: "trunk" },
  // WAN
  { a: "R3-LIM", b: "R3-CHI", kind: "serial" },
  // CHI
  { a: "R1-CHI", b: "R3-CHI", kind: "routed" },
  { a: "R2-CHI", b: "R3-CHI", kind: "routed" },
  { a: "R1-CHI", b: "S1-CHI", kind: "trunk", label: "802.1Q" },
  { a: "R2-CHI", b: "S1-CHI", kind: "trunk", label: "802.1Q" },
  { a: "S1-CHI", b: "S2-CHI", kind: "etherchannel", offset: -7 },
  { a: "S1-CHI", b: "S2-CHI", kind: "etherchannel", offset: 7 },
  { a: "S1-CHI", b: "S3-CHI", kind: "etherchannel", offset: -7 },
  { a: "S1-CHI", b: "S3-CHI", kind: "etherchannel", offset: 7 },
  { a: "S2-CHI", b: "S3-CHI", kind: "trunk" },
  // Acceso (PCs)
  ...devices.filter((d) => d.kind === "pc").map<Link>((d) => ({ a: d.info[1][1].split(" ")[0], b: d.id, kind: "access" })),
];

export const linkStyles: Record<LinkKind, { name: string; color: string; dash?: string; width: number }> = {
  routed: { name: "Enlace L3 · OSPF", color: "var(--color-chart-3)", width: 3 },
  trunk: { name: "Trunk 802.1Q", color: "var(--color-chart-1)", width: 3 },
  etherchannel: { name: "EtherChannel (2 enlaces)", color: "var(--color-chart-1)", width: 2.2 },
  serial: { name: "WAN serial PPP", color: "var(--color-chart-6)", dash: "14 9", width: 4 },
  access: { name: "Acceso (VLAN)", color: "var(--t-muted)", width: 1.6 },
};

export const topologyStats = [
  { label: "routers", value: devices.filter((d) => d.kind === "router").length },
  { label: "switches", value: devices.filter((d) => d.kind === "switch").length },
  { label: "PCs", value: devices.filter((d) => d.kind === "pc").length },
  { label: "VLANs", value: vlans.length },
];

