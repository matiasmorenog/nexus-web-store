import type { HeroCarouselSlide } from "@/lib/home-content/types";
import type { HomeHeroSlide } from "@/lib/home-hero-slides";

export function toHomeHeroSlides(slides: HeroCarouselSlide[]): HomeHeroSlide[] {
  return slides.map((slide) => ({
    id: slide.id,
    label: slide.label,
    image: slide.imageUrl,
    imageAlt: slide.imageAlt,
    eyebrow: slide.eyebrow,
    title: slide.title,
    titleEmphasis: slide.titleEmphasis,
    description: slide.description,
    cta: slide.cta,
  }));
}
