import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const VAPE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1607619056574-7b8d3eeec281?w=1600&q=80";

type VapeHomeHeroProps = {
  storeDisplayName: string;
};

export function VapeHomeHero({ storeDisplayName }: VapeHomeHeroProps) {
  return (
    <section className="relative min-h-[min(70vh,32rem)] overflow-hidden bg-neutral-950 text-white">
      <Image
        src={VAPE_HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/70 to-neutral-950/30" />
      <div className="relative mx-auto flex min-h-[min(70vh,32rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          {storeDisplayName}
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Tu próximo{" "}
          <span className="text-[var(--brand-primary)]">vape</span> está acá
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-300">
          Dispositivos, líquidos y accesorios seleccionados. Elegí tu producto y
          comprá en pocos pasos.
        </p>
        <div className="mt-8">
          <Link href="#productos-vape">
            <Button size="lg">Ver productos</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
