import Link from "next/link";
import type { VerticalFeatures } from "@/lib/store-verticals/types";
import { cn } from "@/lib/utils";

type FooterProps = {
  storeName: string;
  tagline: string;
  features: VerticalFeatures;
  chrome?: "light" | "dark";
};

const helpLinksApparel = [
  { href: "/guia-de-talles", label: "Guía de talles" },
  { href: "/envios", label: "Envíos y entregas" },
  { href: "/cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
] as const;

const helpLinksVape = [
  { href: "/envios", label: "Envíos y entregas" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
] as const;

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
] as const;

const linkClass =
  "transition-colors hover:text-[var(--brand-primary)]";

export function Footer({
  storeName,
  tagline,
  features,
  chrome = "light",
}: FooterProps) {
  const isDarkChrome = chrome === "dark";
  const helpLinks = features.sizeGuide ? helpLinksApparel : helpLinksVape;

  return (
    <footer
      className={cn(
        "mt-auto border-t",
        isDarkChrome
          ? "border-white/10 bg-black/90 text-neutral-300"
          : "border-neutral-200 bg-neutral-50",
      )}
    >
      <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <p
            className={cn(
              "text-lg font-bold tracking-tight",
              isDarkChrome ? "text-white" : "text-neutral-900",
            )}
          >
            {storeName}
          </p>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              isDarkChrome ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            {tagline}
          </p>
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-wide",
              isDarkChrome ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            Tienda
          </p>
          <ul
            className={cn(
              "mt-3 space-y-2 text-sm",
              isDarkChrome ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            {features.catalog ? (
              <>
                <li>
                  <Link href="/productos" className={linkClass}>
                    Catálogo
                  </Link>
                </li>
                {features.showAudienceFilter ? (
                  <>
                    <li>
                      <Link href="/productos?genero=hombre" className={linkClass}>
                        Hombre
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?genero=mujer" className={linkClass}>
                        Mujer
                      </Link>
                    </li>
                  </>
                ) : null}
              </>
            ) : (
              <li>
                <Link href="/" className={linkClass}>
                  Productos
                </Link>
              </li>
            )}
            <li>
              <Link href="/contacto" className={linkClass}>
                Contacto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Ayuda
          </p>
          <ul
            className={cn(
              "mt-3 space-y-2 text-sm",
              isDarkChrome ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Legal
          </p>
          <ul
            className={cn(
              "mt-3 space-y-2 text-sm",
              isDarkChrome ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className={cn(
          "border-t py-4 text-center text-xs",
          isDarkChrome
            ? "border-white/10 text-neutral-500"
            : "border-neutral-200 text-neutral-500",
        )}
      >
        © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
