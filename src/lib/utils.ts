import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const { locale, currency } = getClientStorefrontConfig();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(value);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
