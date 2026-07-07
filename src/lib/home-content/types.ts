import { z } from "zod";

export const HOME_CONTENT_VERSION = 1;

export const HOME_SECTION_TYPES = [
  "hero.static",
  "hero.carousel",
  "features.bar",
  "categories.grid",
  "featured.products",
  "promo.banner",
  "newsletter",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

const ctaSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(500),
});

const statSchema = z.object({
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
});

const heroStaticContentSchema = z.object({
  backgroundImageUrl: z.string().url().or(z.string().startsWith("/")),
  eyebrow: z.string().max(120),
  titleLine1: z.string().max(80),
  titleLine2: z.string().max(80),
  titleLine2Highlight: z.boolean(),
  titleLine3: z.string().max(80),
  description: z.string().max(500),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  stats: z.array(statSchema).max(6),
});

const heroCarouselSlideSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().max(80),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  imageAlt: z.string().max(200),
  eyebrow: z.string().max(120),
  title: z.string().max(120),
  titleEmphasis: z.string().max(80).optional(),
  description: z.string().max(500),
  cta: ctaSchema,
});

const heroCarouselContentSchema = z.object({
  autoplayMs: z.number().int().min(2000).max(30000),
  slides: z.array(heroCarouselSlideSchema).min(1).max(8),
});

const featuresBarContentSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        description: z.string().max(160),
      }),
    )
    .min(1)
    .max(6),
});

const categoryTileSchema = z.object({
  slug: z.string().min(1).max(80),
  label: z.string().min(1).max(80),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  gradientClass: z.string().max(120),
  href: z.string().min(1).max(500).optional(),
});

const categoriesGridContentSchema = z.object({
  eyebrow: z.string().max(80),
  title: z.string().max(120),
  viewAllHref: z.string().min(1).max(500),
  items: z.array(categoryTileSchema).min(1).max(12),
});

const featuredProductsContentSchema = z.object({
  title: z.string().max(120),
  titleAccent: z.string().max(80).optional(),
  viewAllHref: z.string().min(1).max(500),
});

const promoBannerContentSchema = z.object({
  eyebrow: z.string().max(120),
  title: z.string().max(120),
  titleHighlight: z.string().max(120),
  couponCode: z.string().max(40).optional(),
  couponHint: z.string().max(200).optional(),
  backgroundImageUrl: z.string().url().or(z.string().startsWith("/")).optional(),
  cta: ctaSchema,
});

const newsletterContentSchema = z.object({
  eyebrow: z.string().max(80),
  title: z.string().max(120),
  description: z.string().max(300),
  placeholder: z.string().max(120),
  buttonLabel: z.string().max(40),
});

const sectionBaseSchema = z.object({
  id: z.string().min(1).max(80),
  enabled: z.boolean(),
  order: z.number().int().min(0).max(99),
});

export const homeSectionSchema = z.discriminatedUnion("type", [
  sectionBaseSchema.extend({
    type: z.literal("hero.static"),
    content: heroStaticContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("hero.carousel"),
    content: heroCarouselContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("features.bar"),
    content: featuresBarContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("categories.grid"),
    content: categoriesGridContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("featured.products"),
    content: featuredProductsContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("promo.banner"),
    content: promoBannerContentSchema,
  }),
  sectionBaseSchema.extend({
    type: z.literal("newsletter"),
    content: newsletterContentSchema,
  }),
]);

export const homeContentPayloadSchema = z.object({
  version: z.literal(HOME_CONTENT_VERSION),
  sections: z.array(homeSectionSchema).min(1).max(20),
});

export type HomeSection = z.infer<typeof homeSectionSchema>;
export type HomeContentPayload = z.infer<typeof homeContentPayloadSchema>;
export type HeroStaticContent = z.infer<typeof heroStaticContentSchema>;
export type HeroCarouselContent = z.infer<typeof heroCarouselContentSchema>;
export type FeaturesBarContent = z.infer<typeof featuresBarContentSchema>;
export type CategoriesGridContent = z.infer<typeof categoriesGridContentSchema>;
export type FeaturedProductsContent = z.infer<typeof featuredProductsContentSchema>;
export type PromoBannerContent = z.infer<typeof promoBannerContentSchema>;
export type NewsletterContent = z.infer<typeof newsletterContentSchema>;
export type HeroCarouselSlide = z.infer<typeof heroCarouselSlideSchema>;

export type HomeSectionByType<T extends HomeSectionType> = Extract<
  HomeSection,
  { type: T }
>;
