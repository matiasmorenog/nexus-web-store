import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  APP1_PRODUCTS,
  APP1_SIZES,
  type App1SeedProduct,
} from "./seed-data-app1";
import { APP2_PRODUCTS } from "./seed-data-app2";
import {
  DEFAULT_STORE_SLUG,
  APP2_STORE_SLUG,
  SEED_STORES,
  SEED_CUSTOMER_EMAIL,
  SEED_CUSTOMER_NAME,
  SEED_CUSTOMER_PASSWORD,
  OBSOLETE_SEED_CUSTOMER_EMAILS,
  type SeedStoreConfig,
} from "./seed-env";

export const prisma = new PrismaClient();

export const STORE_SLUG_BY_PROFILE = {
  app1: DEFAULT_STORE_SLUG,
  app2: APP2_STORE_SLUG,
} as const;

export type StoreProfile = keyof typeof STORE_SLUG_BY_PROFILE;

export function resolveStoreProfile(value: string): StoreProfile | null {
  if (value === "app1" || value === "app2") return value;
  return null;
}

export function slugToProfile(slug: string): StoreProfile | null {
  if (slug === DEFAULT_STORE_SLUG) return "app1";
  if (slug === APP2_STORE_SLUG) return "app2";
  return null;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedVariantStock(
  product: App1SeedProduct,
  colorIndex: number,
  sizeIndex: number,
): number {
  if (product.outOfStock) return 0;
  return 10 + ((colorIndex + sizeIndex) % 5);
}

function getStoreConfig(slug: string): SeedStoreConfig {
  const config = SEED_STORES.find((store) => store.slug === slug);
  if (!config) {
    throw new Error(`Slug "${slug}" no está en prisma/seed-env.ts → SEED_STORES`);
  }
  return config;
}

/** Borra pedidos, productos, vínculos y la fila Store de una tienda. No toca la otra. */
export async function wipeStoreBySlug(slug: string): Promise<boolean> {
  const store = await prisma.store.findUnique({ where: { slug } });

  if (!store) {
    console.log(`No existe tienda con slug "${slug}". Nada para limpiar.`);
    return false;
  }

  const storeId = store.id;

  await prisma.orderItem.deleteMany({
    where: { order: { storeId } },
  });
  await prisma.order.deleteMany({ where: { storeId } });
  await prisma.productVariant.deleteMany({
    where: { product: { storeId } },
  });
  await prisma.product.deleteMany({ where: { storeId } });

  const linkedUsers = await prisma.userStore.findMany({
    where: { storeId },
    select: { userId: true },
  });

  await prisma.userStore.deleteMany({ where: { storeId } });
  await prisma.store.delete({ where: { id: storeId } });

  for (const { userId } of linkedUsers) {
    const remainingStores = await prisma.userStore.count({ where: { userId } });
    if (remainingStores === 0) {
      await prisma.user.delete({ where: { id: userId } });
    }
  }

  console.log(
    `Tienda "${slug}" eliminada (pedidos, productos y owner si quedó sin otras tiendas).`,
  );
  return true;
}

export async function wipeStore(profile: StoreProfile): Promise<boolean> {
  return wipeStoreBySlug(STORE_SLUG_BY_PROFILE[profile]);
}

const DEMO_TRANSFER_INSTRUCTIONS = `Titular: Demo Store
Banco: Banco Demo
CBU: 0000000000000000000000
Alias: demo.store.mp`;

async function seedDemoPaymentSettings(storeId: string) {
  await prisma.storePaymentSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      transferEnabled: true,
      transferInstructions: DEMO_TRANSFER_INSTRUCTIONS,
    },
    update: {
      transferEnabled: true,
      transferInstructions: DEMO_TRANSFER_INSTRUCTIONS,
    },
  });
}

async function createStoreWithAdmin(config: SeedStoreConfig) {
  const store = await prisma.store.create({
    data: {
      name: config.name,
      slug: config.slug,
      primaryColor: config.primaryColor,
      secondaryColor: "#ffffff",
      shippingFlatRate: config.shippingFlatRate,
      allowPickup: true,
    },
  });

  const passwordHash = await bcrypt.hash(config.adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: config.adminEmail,
      passwordHash,
      name: `${config.adminDisplayName} ${config.name}`,
      role: UserRole.STORE_OWNER,
      stores: {
        create: { storeId: store.id },
      },
    },
  });

  return { store, admin, config };
}

async function seedApp1Products(storeId: string) {
  for (const product of APP1_PRODUCTS) {
    const slug = slugify(product.name);
    await prisma.product.create({
      data: {
        storeId,
        name: product.name,
        slug,
        description: product.description,
        category: product.category,
        audience: product.audience,
        featured: product.featured,
        promo2x1: product.promo2x1 ?? false,
        variants: {
          create: product.colors.flatMap((color, colorIndex) =>
            APP1_SIZES.map((size, sizeIndex) => ({
              size,
              color,
              sku: `${slug}-${color.slice(0, 3).toUpperCase()}-${size}`,
              stock: seedVariantStock(product, colorIndex, sizeIndex),
              price: product.price,
              imageUrl: product.image,
            })),
          ),
        },
      },
    });
  }

  return APP1_PRODUCTS.length;
}

async function seedApp2Products(storeId: string) {
  for (const product of APP2_PRODUCTS) {
    const slug = slugify(product.name);
    await prisma.product.create({
      data: {
        storeId,
        name: product.name,
        slug,
        description: product.description,
        category: product.category,
        audience: "unisex",
        featured: product.featured,
        promo2x1: false,
        variants: {
          create: product.variants.map((variant) => ({
            size: variant.nicotina,
            color: variant.sabor,
            sku: `${slug}-${variant.sabor.slice(0, 3).toUpperCase()}-${variant.nicotina}`,
            stock: variant.stock ?? 10,
            price: product.price,
            imageUrl: product.image,
          })),
        },
      },
    });
  }

  return APP2_PRODUCTS.length;
}

type SeedStoreOptions = {
  /** Por defecto true: limpia solo esta tienda antes de insertar. */
  wipeFirst?: boolean;
};

export async function seedApp1Store(options: SeedStoreOptions = {}) {
  const { wipeFirst = true } = options;
  const slug = DEFAULT_STORE_SLUG;

  if (wipeFirst) {
    await wipeStoreBySlug(slug);
  }

  const config = getStoreConfig(slug);
  const { store, admin } = await createStoreWithAdmin(config);
  const productCount = await seedApp1Products(store.id);
  await seedDemoPaymentSettings(store.id);

  return { store, admin, config, productCount };
}

export async function seedApp2Store(options: SeedStoreOptions = {}) {
  const { wipeFirst = true } = options;
  const slug = APP2_STORE_SLUG;

  if (wipeFirst) {
    await wipeStoreBySlug(slug);
  }

  const config = getStoreConfig(slug);
  const { store, admin } = await createStoreWithAdmin(config);
  const productCount = await seedApp2Products(store.id);

  return { store, admin, config, productCount };
}

/** Cuenta cliente demo compartida (pedidos demo por email). */
export async function ensureSeedCustomerUser() {
  await prisma.user.deleteMany({
    where: { email: { in: [...OBSOLETE_SEED_CUSTOMER_EMAILS] } },
  });

  const passwordHash = await bcrypt.hash(SEED_CUSTOMER_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email: SEED_CUSTOMER_EMAIL },
    update: {
      passwordHash,
      name: SEED_CUSTOMER_NAME,
      role: UserRole.CUSTOMER,
    },
    create: {
      email: SEED_CUSTOMER_EMAIL,
      passwordHash,
      name: SEED_CUSTOMER_NAME,
      role: UserRole.CUSTOMER,
    },
  });
}

export async function seedAllStores(options: SeedStoreOptions = {}) {
  const app1 = await seedApp1Store(options);
  const app2 = await seedApp2Store(options);
  await ensureSeedCustomerUser();
  return { app1, app2 };
}

export function summarizeApp1Seed() {
  const promo2x1Count = APP1_PRODUCTS.filter((product) => product.promo2x1).length;
  const outOfStockProducts = APP1_PRODUCTS.filter((product) => product.outOfStock);
  const outOfStockVariants = outOfStockProducts.reduce(
    (sum, product) => sum + product.colors.length * APP1_SIZES.length,
    0,
  );
  const byCategory = APP1_PRODUCTS.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});

  return { promo2x1Count, outOfStockProducts, outOfStockVariants, byCategory };
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
