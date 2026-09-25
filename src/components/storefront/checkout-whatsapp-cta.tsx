import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/marketing";
import type { LocaleCopy } from "@/lib/storefront-locale-copy";

type CheckoutWhatsAppCtaProps = {
  phone: string | null | undefined;
  message?: string | null;
  orderId?: string | null;
  copy: LocaleCopy;
};

export function CheckoutWhatsAppCta({
  phone,
  message,
  orderId,
  copy,
}: CheckoutWhatsAppCtaProps) {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) {
    return (
      <p className="mx-auto mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
        {copy.whatsappMissingHint}
      </p>
    );
  }

  const orderHint = orderId ? ` (ordine ${orderId.slice(-8).toUpperCase()})` : "";
  const composed =
    message?.trim()
      ? `${message.trim()}${orderHint}`
      : `${copy.whatsappSuggest}${orderHint}`;

  return (
    <div className="mx-auto mt-4 max-w-md space-y-3">
      <p className="text-sm text-neutral-600">{copy.whatsappSuggest}</p>
      <a
        href={buildWhatsAppUrl(trimmed, composed)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {copy.whatsappCta}
      </a>
    </div>
  );
}
