"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      className={cn(
        "product-image-fade object-cover",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
