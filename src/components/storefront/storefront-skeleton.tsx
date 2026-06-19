import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StorefrontSkeletonProps = {
  className?: string;
};

export function StorefrontSkeleton({ className }: StorefrontSkeletonProps) {
  return (
    <div className={cn("storefront-skeleton rounded-md", className)} aria-hidden />
  );
}

export function StorefrontSkeletonRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function StorefrontSkeletonPageHeader({
  titleWidth = "w-40",
  descriptionWidth = "w-64",
}: {
  titleWidth?: string;
  descriptionWidth?: string;
}) {
  return (
    <div className="mb-8">
      <StorefrontSkeleton className={cn("h-9", titleWidth)} />
      <StorefrontSkeleton className={cn("mt-2 h-4", descriptionWidth)} />
    </div>
  );
}

export function StorefrontSkeletonProductCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-neutral-900/[0.04]">
      <StorefrontSkeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2 p-3">
        <StorefrontSkeleton className="h-3 w-16" />
        <StorefrontSkeleton className="h-4 w-full max-w-40" />
        <StorefrontSkeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function StorefrontSkeletonFiltersPanel() {
  return (
    <aside className="space-y-6 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      <StorefrontSkeleton className="h-10 w-full rounded-lg" />
      <div>
        <StorefrontSkeleton className="mb-2 h-4 w-20" />
        <div className="space-y-1">
          {Array.from({ length: 5 }, (_, index) => (
            <StorefrontSkeleton key={index} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div>
        <StorefrontSkeleton className="mb-2 h-4 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <StorefrontSkeleton key={index} className="h-9 w-10 rounded-lg" />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function StorefrontSkeletonProductGrid() {
  return (
    <StorefrontSkeletonRegion label="Cargando productos">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <StorefrontSkeletonProductCard key={index} />
        ))}
      </div>
    </StorefrontSkeletonRegion>
  );
}

export function StorefrontSkeletonProductsPage() {
  return (
    <StorefrontSkeletonRegion
      label="Cargando catálogo"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      <StorefrontSkeletonPageHeader
        titleWidth="w-32"
        descriptionWidth="w-72"
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <StorefrontSkeletonFiltersPanel />
        <StorefrontSkeletonProductGrid />
      </div>
    </StorefrontSkeletonRegion>
  );
}

export function StorefrontSkeletonProductDetailPage() {
  return (
    <StorefrontSkeletonRegion
      label="Cargando producto"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      <StorefrontSkeleton className="mb-6 h-4 w-40" />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <StorefrontSkeleton className="aspect-[3/4] w-full rounded-xl" />
        <div className="space-y-4 lg:py-2">
          <StorefrontSkeleton className="h-3 w-20" />
          <StorefrontSkeleton className="h-10 w-3/4 max-w-md" />
          <StorefrontSkeleton className="h-4 w-full" />
          <StorefrontSkeleton className="h-4 w-full" />
          <StorefrontSkeleton className="h-4 w-2/3" />
          <div className="mt-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <StorefrontSkeleton className="mb-3 h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <StorefrontSkeleton key={index} className="h-9 w-12 rounded-lg" />
              ))}
            </div>
            <StorefrontSkeleton className="mt-4 h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </StorefrontSkeletonRegion>
  );
}

export function StorefrontSkeletonFeaturedProducts() {
  return (
    <StorefrontSkeletonRegion label="Cargando destacados">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <StorefrontSkeletonProductCard key={index} />
        ))}
      </div>
    </StorefrontSkeletonRegion>
  );
}

export function StorefrontSkeletonHomePage() {
  return (
    <StorefrontSkeletonRegion label="Cargando tienda">
      <StorefrontSkeleton className="h-[70vh] min-h-[400px] w-full rounded-none" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <StorefrontSkeleton className="mx-auto mb-8 h-8 w-36" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <StorefrontSkeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      <div className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <StorefrontSkeleton className="h-8 w-48" />
            <StorefrontSkeleton className="h-4 w-20" />
          </div>
          <StorefrontSkeletonFeaturedProducts />
        </div>
      </div>
    </StorefrontSkeletonRegion>
  );
}

function StorefrontSkeletonCartLineItem() {
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-200/80 bg-white p-4">
      <StorefrontSkeleton className="h-20 w-16 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <StorefrontSkeleton className="h-4 w-3/4" />
        <StorefrontSkeleton className="h-3 w-24" />
        <StorefrontSkeleton className="h-8 w-28 rounded-lg" />
      </div>
      <StorefrontSkeleton className="h-4 w-16 shrink-0" />
    </div>
  );
}

export function StorefrontSkeletonCartPage() {
  return (
    <StorefrontSkeletonRegion
      label="Cargando carrito"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
    >
      <StorefrontSkeletonPageHeader titleWidth="w-24" descriptionWidth="w-48" />
      <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, index) => (
            <StorefrontSkeletonCartLineItem key={index} />
          ))}
        </div>
        <aside className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <StorefrontSkeleton className="h-4 w-20" />
          <div className="mt-4 space-y-2 border-b border-neutral-100 pb-4">
            <div className="flex justify-between gap-4">
              <StorefrontSkeleton className="h-4 w-16" />
              <StorefrontSkeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between gap-4">
              <StorefrontSkeleton className="h-4 w-12" />
              <StorefrontSkeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-4 flex justify-between gap-4">
            <StorefrontSkeleton className="h-5 w-28" />
            <StorefrontSkeleton className="h-6 w-24" />
          </div>
          <StorefrontSkeleton className="mt-5 h-11 w-full rounded-lg" />
        </aside>
      </div>
    </StorefrontSkeletonRegion>
  );
}

export function StorefrontSkeletonCheckoutPage() {
  return (
    <StorefrontSkeletonRegion
      label="Cargando checkout"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      <StorefrontSkeletonPageHeader titleWidth="w-28" descriptionWidth="w-56" />
      <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <StorefrontSkeleton className="h-4 w-24" />
              <StorefrontSkeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <StorefrontSkeleton className="h-11 w-full rounded-lg" />
        </div>
        <aside className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <StorefrontSkeleton className="h-4 w-20" />
          <div className="mt-4 space-y-3 border-b border-neutral-100 pb-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <StorefrontSkeleton className="h-14 w-11 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <StorefrontSkeleton className="h-4 w-full" />
                  <StorefrontSkeleton className="h-3 w-20" />
                </div>
                <StorefrontSkeleton className="h-4 w-14 shrink-0" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between gap-4">
            <StorefrontSkeleton className="h-4 w-16" />
            <StorefrontSkeleton className="h-4 w-20" />
          </div>
        </aside>
      </div>
    </StorefrontSkeletonRegion>
  );
}
