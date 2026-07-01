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
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=700&fit=crop&auto=format",
  },
  {
    slug: "descartables",
    label: "Desechables",
    gradient: "from-orange-500/20",
    image:
      "https://images.unsplash.com/photo-1617083934393-2e745d0e8e05?w=600&h=700&fit=crop&auto=format",
  },
  {
    slug: "liquidos",
    label: "E-Líquidos",
    gradient: "from-purple-500/20",
    image:
      "https://images.unsplash.com/photo-1540833201361-fbc07a14fff2?w=600&h=700&fit=crop&auto=format",
  },
  {
    slug: "pods",
    label: "Pods & Cartuchos",
    gradient: "from-emerald-500/20",
    image:
      "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=600&h=700&fit=crop&auto=format",
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
