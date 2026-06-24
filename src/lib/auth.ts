import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resolveAdminStoreId } from "@/lib/admin-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            stores: {
              include: { store: true },
              take: 1,
            },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.stores[0]?.storeId ?? null,
          storeSlug: user.stores[0]?.store.slug ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
        token.storeSlug = user.storeSlug;
        return token;
      }

      if (!token.sub) return token;

      if (typeof token.storeId === "string" && typeof token.storeSlug === "string") {
        return token;
      }

      const dbUser = await db.user.findUnique({
        where: { id: token.sub },
        include: {
          stores: {
            take: 1,
            include: { store: { select: { id: true, slug: true } } },
          },
        },
      });

      if (!dbUser) {
        token.storeId = null;
        token.storeSlug = null;
        return token;
      }

      const linked = dbUser.stores[0]?.store;
      if (linked) {
        token.storeId = linked.id;
        token.storeSlug = linked.slug;
        return token;
      }

      const { storeId, storeSlug } = await resolveAdminStoreId(token.sub);
      token.storeId = storeId;
      token.storeSlug = storeSlug;
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
