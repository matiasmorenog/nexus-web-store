import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  APPAREL_PRODUCTS,
  APPAREL_SIZES,
  type ApparelSeedProduct,
} from "./seed-data-apparel";
import { VAPE_PRODUCTS } from "./seed-data-vape";
import {
  DEFAULT_STORE_SLUG,
  VAPE_STORE_SLUG,
  SEED_STORES,
  type SeedStoreConfig,
} from "./seed-env";

export const prisma = new PrismaClient();

export const STORE_SLUG_BY_PROFILE = {
  apparel: DEFAULT_STORE_SLUG,
  vape: VAPE_STORE_SLUG,
} as const;

export type StoreProfile = keyof typeof STORE_SLUG_BY_PROFILE;

export function resolveStoreProfile(value: string): StoreProfile | null {
  if (value === "apparel" || value === "vape") return value;
  return null;
}

export function slugToProfile(slug: string): StoreProfile | null {
  if (slug === DEFAULT_STORE_SLUG) return "apparel";
  if (slug === VAPE_STORE_SLUG) return "vape";
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
  product: ApparelSeedProduct,
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

async function seedApparelProducts(storeId: string) {
  for (const product of APPAREL_PRODUCTS) {
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
            APPAREL_SIZES.map((size, sizeIndex) => ({
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

  return APPAREL_PRODUCTS.length;
}

async function seedVapeProducts(storeId: string) {
  for (const product of VAPE_PRODUCTS) {
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

  return VAPE_PRODUCTS.length;
}

type SeedStoreOptions = {
  /** Por defecto true: limpia solo esta tienda antes de insertar. */
  wipeFirst?: boolean;
};

export async function seedApparelStore(options: SeedStoreOptions = {}) {
  const { wipeFirst = true } = options;
  const slug = DEFAULT_STORE_SLUG;

  if (wipeFirst) {
    await wipeStoreBySlug(slug);
  }

  const config = getStoreConfig(slug);
  const { store, admin } = await createStoreWithAdmin(config);
  const productCount = await seedApparelProducts(store.id);

  return { store, admin, config, productCount };
}

export async function seedVapeStore(options: SeedStoreOptions = {}) {
  const { wipeFirst = true } = options;
  const slug = VAPE_STORE_SLUG;

  if (wipeFirst) {
    await wipeStoreBySlug(slug);
  }

  const config = getStoreConfig(slug);
  const { store, admin } = await createStoreWithAdmin(config);
  const productCount = await seedVapeProducts(store.id);

  return { store, admin, config, productCount };
}

export async function seedAllStores(options: SeedStoreOptions = {}) {
  const apparel = await seedApparelStore(options);
  const vape = await seedVapeStore(options);
  return { apparel, vape };
}

export function summarizeApparelSeed() {
  const promo2x1Count = APPAREL_PRODUCTS.filter((product) => product.promo2x1).length;
  const outOfStockProducts = APPAREL_PRODUCTS.filter((product) => product.outOfStock);
  const outOfStockVariants = outOfStockProducts.reduce(
    (sum, product) => sum + product.colors.length * APPAREL_SIZES.length,
    0,
  );
  const byCategory = APPAREL_PRODUCTS.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});

  return { promo2x1Count, outOfStockProducts, outOfStockVariants, byCategory };
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
