import { PrismaClient } from "@prisma/client";

const FROM_SLUG = process.env.MIGRATE_FROM_SLUG ?? "alaska-indumentaria";
const TO_SLUG =
  process.env.MIGRATE_TO_SLUG ??
  process.env.DEFAULT_STORE_SLUG ??
  "demo-store";
const TO_STORE_NAME = process.env.MIGRATE_STORE_NAME?.trim();
const FROM_ADMIN_EMAIL =
  process.env.MIGRATE_FROM_ADMIN_EMAIL ?? "admin@alaskaindumentaria.com";
const TO_ADMIN_EMAIL = process.env.MIGRATE_TO_ADMIN_EMAIL?.trim();

const prisma = new PrismaClient();

async function main() {
  if (FROM_SLUG === TO_SLUG) {
    console.log(`Slug unchanged ("${TO_SLUG}"). Nothing to do.`);
    return;
  }

  const store = await prisma.store.findUnique({ where: { slug: FROM_SLUG } });

  if (!store) {
    const atTarget = await prisma.store.findUnique({ where: { slug: TO_SLUG } });
    if (atTarget) {
      if (TO_STORE_NAME && atTarget.name !== TO_STORE_NAME) {
        await prisma.store.update({
          where: { id: atTarget.id },
          data: { name: TO_STORE_NAME },
        });
        console.log(`Store name updated to: ${TO_STORE_NAME}`);
      } else {
        console.log(`Store already uses slug "${TO_SLUG}". Migration already applied.`);
      }
      return;
    }
    throw new Error(`Store with slug "${FROM_SLUG}" not found.`);
  }

  const slugConflict = await prisma.store.findUnique({ where: { slug: TO_SLUG } });
  if (slugConflict && slugConflict.id !== store.id) {
    throw new Error(`Slug "${TO_SLUG}" is already used by another store.`);
  }

  await prisma.store.update({
    where: { id: store.id },
    data: {
      slug: TO_SLUG,
      ...(TO_STORE_NAME ? { name: TO_STORE_NAME } : {}),
    },
  });

  console.log(`Store slug: ${FROM_SLUG} → ${TO_SLUG}`);
  if (TO_STORE_NAME) {
    console.log(`Store name updated to: ${TO_STORE_NAME}`);
  }

  if (TO_ADMIN_EMAIL && TO_ADMIN_EMAIL !== FROM_ADMIN_EMAIL) {
    const admin = await prisma.user.findUnique({
      where: { email: FROM_ADMIN_EMAIL },
    });
    if (admin) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { email: TO_ADMIN_EMAIL },
      });
      console.log(`Admin email: ${FROM_ADMIN_EMAIL} → ${TO_ADMIN_EMAIL}`);
    }
  }

  console.log("\nNext steps:");
  console.log(`  1. Set DEFAULT_STORE_SLUG="${TO_SLUG}" in .env and Vercel`);
  console.log("  2. Redeploy on Vercel");
  console.log("  3. Re-login admin if the email changed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
