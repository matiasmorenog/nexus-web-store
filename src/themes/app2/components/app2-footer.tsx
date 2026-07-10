import Link from "next/link";
import { AtSign, Link2, Share2 } from "lucide-react";
import { App2BrandWordmark } from "@/themes/app2/components/home/app2-brand-wordmark";
import { getBrandPrefix } from "@/lib/brand";
import { APP2_PRODUCT_CATEGORIES, app2CatalogHref } from "@/lib/store-verticals/app2/config";

type App2FooterProps = {
  storeName: string;
  tagline: string;
};

const helpLinks = [
  { href: "/envios", label: "Envíos" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
] as const;

const legalLinks = [
  { href: "/privacidad", label: "Aviso de privacidad" },
  { href: "/terminos", label: "Términos de uso" },
] as const;

const linkClass =
  "text-xs text-app2-muted transition-colors hover:text-[var(--brand-primary)]";

export function App2Footer({ storeName, tagline }: App2FooterProps) {
  const brand = getBrandPrefix(storeName);

  return (
    <footer className="mt-auto border-t border-app2 bg-app2-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-4">
              <App2BrandWordmark storeName={storeName} size="sm" />
            </div>
            <p className="mb-4 text-xs leading-relaxed text-app2-muted">{tagline}</p>
            <div className="flex gap-3">
              {[Share2, AtSign, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded border border-app2 text-app2-muted transition-colors hover:border-[color-mix(in_srgb,var(--brand-primary)_40%,transparent)] hover:text-[var(--brand-primary)]"
                  aria-label="Red social"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-app2-display mb-4 text-xs font-bold uppercase tracking-widest text-[var(--brand-primary-light,#f0f0f5)]">
              Tienda
            </h4>
            <ul className="space-y-2">
              {APP2_PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={app2CatalogHref(cat.slug)} className={linkClass}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-app2-display mb-4 text-xs font-bold uppercase tracking-widest text-[var(--brand-primary-light,#f0f0f5)]">
              Soporte
            </h4>
            <ul className="space-y-2">
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
            <h4 className="font-app2-display mb-4 text-xs font-bold uppercase tracking-widest text-[var(--brand-primary-light,#f0f0f5)]">
              Legal
            </h4>
            <ul className="space-y-2">
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

        <div className="flex flex-col items-center justify-between gap-3 border-t border-app2 pt-6 sm:flex-row">
          <p className="text-xs text-app2-muted">
            © {new Date().getFullYear()} {brand}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-app2-muted">
            Solo para mayores de 18 años. Venta de productos de tabaco regulada.
          </p>
        </div>
      </div>
    </footer>
  );
}
