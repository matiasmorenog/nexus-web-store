/** Contenido estático de la home vape (diseño Cyber). */
export const VAPE_HOME_FEATURES = [
  {
    title: "Envío gratis",
    description: "En pedidos mayores a $50",
  },
  {
    title: "Garantía 1 año",
    description: "En todos los dispositivos",
  },
  {
    title: "Envío express",
    description: "Entrega en 24-48 h",
  },
] as const;

export const VAPE_HOME_CATEGORIES = [
  {
    slug: "kits",
    label: "Mods & Kits",
    gradient: "from-cyan-500/20",
    image: "https://source.unsplash.com/600x700/?vape,mod,device",
  },
  {
    slug: "descartables",
    label: "Desechables",
    gradient: "from-orange-500/20",
    image: "https://source.unsplash.com/600x700/?vape,disposable,pod",
  },
  {
    slug: "liquidos",
    label: "E-Líquidos",
    gradient: "from-purple-500/20",
    image: "https://source.unsplash.com/600x700/?e-liquid,bottle,vape",
  },
  {
    slug: "pods",
    label: "Pods & Cartuchos",
    gradient: "from-emerald-500/20",
    image: "https://source.unsplash.com/600x700/?vape,pod,cartridge",
  },
] as const;

export const VAPE_HERO_STATS = [
  { value: "2,400+", label: "Clientes" },
  { value: "300+", label: "Productos" },
  { value: "4.9★", label: "Calificación" },
] as const;

export const VAPE_PROMO = {
  code: "VAPOR20",
  title: "20% OFF EN",
  highlight: "DESECHABLES",
} as const;
