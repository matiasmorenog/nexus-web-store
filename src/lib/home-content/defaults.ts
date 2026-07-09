import { getHomeHeroSlides, HOME_HERO_AUTOPLAY_MS } from "@/lib/home-hero-slides";
import { app1Config } from "@/lib/store-verticals/app1/config";
import {
  APP2_HOME_CATEGORIES,
  APP2_HOME_FEATURES,
  APP2_HERO_STATS,
  APP2_PROMO,
} from "@/lib/store-verticals/app2/home-content";
import { app2CatalogHref } from "@/lib/store-verticals/app2/config";
import type { HomeContentPayload, HomeSection } from "@/lib/home-content/types";
import { HOME_CONTENT_VERSION } from "@/lib/home-content/types";

const APP1_CATEGORY_IMAGES: Record<string, string> = {
  mujer: "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=600&q=80",
  hombre: "https://images.unsplash.com/photo-1647438174616-7bc61ca38455?w=600&q=80",
  remeras:
    "https://images.unsplash.com/photo-1611858447638-1113f15f7177?w=600&q=80",
  musculosas:
    "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=600&q=80",
  tops: "https://images.unsplash.com/photo-1531520563951-4c0e3d3fcacc?w=600&q=80",
  leggings:
    "https://images.unsplash.com/photo-1762331660576-cbf66a7db84d?w=600&q=80",
  shorts:
    "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=600&q=80",
  hoodies:
    "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80",
  accesorios:
    "https://images.unsplash.com/photo-1532382708467-d720b918f0da?w=600&q=80",
};

function buildApp1CategoryTiles(): HomeSection {
  const tiles = [
    { slug: "hombre", label: "Hombre", href: "/productos?genero=hombre" },
    { slug: "mujer", label: "Mujer", href: "/productos?genero=mujer" },
    ...app1Config.productCategories.map((category) => ({
      slug: category.slug,
      label: category.label,
      href: `/productos?categoria=${category.slug}`,
    })),
  ];

  return {
    id: "categories",
    type: "categories.grid",
    enabled: true,
    order: 30,
    content: {
      eyebrow: "Tienda",
      title: "Categorías",
      viewAllHref: "/productos",
      items: tiles.map((tile) => ({
        slug: tile.slug,
        label: tile.label,
        imageUrl: APP1_CATEGORY_IMAGES[tile.slug] ?? APP1_CATEGORY_IMAGES.mujer,
        gradientClass: "from-black/60",
        href: tile.href,
      })),
    },
  };
}

export function buildDefaultApp2HomeContent(): HomeContentPayload {
  return {
    version: HOME_CONTENT_VERSION,
    sections: [
      {
        id: "hero",
        type: "hero.static",
        enabled: true,
        order: 10,
        content: {
          backgroundImageUrl:
            "https://source.unsplash.com/1600x900/?vape,neon,smoke",
          eyebrow: "Nuevas llegadas 2025",
          titleLine1: "ELEVA TU",
          titleLine2: "EXPERIENCIA",
          titleLine2Highlight: true,
          titleLine3: "VAPE",
          description:
            "Los mejores dispositivos, e-líquidos y accesorios. Envío gratis en pedidos mayores a $50. Calidad certificada, sabores únicos.",
          primaryCta: { label: "Comprar ahora", href: "/productos" },
          secondaryCta: { label: "Ver catálogo", href: "/productos" },
          stats: APP2_HERO_STATS.map((stat) => ({
            value: stat.value,
            label: stat.label,
          })),
        },
      },
      {
        id: "features",
        type: "features.bar",
        enabled: true,
        order: 20,
        content: {
          items: APP2_HOME_FEATURES.map((feature) => ({
            title: feature.title,
            description: feature.description,
          })),
        },
      },
      {
        id: "categories",
        type: "categories.grid",
        enabled: true,
        order: 30,
        content: {
          eyebrow: "Catálogo",
          title: "CATEGORÍAS",
          viewAllHref: "/productos",
          items: APP2_HOME_CATEGORIES.map((cat) => ({
            slug: cat.slug,
            label: cat.label,
            imageUrl: cat.image,
            gradientClass: cat.gradient,
            href: app2CatalogHref(cat.slug),
          })),
        },
      },
      {
        id: "featured",
        type: "featured.products",
        enabled: true,
        order: 40,
        content: {
          title: "DESTACADOS",
          viewAllHref: "/productos?destacados=1",
        },
      },
      {
        id: "promo",
        type: "promo.banner",
        enabled: true,
        order: 50,
        content: {
          eyebrow: "Oferta limitada",
          title: APP2_PROMO.title,
          titleHighlight: APP2_PROMO.highlight,
          couponCode: APP2_PROMO.code,
          couponHint: "al comprar",
          backgroundImageUrl:
            "https://source.unsplash.com/1400x400/?vape,device,dark",
          cta: { label: "Canjear oferta", href: "#productos-app2" },
        },
      },
      {
        id: "newsletter",
        type: "newsletter",
        enabled: true,
        order: 60,
        content: {
          eyebrow: "Newsletter",
          title: "MANTENTE AL DÍA",
          description:
            "Nuevos productos, ofertas exclusivas y consejos de expertos directo a tu correo.",
          placeholder: "tu@email.com",
          buttonLabel: "Unirme",
        },
      },
    ],
  };
}

export function buildDefaultApp1HomeContent(
  storeDisplayName: string,
): HomeContentPayload {
  const slides = getHomeHeroSlides(storeDisplayName);

  return {
    version: HOME_CONTENT_VERSION,
    sections: [
      {
        id: "hero",
        type: "hero.carousel",
        enabled: true,
        order: 10,
        content: {
          autoplayMs: HOME_HERO_AUTOPLAY_MS,
          slides: slides.map((slide) => ({
            id: slide.id,
            label: slide.label,
            imageUrl: slide.image,
            imageAlt: slide.imageAlt,
            eyebrow: slide.eyebrow,
            title: slide.title,
            titleEmphasis: slide.titleEmphasis,
            description: slide.description,
            cta: slide.cta,
          })),
        },
      },
      {
        id: "featured",
        type: "featured.products",
        enabled: true,
        order: 20,
        content: {
          title: "Destacados",
          titleAccent: storeDisplayName.split(" ")[0] ?? storeDisplayName,
          viewAllHref: "/productos?destacados=1",
        },
      },
      buildApp1CategoryTiles(),
    ],
  };
}

export function buildDefaultHomeContent(
  vertical: "app1" | "app2",
  storeDisplayName: string,
): HomeContentPayload {
  return vertical === "app2"
    ? buildDefaultApp2HomeContent()
    : buildDefaultApp1HomeContent(storeDisplayName);
}

export function sortHomeSections(sections: HomeSection[]): HomeSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

export function getHomeSection<T extends HomeSection["type"]>(
  payload: HomeContentPayload,
  type: T,
): Extract<HomeSection, { type: T }> | undefined {
  return payload.sections.find(
    (section): section is Extract<HomeSection, { type: T }> => section.type === type,
  );
}
