import type { Account } from "next-auth";
import { db } from "@/lib/db";

export async function upsertGoogleAccount(userId: string, account: Account) {
  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
    update: {
      access_token: account.access_token ?? undefined,
      refresh_token: account.refresh_token ?? undefined,
      expires_at: account.expires_at ?? undefined,
      token_type: account.token_type ?? undefined,
      scope: account.scope ?? undefined,
      id_token: account.id_token ?? undefined,
      session_state:
        typeof account.session_state === "string"
          ? account.session_state
          : undefined,
    },
    create: {
      userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      access_token: account.access_token ?? undefined,
      refresh_token: account.refresh_token ?? undefined,
      expires_at: account.expires_at ?? undefined,
      token_type: account.token_type ?? undefined,
      scope: account.scope ?? undefined,
      id_token: account.id_token ?? undefined,
      session_state:
        typeof account.session_state === "string"
          ? account.session_state
          : undefined,
    },
  });
}

export async function loadUserForToken(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      stores: {
        include: { store: true },
        take: 1,
      },
    },
  });
}

export async function loadUserByEmailForToken(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      stores: {
        include: { store: true },
        take: 1,
      },
    },
  });
}

export function mapUserToTokenFields(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  stores: Array<{ storeId: string; store: { slug: string } }>;
}) {
  if (user.role === "CUSTOMER") {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: null,
      storeSlug: null,
    };
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    storeId: user.stores[0]?.storeId ?? null,
    storeSlug: user.stores[0]?.store.slug ?? null,
  };
}
