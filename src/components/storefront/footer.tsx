import Link from "next/link";

type FooterProps = {
  storeName: string;
};

const helpLinks = [
  { href: "/guia-de-talles", label: "Guía de talles" },
  { href: "/envios", label: "Envíos y entregas" },
  { href: "/cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
] as const;

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
] as const;

const linkClass =
  "transition-colors hover:text-[var(--brand-primary)]";

export function Footer({ storeName }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <p className="text-lg font-bold tracking-tight text-neutral-900">
            {storeName}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Ropa deportiva para CrossFit y entrenamiento funcional. Envíos a todo
            el país.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Tienda
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/productos" className={linkClass}>
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=tops" className={linkClass}>
                Tops y remeras
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=leggings" className={linkClass}>
                Leggings
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=shorts" className={linkClass}>
                Shorts
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Ayuda
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
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
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
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
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
