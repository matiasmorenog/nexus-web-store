"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomerSignOutButton } from "@/components/storefront/customer-sign-out-button";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import {
  isOrdersPathname,
  isSecurityPathname,
  isWishlistPathname,
  storefrontPath,
} from "@/lib/storefront-paths";
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
  const copy = getLocaleCopy();

  const links = [
    {
      href: storefrontPath("accountOrders"),
      label: copy.ordersNav,
      active: isOrdersPathname(pathname),
    },
    ...(wishlistEnabled
      ? [
          {
            href: storefrontPath("wishlist"),
            label: copy.favoritesNav,
            active: isWishlistPathname(pathname),
          },
        ]
      : []),
    {
      href: storefrontPath("security"),
      label: copy.securityNav,
      active: isSecurityPathname(pathname),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 lg:gap-6">
      <nav
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        aria-label={copy.accountNav}
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
