import Link from "next/link";
import { App2BrandWordmark } from "@/themes/app2/components/home/app2-brand-wordmark";

type App2StoreLogoProps = {
  storeName: string;
  onClick?: () => void;
  className?: string;
};

export function App2StoreLogo({ storeName, onClick, className = "" }: App2StoreLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group shrink-0 transition-opacity hover:opacity-85 ${className}`}
    >
      <App2BrandWordmark storeName={storeName} size="md" />
    </Link>
  );
}
