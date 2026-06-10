import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    name: "Remera Dry-Fit WOD",
    category: "tops",
    description:
      "Remera de secado rápido con tecnología anti-olor. Ideal para entrenamientos de alta intensidad y CrossFit.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1647438174616-7bc61ca38455?w=800&q=80",
    price: 21900,
    colors: ["Negro", "Gris", "Azul marino"],
  },
  {
    name: "Top Deportivo Sin Mangas",
    category: "tops",
    description:
      "Top con soporte medio y tela breathable. Libertad total de movimiento para levantamientos y gimnasia.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=800&q=80",
    price: 18900,
    colors: ["Negro", "Rosa", "Verde"],
  },
  {
    name: "Legging Alta Compresión",
    category: "leggings",
    description:
      "Calza de compresión con cintura alta que no se mueve. Perfecta para sentadillas, burpees y cardio.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1721969982799-fb9a78c43e7f?w=800&q=80",
    price: 32900,
    colors: ["Negro", "Gris jaspeado", "Borgoña"],
  },
  {
    name: 'Short Training 5"',
    category: "shorts",
    description:
      "Short liviano con liner interno y bolsillo para llaves. Diseñado para box jumps y sprints.",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=800&q=80",
    price: 24900,
    colors: ["Negro", "Azul", "Gris"],
  },
  {
    name: "Hoodie Oversize Post-WOD",
    category: "hoodies",
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
    category: "tops",
    description:
      "Remera con estampa motivacional para la comunidad funcional. Algodón mezclado con elastano.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1659025162971-8d33b4d5e008?w=800&q=80",
    price: 19900,
    colors: ["Negro", "Blanco"],
  },
  {
    name: "Legging Seamless Cintura Alta",
    category: "leggings",
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
    description:
      "Short de entrenamiento con stretch en 4 direcciones. Resistente al roce en barras y cuerdas.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1752778597990-f28dfb13c551?w=800&q=80",
    price: 26900,
    colors: ["Negro", "Verde militar", "Gris"],
  },
  {
    name: "Buzo Half-Zip Performance",
    category: "hoodies",
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
    description:
      "Par de muñequeras acolchadas para protección en handstand push-ups y levantamientos.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1671581081106-283f2bcdef71?w=800&q=80",
    price: 12900,
    colors: ["Negro", "Gris"],
  },
  {
    name: "Remera Manga Larga Tech",
    category: "tops",
    description:
      "Remera manga larga con protección UV y secado rápido. Para entrenar al aire libre o en invierno.",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1732624931650-347ec49b06e2?w=800&q=80",
    price: 27900,
    colors: ["Negro", "Blanco", "Azul"],
  },
];

const SIZES = ["XS", "S", "M", "L", "XL"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userStore.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      name: "Alaska Indumentaria",
      slug: "alaska-indumentaria",
      primaryColor: "#db2777",
      secondaryColor: "#ffffff",
      shippingFlatRate: 2500,
      allowPickup: true,
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@alaskaindumentaria.com",
      passwordHash,
      name: "Admin Alaska",
      role: UserRole.STORE_OWNER,
      stores: {
        create: { storeId: store.id },
      },
    },
  });

  for (const product of PRODUCTS) {
    const slug = slugify(product.name);
    await prisma.product.create({
      data: {
        storeId: store.id,
        name: product.name,
        slug,
        description: product.description,
        category: product.category,
        featured: product.featured,
        variants: {
          create: product.colors.flatMap((color, colorIndex) =>
            SIZES.map((size, sizeIndex) => ({
              size,
              color,
              sku: `${slug}-${color.slice(0, 3).toUpperCase()}-${size}`,
              stock: 10 + ((colorIndex + sizeIndex) % 5),
              price: product.price,
              imageUrl: product.image,
            })),
          ),
        },
      },
    });
  }

  console.log("Seed completed:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email} / admin123`);
  console.log(`  Products: ${PRODUCTS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
