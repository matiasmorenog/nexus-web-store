export type VapeSeedProduct = {
  name: string;
  category: string;
  description: string;
  featured: boolean;
  image: string;
  price: number;
  variants: { nicotina: string; sabor: string; stock?: number }[];
};

export const VAPE_PRODUCTS: VapeSeedProduct[] = [
  {
    name: "Pod Descartable Mango Ice",
    category: "descartables",
    description:
      "Pod descartable listo para usar. Sabor mango con frescura. Aprox. 3000 caladas.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1635398863038-94958f86142c?w=800&q=80",
    price: 8900,
    variants: [
      { nicotina: "35mg", sabor: "Mango Ice", stock: 20 },
      { nicotina: "50mg", sabor: "Mango Ice", stock: 15 },
    ],
  },
  {
    name: "Líquido Salt Mint",
    category: "liquidos",
    description:
      "Líquido con nicotina salts. Sabor menta fresca. Frasco 30 ml.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80",
    price: 6500,
    variants: [
      { nicotina: "25mg", sabor: "Mint", stock: 12 },
      { nicotina: "35mg", sabor: "Mint", stock: 18 },
      { nicotina: "50mg", sabor: "Mint", stock: 10 },
    ],
  },
  {
    name: "Kit Vape Pen Starter",
    category: "kits",
    description:
      "Kit completo con dispositivo recargable, cartucho y cable USB. Ideal para empezar.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1585338109759-4fd4c4d72f98?w=800&q=80",
    price: 18900,
    variants: [{ nicotina: "Kit", sabor: "Negro", stock: 8 }],
  },
  {
    name: "Cartucho Pod Recargable",
    category: "pods",
    description:
      "Cartucho de repuesto compatible con vape pen. Capacidad 2 ml.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1611078489935-0cb964d6adc4?w=800&q=80",
    price: 4500,
    variants: [
      { nicotina: "0.8Ω", sabor: "Transparente", stock: 25 },
      { nicotina: "1.2Ω", sabor: "Transparente", stock: 20 },
    ],
  },
  {
    name: "Cable USB-C Carga Rápida",
    category: "accesorios",
    description: "Cable USB-C de 1 m para recargar tu dispositivo.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd202f?w=800&q=80",
    price: 3200,
    variants: [{ nicotina: "Único", sabor: "Negro", stock: 30 }],
  },
];
