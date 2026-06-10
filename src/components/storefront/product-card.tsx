import Image from "next/image";
import Link from "next/link";
import { getCategoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
};

export function ProductCard({ slug, name, category, imageUrl, price }: ProductCardProps) {
  return (
    <Link href={`/producto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-transparent transition-[transform,box-shadow] group-hover:ring-[var(--brand-primary)]/25">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {getCategoryLabel(category)}
        </p>
        <h3 className="text-sm font-medium text-neutral-900 transition-colors group-hover:text-[var(--brand-primary)]">
          {name}
        </h3>
        <p className="text-sm font-semibold text-neutral-900">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
