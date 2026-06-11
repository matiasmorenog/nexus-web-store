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

export function Footer({ storeName }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <p className="font-bold">{storeName}</p>
          <p className="mt-2 text-sm text-neutral-600">
            Ropa deportiva para CrossFit y entrenamiento funcional. Envíos a todo el país.
          </p>
        </div>
        <div>
          <p className="font-semibold">Tienda</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            <li><Link href="/productos" className="transition-colors hover:text-[var(--brand-primary)]">Catálogo</Link></li>
            <li><Link href="/productos?categoria=tops" className="transition-colors hover:text-[var(--brand-primary)]">Tops y remeras</Link></li>
            <li><Link href="/productos?categoria=leggings" className="transition-colors hover:text-[var(--brand-primary)]">Leggings</Link></li>
            <li><Link href="/productos?categoria=shorts" className="transition-colors hover:text-[var(--brand-primary)]">Shorts</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Ayuda</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-[var(--brand-primary)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Legal</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-[var(--brand-primary)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
