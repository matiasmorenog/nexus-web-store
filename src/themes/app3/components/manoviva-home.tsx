import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hand, Heart, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { getStoreId } from "@/lib/store-context";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { ManovivaMark } from "@/themes/app3/components/manoviva-mark";

const categories = [
  {
    slug: "portachiavi",
    label: "Portachiavi",
    image: "/app3/lettera-b.png",
  },
  {
    slug: "candele",
    label: "Candele",
    image: "/app3/candela-natale.jpg",
  },
  {
    slug: "saponi",
    label: "Saponi",
    image: "/app3/saponi-cuore.png",
  },
] as const;

async function ManovivaFeaturedProducts() {
  const storeId = await getStoreId();
  const products = await getStorefrontProducts(storeId, {
    featuredOnly: true,
    limit: 4,
  });

  if (products.length === 0) return null;

  return (
    <section className="bg-[#F8F7F2] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C86243]">
              Pezzi scelti
            </p>
            <h2 className="font-manoviva mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#202523] sm:text-4xl">
              Creazioni in evidenza
            </h2>
          </div>
          <Link
            href="/productos?destacados=1"
            className="hidden items-center gap-2 text-sm font-semibold text-[#2351D1] sm:flex"
          >
            Vedi tutte <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              category={product.category}
              audience={product.audience}
              imageUrl={product.imageUrl}
              hoverImageUrl={product.hoverImageUrl}
              price={product.price}
              inStock={product.inStock}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export async function ManovivaHome() {
  return (
    <>
      <section className="manoviva-grid overflow-hidden border-b border-black/10">
        <div className="mx-auto grid min-h-[min(760px,calc(100dvh-4.5rem))] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#202523]/15 bg-[#F2F0E9]/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#59605d] backdrop-blur">
              <Hand className="h-4 w-4 text-[#C86243]" />
              Ogni pezzo nasce a mano
            </div>
            <h1 className="font-manoviva text-[clamp(3.4rem,8vw,6.7rem)] font-semibold leading-[.88] tracking-[-0.075em] text-[#202523]">
              La materia
              <span className="block text-[#2351D1]">prende vita.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#59605d] sm:text-lg sm:leading-8">
              Regali personalizzati, piccoli ricordi e creazioni artigianali
              pensati per raccontare una persona, un momento, una storia.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-full bg-[#2351D1] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(35,81,209,.22)] transition-transform hover:-translate-y-0.5"
              >
                Scopri le creazioni <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center rounded-full border border-[#202523]/20 px-6 py-3.5 text-sm font-semibold text-[#202523] transition-colors hover:bg-white/60"
              >
                Crea il tuo regalo
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[620px] sm:h-[620px]">
            <div className="absolute left-[4%] top-[3%] h-[72%] w-[67%] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(32,37,35,.16)] sm:rounded-[3rem]">
              <Image
                src="/app3/lettera-b.png"
                alt="Portachiavi personalizzato in resina con fiori"
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 1024px) 67vw, 390px"
              />
            </div>
            <div className="absolute bottom-[2%] right-[1%] h-[46%] w-[44%] overflow-hidden rounded-[1.6rem] border-[8px] border-[#F2F0E9] bg-white shadow-[0_24px_60px_rgba(32,37,35,.18)] sm:rounded-[2.5rem]">
              <Image
                src="/app3/candela-natale.jpg"
                alt="Candela artigianale decorata"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 44vw, 260px"
              />
            </div>
            <div className="absolute right-[2%] top-[4%] flex h-24 w-24 items-center justify-center rounded-full bg-[#C86243] text-white shadow-xl sm:h-28 sm:w-28">
              <ManovivaMark inverse className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#202523] text-[#F2F0E9]">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/10 sm:grid-cols-3">
          {[
            [Hand, "Fatto a mano", "Ogni creazione è lavorata una alla volta."],
            [Sparkles, "Personalizzabile", "Colori, nomi e dettagli scelti insieme."],
            [Heart, "Fatto per te", "Un regalo unico, pensato per chi lo riceve."],
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="bg-[#202523] px-6 py-8 sm:px-8">
              <Icon className="h-5 w-5 text-[#C86243]" />
              <h2 className="font-manoviva mt-4 text-lg font-semibold">{String(title)}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{String(text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C86243]">
              La collezione
            </p>
            <h2 className="font-manoviva mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#202523] sm:text-5xl">
              Un gesto speciale,
              <span className="block text-[#2351D1]">in ogni dettaglio.</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/productos?categoria=${category.slug}`}
                className="group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#202523]"
              >
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#202523]/90 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div>
                    <span className="text-xs font-semibold text-[#C86243]">0{index + 1}</span>
                    <h3 className="font-manoviva mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {category.label}
                    </h3>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition-colors group-hover:bg-white group-hover:text-[#202523]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ManovivaFeaturedProducts />

      <section className="overflow-hidden bg-[#2351D1] text-white">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <Image
              src="/app3/saponi-cuore.png"
              alt="Saponi artigianali a forma di cuore"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16">
            <ManovivaMark inverse className="h-16 w-16" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              Su misura
            </p>
            <h2 className="font-manoviva mt-3 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">
              Hai un&apos;idea?
              <span className="block text-[#F1B09C]">Diamole vita insieme.</span>
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-white/75">
              Raccontaci l&apos;occasione, i colori e la persona a cui stai pensando.
              Prepariamo una proposta personalizzata prima di iniziare.
            </p>
            <Link
              href="/contacto"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#2351D1]"
            >
              Parliamo del tuo progetto <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
