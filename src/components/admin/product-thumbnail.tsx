import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductThumbnailProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

/**
 * Miniatura fija para tablas admin (3:4). object-cover evita diferencias
 * entre fotos subidas (WebP) y URLs externas con distinto aspect ratio.
 */
export function ProductThumbnail({ src, alt, className }: ProductThumbnailProps) {
  return (
    <div
      className={cn(
        "relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100 ring-1 ring-inset ring-neutral-200/80 lg:h-12 lg:w-9",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1023px) 48px, 36px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon
            className="h-5 w-5 text-neutral-300 lg:h-4 lg:w-4"
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  );
}
