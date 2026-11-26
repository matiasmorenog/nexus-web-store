import type { HomeContentPayload, HomeSection } from "@/lib/home-content/types";
import { buildDefaultHomeContent } from "@/lib/home-content/defaults";
import type { PlanTierId } from "@/lib/modules/catalog";
import type { StoreVertical } from "@/lib/store-verticals/types";

export type HomeEditorCapabilities = {
  planTier: PlanTierId;
  /** Max slides in hero.carousel / treated as single hero on Start. */
  maxHeroSlides: number;
  /** Edit categories, featured, promo, etc. */
  canEditNonHeroSections: boolean;
  canReorderSections: boolean;
  canToggleSectionVisibility: boolean;
  canEditHeroAutoplay: boolean;
};

export function getHomeEditorCapabilities(
  planTier: PlanTierId,
): HomeEditorCapabilities {
  if (planTier === "start") {
    return {
      planTier: "start",
      maxHeroSlides: 1,
      canEditNonHeroSections: false,
      canReorderSections: false,
      canToggleSectionVisibility: false,
      canEditHeroAutoplay: false,
    };
  }

  return {
    planTier,
    maxHeroSlides: 8,
    canEditNonHeroSections: true,
    canReorderSections: true,
    canToggleSectionVisibility: true,
    canEditHeroAutoplay: true,
  };
}

function isHeroSection(section: HomeSection): boolean {
  return section.type === "hero.carousel" || section.type === "hero.static";
}

function clampHeroSection(
  section: HomeSection,
  maxHeroSlides: number,
): HomeSection {
  if (section.type !== "hero.carousel") return section;
  return {
    ...section,
    content: {
      ...section.content,
      slides: section.content.slides.slice(0, maxHeroSlides),
    },
  };
}

/**
 * Start may only change hero content. Other sections stay at vertical defaults.
 * Grow/Pro: clamp hero slide count only.
 */
export function applyHomeEditorCapabilities(
  payload: HomeContentPayload,
  capabilities: HomeEditorCapabilities,
  vertical: StoreVertical,
  storeDisplayName: string,
): HomeContentPayload {
  if (capabilities.canEditNonHeroSections) {
    return {
      version: payload.version,
      sections: payload.sections.map((section) =>
        clampHeroSection(section, capabilities.maxHeroSlides),
      ),
    };
  }

  const defaults = buildDefaultHomeContent(vertical, storeDisplayName);
  const heroFromClient = payload.sections.find(isHeroSection);
  const defaultHero = defaults.sections.find(isHeroSection);
  const sourceHero = heroFromClient ?? defaultHero;
  if (!sourceHero) {
    return defaults;
  }

  const hero = clampHeroSection(sourceHero, capabilities.maxHeroSlides);

  return {
    version: defaults.version,
    sections: defaults.sections.map((section) => {
      if (!isHeroSection(section)) return section;
      if (hero.type !== section.type) return section;
      return {
        ...hero,
        id: section.id,
        order: section.order,
        enabled: true,
      };
    }),
  };
}
