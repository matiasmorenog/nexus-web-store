import Link from "next/link";
import { getBrandPrefix } from "@/lib/brand";

type StoreLogoProps = {
  storeName: string;
  brandSuffix?: string;
  onClick?: () => void;
  className?: string;
};

export function StoreLogo({
  storeName,
  brandSuffix = "",
  onClick,
  className = "",
}: StoreLogoProps) {
  const brand = getBrandPrefix(storeName, brandSuffix);

  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group flex flex-col leading-none ${className}`}
    >
      <span className="font-display text-2xl font-bold uppercase tracking-wide text-[var(--brand-primary)] transition-opacity group-hover:opacity-80 sm:text-[1.65rem]">
        {brand}
      </span>
      {brandSuffix ? (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          {brandSuffix}
        </span>
      ) : null}
    </Link>
  );
}
