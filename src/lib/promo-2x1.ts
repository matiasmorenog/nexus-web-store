import { promoBanner } from "@/lib/promo-banner";

export type Promo2x1LineInput = {
  unitPrice: number;
  quantity: number;
  productPromo2x1: boolean;
};

export type Promo2x1LinePricing = {
  rawTotal: number;
  lineTotal: number;
  discount: number;
  freeUnits: number;
  eligible: boolean;
};

export function isPromo2x1Active() {
  return promoBanner.enabled;
}

export function isProductPromo2x1Eligible(productPromo2x1: boolean) {
  return isPromo2x1Active() && productPromo2x1;
}

export function getPromo2x1LinePricing({
  unitPrice,
  quantity,
  productPromo2x1,
}: Promo2x1LineInput): Promo2x1LinePricing {
  const rawTotal = unitPrice * quantity;
  const eligible = isProductPromo2x1Eligible(productPromo2x1);

  if (!eligible || quantity < 2) {
    return {
      rawTotal,
      lineTotal: rawTotal,
      discount: 0,
      freeUnits: 0,
      eligible,
    };
  }

  const freeUnits = Math.floor(quantity / 2);
  const discount = freeUnits * unitPrice;

  return {
    rawTotal,
    lineTotal: rawTotal - discount,
    discount,
    freeUnits,
    eligible,
  };
}

export function sumPromo2x1Cart(lines: Promo2x1LineInput[]) {
  const priced = lines.map(getPromo2x1LinePricing);

  return {
    rawSubtotal: priced.reduce((sum, line) => sum + line.rawTotal, 0),
    promoDiscount: priced.reduce((sum, line) => sum + line.discount, 0),
    subtotal: priced.reduce((sum, line) => sum + line.lineTotal, 0),
    lines: priced,
  };
}

/** Precio unitario efectivo para Mercado Pago (mantiene quantity real). */
export function getMercadoPagoUnitPrice(input: Promo2x1LineInput) {
  const { lineTotal } = getPromo2x1LinePricing(input);
  return Math.round((lineTotal / input.quantity) * 100) / 100;
}
