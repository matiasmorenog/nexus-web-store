import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CreditCard,
  Crosshair,
  MapPin,
  MessageCircle,
  PackageX,
  Truck,
} from "lucide-react";
import { adminSurfaceClass } from "@/components/admin/admin-surface";
import {
  buildAdminMarketingSettingsHref,
  buildAdminOutOfStockVariantsHref,
  buildAdminPaidOrdersHref,
  buildAdminPaymentSettingsHref,
  buildAdminShippingCarriersHref,
  type DashboardAttention,
} from "@/lib/admin-analytics-shared";
import { cn } from "@/lib/utils";

type AttentionItem = {
  key: string;
  href: string;
  icon: typeof Truck;
  label: string;
  detail: string;
  tone: "amber" | "rose";
};

function buildAttentionItems(attention: DashboardAttention): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (attention.paidAwaitingShipment > 0) {
    const count = attention.paidAwaitingShipment;
    items.push({
      key: "paid",
      href: buildAdminPaidOrdersHref(),
      icon: Truck,
      label: `${count} pedido${count !== 1 ? "s" : ""} pagado${count !== 1 ? "s" : ""}`,
      detail: "Listos para despachar",
      tone: "amber",
    });
  }

  if (attention.outOfStockVariants > 0) {
    const count = attention.outOfStockVariants;
    items.push({
      key: "stock",
      href: buildAdminOutOfStockVariantsHref(),
      icon: PackageX,
      label: `${count} variante${count !== 1 ? "s" : ""} sin stock`,
      detail: "Revisá variantes agotadas",
      tone: "rose",
    });
  }

  if (attention.cobrosTokenMissing) {
    items.push({
      key: "cobros",
      href: buildAdminPaymentSettingsHref(),
      icon: CreditCard,
      label: "Mercado Pago sin configurar en admin",
      detail:
        "Módulo Cobros activo: guardá el Access Token en Cobros para esta tienda",
      tone: "rose",
    });
  }

  if (attention.stripeConfigMissing) {
    items.push({
      key: "stripe",
      href: buildAdminPaymentSettingsHref(),
      icon: CreditCard,
      label: "Stripe activo sin claves",
      detail:
        "Activaste tarjeta (Stripe): cargá Secret key y webhook signing secret en Cobros",
      tone: "rose",
    });
  }

  if (attention.transferConfigMissing) {
    items.push({
      key: "transfer",
      href: buildAdminPaymentSettingsHref(),
      icon: Banknote,
      label: "Transferencia activa sin datos",
      detail:
        "Activaste transferencia: cargá CBU/alias o instrucciones en Cobros",
      tone: "rose",
    });
  }

  if (attention.shippingCarriersTokenMissing) {
    items.push({
      key: "shipping-carriers",
      href: buildAdminShippingCarriersHref(),
      icon: Truck,
      label: "Envíos sin operador configurado",
      detail:
        "Cotización por CP activa: cargá credenciales y activá al menos un operador (ME, Correo o Andreani)",
      tone: "rose",
    });
  }

  if (attention.pickupConfigMissing) {
    items.push({
      key: "pickup",
      href: buildAdminShippingCarriersHref(),
      icon: MapPin,
      label: "Retiro en local sin dirección",
      detail:
        "Retiro activo: completá dirección, ciudad y CP del local en Envíos",
      tone: "rose",
    });
  }

  if (attention.whatsappConfigMissing) {
    items.push({
      key: "whatsapp",
      href: buildAdminMarketingSettingsHref(),
      icon: MessageCircle,
      label: "WhatsApp activo sin teléfono",
      detail:
        "Activaste el botón de WhatsApp: cargá un número con código de país en Marketing",
      tone: "rose",
    });
  }

  if (attention.metaPixelConfigMissing) {
    items.push({
      key: "meta-pixel",
      href: buildAdminMarketingSettingsHref(),
      icon: Crosshair,
      label: "Meta Pixel activo sin ID",
      detail:
        "Activaste Meta Pixel: pegá el Pixel ID desde Events Manager en Marketing",
      tone: "rose",
    });
  }

  return items;
}

const toneStyles = {
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
} as const;

export function AdminDashboardAttention({
  attention,
}: {
  attention: DashboardAttention;
}) {
  const items = buildAttentionItems(attention);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
        <AlertCircle className="size-4 text-neutral-500" aria-hidden />
        Atención requerida
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                adminSurfaceClass,
                "group flex items-start gap-3 p-4 transition-colors hover:border-neutral-300 hover:bg-neutral-50/80",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  toneStyles[item.tone],
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-neutral-900 group-hover:text-[var(--brand-primary)]">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-sm text-neutral-500">
                  {item.detail}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
