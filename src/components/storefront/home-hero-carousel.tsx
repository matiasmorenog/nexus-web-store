"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HomeHeroContent } from "@/components/storefront/home-hero-content";
import { Button } from "@/components/ui/button";
import {
  getHomeHeroSlides,
  HOME_HERO_AUTOPLAY_MS,
  type HomeHeroSlide,
} from "@/lib/home-hero-slides";
import { cn } from "@/lib/utils";

type HomeHeroCarouselProps = {
  storeDisplayName: string;
};

function HeroSlideCopy({ slide }: { slide: HomeHeroSlide }) {
  return (
    <>
      <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
        {slide.eyebrow}
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        {slide.titleEmphasis ? (
          <>
            <span className="text-[var(--brand-primary)]">
              {slide.titleEmphasis}
            </span>{" "}
            {slide.title}
          </>
        ) : (
          slide.title
        )}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-neutral-200">{slide.description}</p>
      <Link href={slide.cta.href} className="mt-8 inline-block">
        <Button size="lg">{slide.cta.label}</Button>
      </Link>
    </>
  );
}

export function HomeHeroCarousel({ storeDisplayName }: HomeHeroCarouselProps) {
  const slides = getHomeHeroSlides(storeDisplayName);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [hiddenPaused, setHiddenPaused] = useState(false);

  const autoplayPaused = hoverPaused || hiddenPaused;

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const handleVisibility = () => setHiddenPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length <= 1) return;
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion || autoplayPaused) return;

    const timeout = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, HOME_HERO_AUTOPLAY_MS);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, autoplayPaused, goTo, reduceMotion, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, slides.length]);

  const slide = slides[activeIndex]!;

  return (
    <section
      className="relative h-[70vh] min-h-[400px] overflow-hidden bg-neutral-900 text-white"
      aria-roledescription="carrusel"
      aria-label="Destacados del home"
      aria-live="polite"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHoverPaused(false);
        }
      }}
    >
      <div
        key={slide.id}
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          !reduceMotion && "home-hero-slide-swap",
        )}
      >
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          className="object-cover"
          priority={activeIndex === 0}
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-neutral-900/50"
          aria-hidden
        />

        <HomeHeroContent>
          <HeroSlideCopy slide={slide} />
        </HomeHeroContent>
      </div>

      {slides.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6">
            {/* Mobile: flechas junto a los dots, sin invadir el copy */}
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/45 px-2 py-2 backdrop-blur-sm md:hidden">
              <button
                type="button"
                onClick={goPrev}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-white transition-colors active:bg-white/15"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="flex items-center gap-2 px-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(index)}
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      index === activeIndex
                        ? "w-7 bg-[var(--brand-primary)]"
                        : "w-2.5 bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Ir al slide: ${slide.label}`}
                    aria-current={index === activeIndex}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-white transition-colors active:bg-white/15"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Desktop: solo indicadores */}
            <div className="pointer-events-auto hidden items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm md:flex">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    index === activeIndex
                      ? "w-7 bg-[var(--brand-primary)]"
                      : "w-2.5 bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`Ir al slide: ${slide.label}`}
                  aria-current={index === activeIndex}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-20 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/55 active:bg-black/65 md:flex"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 z-20 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/55 active:bg-black/65 md:flex"
            aria-label="Slide siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </section>
  );
}
