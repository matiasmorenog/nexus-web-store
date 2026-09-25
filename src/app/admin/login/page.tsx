import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import { ADMIN_LOCALE_COOKIE, adminLogin, parseAdminLocale } from "@/lib/admin-locale";
import { storefrontPath } from "@/lib/storefront-paths";
import { auth } from "@/lib/auth";
import { getBrandPrefix } from "@/lib/brand";
import { getMerchantEmailOptional } from "@/lib/merchant-email";
import { formatStoreName, getStore } from "@/lib/store-context";
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD,
} from "@/lib/demo-admin-credentials";
import { isGoogleAuthEnabled } from "@/lib/auth-session";

async function getLoginDefaultEmail(storeId: string) {
  const fromDb = await getMerchantEmailOptional(storeId);
  if (fromDb) return fromDb;
  // Tras db:seed el cache de getStore puede quedar con un storeId viejo; en dev
  // prellenamos con el email del seed para no bloquear el login demo.
  if (process.env.NODE_ENV === "development") {
    return SEED_ADMIN_EMAIL;
  }
  return "";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const { reset, error } = await searchParams;
  const session = await auth();

  if (session?.user?.role === "CUSTOMER") {
    redirect(storefrontPath("accountOrders"));
  }

  if (session) {
    redirect("/admin");
  }

  const store = await getStore();
  const displayName = formatStoreName(store.name);
  const ownerEmail = await getLoginDefaultEmail(store.id);
  const brandPrefix = getBrandPrefix(store.name);
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  const copy = adminLogin[locale];
  const loginError =
    error === "google_not_admin"
      ? copy.googleNotAdmin
      : error === "OAuthAccountNotLinked"
        ? copy.googleLinkError
        : null;

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-[var(--brand-primary-darker,#18181b)] p-12 text-white lg:flex">
        <div className="h-1 w-14 bg-[var(--brand-primary)]" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{displayName}</h1>
          <p className="mt-3 text-lg text-neutral-400">{copy.panel}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-500">
            {copy.panelLead}
          </p>
        </div>
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} {displayName}
        </p>
      </div>

      <div className="flex flex-1 flex-col bg-[#f6f6f7]">
        <div className="h-0.5 w-full bg-[var(--brand-primary)] lg:hidden" />
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <h1 className="text-2xl font-bold text-neutral-900">
                {brandPrefix}{" "}
                <span className="text-[var(--brand-primary)]">Admin</span>
              </h1>
              <p className="mt-1 text-sm text-neutral-500">{copy.panel}</p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-8 shadow-sm">
              <div className="mb-4 flex justify-end">
                <AdminLocaleSwitcher locale={locale} tone="light" />
              </div>
              <h2 className="mb-6 text-lg font-semibold text-neutral-900">
                {copy.signIn}
              </h2>
              {reset === "1" ? (
                <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                  {copy.passwordUpdated}
                </p>
              ) : null}
              {loginError ? (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </p>
              ) : null}
              <LoginForm
                defaultEmail={ownerEmail}
                defaultPassword={SEED_ADMIN_PASSWORD}
                googleAuthEnabled={isGoogleAuthEnabled()}
                copy={copy}
              />
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              <Link
                href="/"
                className="transition-colors hover:text-[var(--brand-primary)]"
              >
                {copy.backToStore}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
