import Link from "next/link";
import { VapeBrandWordmark } from "@/components/storefront/home/vape/vape-brand-wordmark";

type VapeStoreLogoProps = {
  storeName: string;
  onClick?: () => void;
  className?: string;
};

export function VapeStoreLogo({ storeName, onClick, className = "" }: VapeStoreLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group shrink-0 transition-opacity hover:opacity-85 ${className}`}
    >
      <VapeBrandWordmark storeName={storeName} size="md" />
    </Link>
  );
}
