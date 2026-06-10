import Link from "next/link";

type StoreLogoProps = {
  storeName: string;
  onClick?: () => void;
  className?: string;
};

function splitStoreName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { brand: name, tagline: null };
  }
  return { brand: parts[0], tagline: parts.slice(1).join(" ") };
}

export function StoreLogo({ storeName, onClick, className = "" }: StoreLogoProps) {
  const { brand, tagline } = splitStoreName(storeName);

  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group flex flex-col leading-none ${className}`}
    >
      <span className="font-display text-2xl font-bold uppercase tracking-wide text-[var(--brand-primary)] transition-opacity group-hover:opacity-80 sm:text-[1.65rem]">
        {brand}
      </span>
      {tagline && (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          {tagline}
        </span>
      )}
    </Link>
  );
}
