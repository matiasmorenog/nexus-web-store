/** Contenido estático de la home app2 (diseño Cyber). */
export const APP2_HOME_FEATURES = [
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

export const APP2_HOME_CATEGORIES = [
  {
    slug: "kits",
    label: "Mods & Kits",
    gradient: "from-cyan-500/20",
    image:
      "https://images.unsplash.com/photo-1699631559529-83389014055c?w=600&q=80",
  },
  {
    slug: "descartables",
    label: "Desechables",
    gradient: "from-orange-500/20",
    image:
      "https://images.unsplash.com/photo-1666402666628-61eec7cc8d26?w=600&q=80",
  },
  {
    slug: "liquidos",
    label: "E-Líquidos",
    gradient: "from-purple-500/20",
    image:
      "https://images.unsplash.com/photo-1715613814256-25bef16120cd?w=600&q=80",
  },
  {
    slug: "pods",
    label: "Pods & Cartuchos",
    gradient: "from-emerald-500/20",
    image:
      "https://images.unsplash.com/photo-1701278109202-ad455b0506ac?w=600&q=80",
  },
] as const;

export const APP2_HERO_STATS = [
  { value: "2,400+", label: "Clientes" },
  { value: "300+", label: "Productos" },
  { value: "4.9★", label: "Calificación" },
] as const;

export const APP2_PROMO = {
  code: "VAPOR20",
  title: "20% OFF EN",
  highlight: "DESECHABLES",
} as const;
