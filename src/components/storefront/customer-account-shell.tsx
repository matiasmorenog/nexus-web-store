import { CustomerAccountNav } from "@/components/storefront/customer-account-nav";

type CustomerAccountShellProps = {
  displayName: string;
  email?: string | null;
  wishlistEnabled: boolean;
  children: React.ReactNode;
};

export function CustomerAccountShell({
  displayName,
  email,
  wishlistEnabled,
  children,
}: CustomerAccountShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,15rem)_1fr]">
          <aside className="flex flex-col border-b border-neutral-200/90 bg-neutral-50/60 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="mb-5 lg:mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Mi cuenta
              </p>
              <p className="mt-1 truncate text-base font-semibold text-neutral-900">
                {displayName}
              </p>
              {email ? (
                <p className="mt-0.5 truncate text-sm text-neutral-500">{email}</p>
              ) : null}
            </div>
            <CustomerAccountNav wishlistEnabled={wishlistEnabled} />
          </aside>

          <main className="min-w-0 p-5 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
