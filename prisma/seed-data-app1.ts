export type App1SeedProduct = {
  name: string;
  category: string;
  audience: string;
  description: string;
  featured: boolean;
  promo2x1?: boolean;
  /** Demo: todas las variantes en stock 0 (chip sin stock en dashboard). */
  outOfStock?: boolean;
  image: string;
  price: number;
  colors: string[];
};

export const APP1_SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const APP1_PRODUCTS: App1SeedProduct[] = [
  {
    name: "Remera Dry-Fit WOD",
    category: "remeras",
    audience: "hombre",
    description:
      "Remera de secado rápido con tecnología anti-olor. Ideal para entrenamientos de alta intensidad y CrossFit.",
    featured: true,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1647438174616-7bc61ca38455?w=800&q=80",
    price: 21900,
    colors: ["Negro", "Gris", "Azul marino"],
  },
  {
    name: "Top Deportivo Sin Mangas",
    category: "tops",
    audience: "mujer",
    description:
      "Top con soporte medio y tela breathable. Libertad total de movimiento para levantamientos y gimnasia.",
    featured: true,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1598890208253-b94e37923365?w=800&q=80",
    price: 18900,
    colors: ["Negro", "Rosa", "Verde"],
  },
  {
    name: "Legging Alta Compresión",
    category: "leggings",
    audience: "mujer",
    description:
      "Calza de compresión con cintura alta que no se mueve. Perfecta para sentadillas, burpees y cardio.",
    featured: true,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1721969982799-fb9a78c43e7f?w=800&q=80",
    price: 32900,
    colors: ["Negro", "Gris jaspeado", "Borgoña"],
  },
  {
    name: 'Short Training 5"',
    category: "shorts",
    audience: "mujer",
    description:
      "Short liviano con liner interno y bolsillo para llaves. Diseñado para box jumps y sprints.",
    featured: true,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=800&q=80",
    price: 24900,
    colors: ["Negro", "Azul", "Gris"],
  },
  {
    name: "Hoodie Oversize Post-WOD",
    category: "hoodies",
    audience: "unisex",
    description:
      "Buzo oversize de algodón premium para el cooldown. Corte relajado después del entrenamiento.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1674465525580-af1112376f37?w=800&q=80",
    price: 45900,
    colors: ["Negro", "Gris", "Blanco roto"],
  },
  {
    name: 'Remera "Embrace the Suck"',
    category: "remeras",
    audience: "unisex",
    description:
      "Remera con estampa motivacional para la comunidad funcional. Algodón mezclado con elastano.",
    featured: false,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1659025162971-8d33b4d5e008?w=800&q=80",
    price: 19900,
    colors: ["Negro", "Blanco"],
  },
  {
    name: "Legging Seamless Cintura Alta",
    category: "leggings",
    audience: "mujer",
    description:
      "Legging sin costuras con efecto segunda piel. Máxima comodidad en WODs largos y AMRAPs.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1531520563951-4c0e3d3fcacc?w=800&q=80",
    price: 35900,
    colors: ["Negro", "Coral", "Lavanda"],
  },
  {
    name: "Short Hombre Training Pro",
    category: "shorts",
    audience: "hombre",
    description:
      "Short de entrenamiento con stretch en 4 direcciones. Resistente al roce en barras y cuerdas.",
    featured: false,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1752778597990-f28dfb13c551?w=800&q=80",
    price: 26900,
    colors: ["Negro", "Verde militar", "Gris"],
  },
  {
    name: "Buzo Half-Zip Performance",
    category: "hoodies",
    audience: "hombre",
    description:
      "Buzo técnico con cierre medio y capucha. Ideal para calentamiento y salida del box.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1663949564887-02994e4aa008?w=800&q=80",
    price: 52900,
    colors: ["Negro", "Gris oscuro"],
  },
  {
    name: "Cinturón de Levantamiento",
    category: "accesorios",
    audience: "unisex",
    description:
      "Cinturón de nylon reforzado para squats y peso muerto. Ajuste rápido con cierre de velcro.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1532382708467-d720b918f0da?w=800&q=80",
    price: 34900,
    colors: ["Negro", "Rojo"],
  },
  {
    name: "Muñequeras WOD",
    category: "accesorios",
    audience: "unisex",
    description:
      "Par de muñequeras acolchadas para protección en handstand push-ups y levantamientos.",
    featured: false,
    outOfStock: true,
    image:
      "https://images.unsplash.com/photo-1671581081106-283f2bcdef71?w=800&q=80",
    price: 12900,
    colors: ["Negro", "Gris"],
  },
  {
    name: "Remera Manga Larga Tech",
    category: "remeras",
    audience: "unisex",
    description:
      "Remera manga larga con protección UV y secado rápido. Para entrenar al aire libre o en invierno.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1608217002058-2e45c33b6c2c?w=800&q=80",
    price: 27900,
    colors: ["Negro", "Blanco", "Azul"],
  },
  {
    name: "Musculosa Training Fit",
    category: "musculosas",
    audience: "mujer",
    description:
      "Musculosa liviana con espalda nadadora. Máxima ventilación en WODs de alta intensidad.",
    featured: false,
    promo2x1: true,
    image:
      "https://images.unsplash.com/photo-1546749876-2088f8b19e09?w=800&q=80",
    price: 17900,
    colors: ["Negro", "Gris", "Rosa"],
  },
  {
    name: "Musculosa Essential Hombre",
    category: "musculosas",
    audience: "hombre",
    description:
      "Musculosa de algodón mezclado con elastano. Corte recto para entrenar o salir del box.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1606335544053-c43609e6155d?w=800&q=80",
    price: 16900,
    colors: ["Negro", "Blanco", "Gris"],
  },
  {
    name: "Remera Crop Training",
    category: "remeras",
    audience: "mujer",
    description:
      "Remera crop con tela liviana y secado rápido. Ideal para clases de funcional y cardio.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1594915844371-2298bd354327?w=800&q=80",
    price: 20900,
    colors: ["Negro", "Rosa", "Lila"],
  },
  {
    name: "Remera Box Fit Hombre",
    category: "remeras",
    audience: "hombre",
    description:
      "Corte relajado con hombro caído. Algodón peinado para entrenar o usar fuera del box.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    price: 22900,
    colors: ["Negro", "Gris", "Verde oliva"],
  },
  {
    name: "Musculosa Ribbed Fit",
    category: "musculosas",
    audience: "mujer",
    description:
      "Musculosa ribeteada con ajuste contorneado. Suave y elástica para levantamientos y cardio.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1620065756586-974c57610fa5?w=800&q=80",
    price: 18500,
    colors: ["Negro", "Blanco", "Terracota"],
  },
  {
    name: "Musculosa Unisex WOD",
    category: "musculosas",
    audience: "unisex",
    description:
      "Musculosa amplia con sisas profundas. Tejido técnico para máxima movilidad en cada WOD.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1682241367368-6387d5d4921a?w=800&q=80",
    price: 17500,
    colors: ["Negro", "Gris", "Azul"],
  },
  {
    name: "Musculosa CrossFit Pro",
    category: "musculosas",
    audience: "hombre",
    description:
      "Musculosa ajustada con paneles de malla. Ventilación extra para entrenamientos de alta intensidad.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1606889464198-fcb18894cf50?w=800&q=80",
    price: 18900,
    colors: ["Negro", "Gris", "Rojo"],
  },
  {
    name: "Top Longline Support",
    category: "tops",
    audience: "mujer",
    description:
      "Top largo con soporte alto y espalda cruzada. Firmeza y cobertura para entrenar con confianza.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1604603565810-9f2a167d6b6e?w=800&q=80",
    price: 21500,
    colors: ["Negro", "Verde", "Nude"],
  },
  {
    name: "Top Cruzado Yoga-Fit",
    category: "tops",
    audience: "mujer",
    description:
      "Diseño cruzado al frente con tela suave al tacto. Perfecto para funcional, yoga y movilidad.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1611243197233-60b0d07cf8c8?w=800&q=80",
    price: 19900,
    colors: ["Negro", "Rosa", "Arena"],
  },
  {
    name: "Top Halter Performance",
    category: "tops",
    audience: "mujer",
    description:
      "Top halter con soporte medio y tela breathable. Libertad de movimiento en gimnasia y pesas.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1633998979521-11ca9d0e6e38?w=800&q=80",
    price: 20500,
    colors: ["Negro", "Blanco", "Coral"],
  },
  {
    name: "Top Básico Algodón",
    category: "tops",
    audience: "mujer",
    description:
      "Top clásico de algodón con elastano. Cómodo para calentar, estirar o entrenamientos suaves.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1592402062271-11865c38baa1?w=800&q=80",
    price: 16500,
    colors: ["Negro", "Gris", "Blanco"],
  },
  {
    name: "Calza Capri Training",
    category: "leggings",
    audience: "mujer",
    description:
      "Calza capri con cintura alta y tela opaca. Ideal para climas cálidos y entrenamientos mixtos.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1584863495140-a320b13a11a8?w=800&q=80",
    price: 28900,
    colors: ["Negro", "Gris", "Verde"],
  },
  {
    name: "Calza Pocket 7/8",
    category: "leggings",
    audience: "mujer",
    description:
      "Calza 7/8 con bolsillo lateral para el celular. Ajuste firme que no transparenta en sentadillas.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1542338008-05b9957c5f1a?w=800&q=80",
    price: 31900,
    colors: ["Negro", "Azul marino", "Borgoña"],
  },
  {
    name: "Calza Unisex Compression",
    category: "leggings",
    audience: "unisex",
    description:
      "Calza de compresión unisex para running y box. Tejido técnico con gran recuperación.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1610360414307-4264b6649236?w=800&q=80",
    price: 29900,
    colors: ["Negro", "Gris"],
  },
  {
    name: 'Short Bike 4"',
    category: "shorts",
    audience: "mujer",
    description:
      "Short ciclista con cintura alta y tela que no se trasluce. Comodidad en sentadillas y sprints.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1628271491650-c2346e8aa7c5?w=800&q=80",
    price: 23500,
    colors: ["Negro", "Gris", "Rosa"],
  },
  {
    name: "Short Woven Unisex",
    category: "shorts",
    audience: "unisex",
    description:
      "Short liviano tipo woven con cordón ajustable. Secado rápido para cardio y entrenamiento funcional.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1587249247014-079373c40427?w=800&q=80",
    price: 25900,
    colors: ["Negro", "Gris", "Azul"],
  },
  {
    name: "Short Liner Running",
    category: "shorts",
    audience: "hombre",
    description:
      "Short con calza interior integrada y bolsillos zip. Pensado para correr y entrenar al aire libre.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1554139844-af2fc8ad3a3a?w=800&q=80",
    price: 27900,
    colors: ["Negro", "Gris", "Azul marino"],
  },
  {
    name: "Buzo Crop Mujer",
    category: "hoodies",
    audience: "mujer",
    description:
      "Buzo crop con capucha y bolsillo canguro. Algodón fríz suave para antes y después del WOD.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1584863431255-3997371dcc01?w=800&q=80",
    price: 48900,
    colors: ["Negro", "Gris", "Rosa palo"],
  },
  {
    name: "Buzo Full Zip Tech",
    category: "hoodies",
    audience: "unisex",
    description:
      "Buzo con cierre completo y tela técnica. Capa ideal para entrar al box o salir con frío.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    price: 54900,
    colors: ["Negro", "Gris", "Azul"],
  },
  {
    name: "Buzo French Terry",
    category: "hoodies",
    audience: "mujer",
    description:
      "Buzo de french terry con puños y ruedo ribeteados. Cálido y cómodo para recovery days.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1592485641225-bdbadeaa601e?w=800&q=80",
    price: 49900,
    colors: ["Negro", "Crema", "Verde"],
  },
  {
    name: "Rodilleras Neoprene",
    category: "accesorios",
    audience: "unisex",
    description:
      "Par de rodilleras de neoprene de 7 mm. Soporte y calor para squats, lunges y pistols.",
    featured: false,
    outOfStock: true,
    image:
      "https://images.unsplash.com/photo-1532384305128-54c7ac0d7139?w=800&q=80",
    price: 18900,
    colors: ["Negro"],
  },
  {
    name: "Rodilleras 5 mm",
    category: "accesorios",
    audience: "unisex",
    description:
      "Par de rodilleras de neoprene de 5 mm. Soporte liviano para squats, lunges y box jumps.",
    featured: false,
    outOfStock: true,
    image:
      "https://images.unsplash.com/photo-1556817411-485b728b57f5?w=800&q=80",
    price: 15900,
    colors: ["Negro", "Rojo"],
  },
  {
    name: "Bolso Gym Duffle",
    category: "accesorios",
    audience: "unisex",
    description:
      "Bolso tipo duffle con compartimento para calzado y correa ajustable. Llevá todo al box.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1692506530242-c12d6c3ae2e2?w=800&q=80",
    price: 38900,
    colors: ["Negro", "Gris"],
  },
];
