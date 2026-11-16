import { WhatsAppMark } from "@/components/brand/whatsapp-mark";
import { nexusStorefrontLeadUrl } from "@/lib/nexus-contact";
import { cn } from "@/lib/utils";

type NexusStorefrontCreditProps = {
  locale?: "es" | "it";
  className?: string;
};

/**
 * Crédito footer → lead Nexus (abre WhatsApp).
 * Glifo WA aparte del nombre Nexus (indica canal Click-to-Chat, no lockup combinado).
 */
export function NexusStorefrontCredit({
  locale = "es",
  className,
}: NexusStorefrontCreditProps) {
  const prefix =
    locale === "it" ? "Negozio online di" : "Tienda online por";
  const brand = "Nexus";

  return (
    <a
      href={nexusStorefrontLeadUrl(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors",
        "underline-offset-2 hover:underline",
        className,
      )}
    >
      <WhatsAppMark className="size-3.5" tone="brand" title="WhatsApp" />
      <span>
        {prefix}{" "}
        <span className="font-semibold tracking-tight">{brand}</span>
      </span>
    </a>
  );
}
