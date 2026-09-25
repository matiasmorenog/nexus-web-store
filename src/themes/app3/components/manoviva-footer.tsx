import Link from "next/link";
import { ManovivaMark } from "@/themes/app3/components/manoviva-mark";

const links = [
  { href: "/productos", label: "Collezione" },
  { href: "/contacto", label: "Contatti" },
  { href: "/envios", label: "Consegne" },
  { href: "/terminos", label: "Condizioni" },
] as const;

export function ManovivaFooter() {
  return (
    <footer className="bg-[#202523] text-[#F2F0E9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-16">
        <div>
          <div className="flex items-center gap-3 text-[#F2F0E9]">
            <ManovivaMark inverse className="h-12 w-12" />
            <div>
              <p className="font-manoviva text-2xl font-semibold tracking-[-0.04em]">
                Manoviva
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/60">
                atelier fatto a mano
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
            Piccoli oggetti, ricordi e regali personalizzati creati lentamente,
            uno alla volta.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#C86243]">
              Esplora
            </p>
            <ul className="space-y-3 text-white/70">
              {links.slice(0, 2).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#C86243]">
              Informazioni
            </p>
            <ul className="space-y-3 text-white/70">
              {links.slice(2).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Manoviva · Fatto a mano con cura
      </div>
    </footer>
  );
}
