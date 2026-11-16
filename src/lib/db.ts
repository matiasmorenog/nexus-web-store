import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Use the `pg` driver instead of Prisma's Rust engine.
 * Local networks that hang on IPv6 AAAA → P1001 with the default engine;
 * `family: 4` forces IPv4 for Node DNS lookups.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Prefer IPv4 — Neon AAAA often hangs on some home networks / macOS stacks.
    ...(process.env.NODE_ENV === "production" ? {} : { family: 4 }),
    max: process.env.NODE_ENV === "production" ? 1 : 5,
    connectionTimeoutMillis: 15_000,
  });

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.pgPool = pool;
}
