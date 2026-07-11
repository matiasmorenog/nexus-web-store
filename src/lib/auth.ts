import NextAuth from "next-auth";
import type { Account, NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { resolveAdminStoreId } from "@/lib/admin-store";
import {
  loadUserByEmailForToken,
  loadUserForToken,
  mapUserToTokenFields,
  upsertGoogleAccount,
} from "@/lib/auth-google";
import {
  ADMIN_SESSION_MAX_AGE,
  AUTH_CONTEXT_COOKIE,
  AUTH_REMEMBER_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  isAdminRole,
  isCustomerAuthContext,
  isGoogleAuthEnabled,
  customerAuthErrorPath,
  sessionContextForAuth,
  REMEMBER_SESSION_MAX_AGE,
  type AuthLoginContext,
} from "@/lib/auth-session";

function applySessionExpiry(
  token: JWT,
  context: AuthLoginContext,
  remember: boolean,
) {
  const maxAge =
    context === "admin"
      ? remember
        ? REMEMBER_SESSION_MAX_AGE
        : ADMIN_SESSION_MAX_AGE
      : remember
        ? REMEMBER_SESSION_MAX_AGE
        : CUSTOMER_SESSION_MAX_AGE;

  token.exp = Math.floor(Date.now() / 1000) + maxAge;
}

async function readAuthIntent(): Promise<{
  context: AuthLoginContext | undefined;
  remember: boolean;
}> {
  const cookieStore = await cookies();
  const rawContext = cookieStore.get(AUTH_CONTEXT_COOKIE)?.value;
  const remember = cookieStore.get(AUTH_REMEMBER_COOKIE)?.value === "1";

  if (rawContext === "customer" || rawContext === "customer_register" || rawContext === "admin") {
    cookieStore.delete(AUTH_CONTEXT_COOKIE);
    cookieStore.delete(AUTH_REMEMBER_COOKIE);
    return { context: rawContext, remember };
  }

  return { context: undefined, remember: false };
}

async function hydrateTokenFromDbUser(token: JWT, userId: string) {
  const dbUser = await loadUserForToken(userId);
  if (!dbUser) {
    token.storeId = null;
    token.storeSlug = null;
    return;
  }

  const mapped = mapUserToTokenFields(dbUser);
  token.sub = mapped.id;
  token.role = mapped.role;
  token.email = mapped.email;
  token.name = mapped.name;
  token.storeId = mapped.storeId;
  token.storeSlug = mapped.storeSlug;
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const normalizedEmail = (credentials.email as string).trim().toLowerCase();

      const user = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          stores: {
            include: { store: true },
            take: 1,
          },
        },
      });

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(
        credentials.password as string,
        user.passwordHash,
      );

      if (!valid) return null;

      return mapUserToTokenFields(user);
    },
  }),
];

if (isGoogleAuthEnabled()) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_SESSION_MAX_AGE,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const cookieStore = await cookies();
      const context = cookieStore.get(AUTH_CONTEXT_COOKIE)?.value;

      if (
        !context ||
        (!isCustomerAuthContext(context) && context !== "admin")
      ) {
        return false;
      }

      const email = (profile?.email ?? user.email)?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      let dbUser = await db.user.findUnique({ where: { email } });

      if (context === "admin") {
        if (!dbUser || !isAdminRole(dbUser.role)) {
          return "/admin/login?error=google_not_admin";
        }
      } else if (isCustomerAuthContext(context)) {
        if (dbUser && dbUser.role !== "CUSTOMER") {
          return `${customerAuthErrorPath(context)}?error=google_admin`;
        }

        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              email,
              name: profile?.name ?? user.name ?? null,
              role: "CUSTOMER",
              passwordHash: null,
            },
          });
        } else if (!dbUser.name && (profile?.name ?? user.name)) {
          dbUser = await db.user.update({
            where: { id: dbUser.id },
            data: { name: profile?.name ?? user.name ?? null },
          });
        }
      }

      if (!dbUser) {
        return false;
      }

      await upsertGoogleAccount(dbUser.id, account as Account);
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const email = (profile?.email ?? token.email)?.trim().toLowerCase();
        if (email) {
          const dbUser = await loadUserByEmailForToken(email);
          if (dbUser) {
            const mapped = mapUserToTokenFields(dbUser);
            token.sub = mapped.id;
            token.role = mapped.role;
            token.email = mapped.email;
            token.name = mapped.name;
            token.storeId = mapped.storeId;
            token.storeSlug = mapped.storeSlug;
          }
        }

        const { context, remember } = await readAuthIntent();
        if (context) {
          applySessionExpiry(
            token,
            sessionContextForAuth(context),
            remember,
          );
        }
        return token;
      }

      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
        token.storeSlug = user.storeSlug;

        const { context, remember } = await readAuthIntent();
        const resolvedContext: AuthLoginContext =
          context ??
          (user.role === "CUSTOMER" ? "customer" : "admin");
        applySessionExpiry(
          token,
          sessionContextForAuth(resolvedContext),
          remember,
        );
        return token;
      }

      if (!token.sub) return token;

      if (token.role === "CUSTOMER") {
        token.storeId = null;
        token.storeSlug = null;
        return token;
      }

      if (
        typeof token.storeId === "string" &&
        typeof token.storeSlug === "string"
      ) {
        return token;
      }

      await hydrateTokenFromDbUser(token, token.sub);

      if (
        typeof token.storeId !== "string" ||
        typeof token.storeSlug !== "string"
      ) {
        const { storeId, storeSlug } = await resolveAdminStoreId(token.sub);
        token.storeId = storeId;
        token.storeSlug = storeSlug;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.storeId =
          typeof token.storeId === "string" ? token.storeId : null;
        session.user.storeSlug =
          typeof token.storeSlug === "string" ? token.storeSlug : null;
      }
      return session;
    },
  },
});
