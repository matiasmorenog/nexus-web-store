"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomerSignOutButton } from "@/components/storefront/customer-sign-out-button";
import { cn } from "@/lib/utils";

type CustomerAccountNavProps = {
  wishlistEnabled: boolean;
};

const linkClass = (active: boolean) =>
  cn(
    "inline-flex shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:w-full",
    active
      ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
  );

export function CustomerAccountNav({ wishlistEnabled }: CustomerAccountNavProps) {
  const pathname = usePathname();

  const links = [
    {
      href: "/cuenta/pedidos",
      label: "Mis pedidos",
      active:
        pathname === "/cuenta/pedidos" ||
        pathname.startsWith("/cuenta/pedidos/"),
    },
    ...(wishlistEnabled
      ? [
          {
            href: "/favoritos",
            label: "Favoritos",
            active: pathname === "/favoritos",
          },
        ]
      : []),
    {
      href: "/cuenta/seguridad",
      label: "Seguridad",
      active: pathname === "/cuenta/seguridad",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 lg:gap-6">
      <nav
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        aria-label="Mi cuenta"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(link.active)}
            aria-current={link.active ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-neutral-200/80 pt-4 lg:mt-auto">
        <CustomerSignOutButton className="w-full justify-center" />
      </div>
    </div>
  );
}
