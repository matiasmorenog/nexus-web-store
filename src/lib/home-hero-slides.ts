import { promoBanner } from "@/lib/promo-banner";

const BRAND_HERO_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80";

const PROMO_HERO_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80";

const INVIERNO_HERO_IMAGE =
  "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=1600&q=80";

/** Intervalo entre slides en el hero (ms). */
export const HOME_HERO_AUTOPLAY_MS = 4000;

export type HomeHeroSlide = {
  id: string;
  label: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  titleEmphasis?: string;
  description: string;
  cta: { label: string; href: string };
};

export function getHomeHeroSlides(storeDisplayName: string): HomeHeroSlide[] {
  const slides: HomeHeroSlide[] = [];

  // Slide promocional del hero: es contenido editorial del slider, independiente
  // de la activación 2x1 (módulo coupons). No se desactiva con la promo.
  slides.push({
    id: promoBanner.id,
    label: promoBanner.badge,
    image: PROMO_HERO_IMAGE,
    imageAlt: `Promoción ${promoBanner.badge} ${promoBanner.headline}`,
    eyebrow: "Promoción",
    title: promoBanner.headline,
    titleEmphasis: promoBanner.badge,
    description: promoBanner.detail,
    cta: { label: promoBanner.cta, href: promoBanner.href },
  });

  slides.push({
    id: "coleccion-invierno",
    label: "Invierno",
    image: INVIERNO_HERO_IMAGE,
    imageAlt: "Nueva colección de invierno",
    eyebrow: "Temporada",
    title: "Nueva colección de invierno",
    description:
      "Buzos, remeras manga larga y calzas para entrenar con el frío sin perder rendimiento.",
    cta: { label: "Ver colección", href: "/productos?categoria=hoodies" },
  });

  slides.push({
    id: "brand",
    label: "Marca",
    image: BRAND_HERO_IMAGE,
    imageAlt: `Entrenamiento funcional ${storeDisplayName}`,
    eyebrow: "Ropa para el box",
    title: "Entrená sin límites",
    description:
      "Indumentaria deportiva diseñada para CrossFit y entrenamiento funcional. Comodidad, resistencia y estilo en cada WOD.",
    cta: { label: "Ver catálogo", href: "/productos" },
  });

  return slides;
}

export { promoBanner };
