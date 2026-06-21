import { promoBanner } from "@/lib/promo-banner";

export type Promo2x1LineInput = {
  unitPrice: number;
  quantity: number;
  productPromo2x1: boolean;
  /** Agrupa unidades 2x1 del mismo producto (cualquier variante). */
  productId?: string;
  /** Identificador de línea (p. ej. variantId) para mapear resultados. */
  lineKey?: string;
};

export type Promo2x1LinePricing = {
  lineKey?: string;
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

function priceStandaloneLine(line: Promo2x1LineInput): Promo2x1LinePricing {
  const rawTotal = line.unitPrice * line.quantity;
  const eligible = isProductPromo2x1Eligible(line.productPromo2x1);

  if (!eligible || line.quantity < 2) {
    return {
      lineKey: line.lineKey,
      rawTotal,
      lineTotal: rawTotal,
      discount: 0,
      freeUnits: 0,
      eligible,
    };
  }

  const freeUnits = Math.floor(line.quantity / 2);
  const discount = freeUnits * line.unitPrice;

  return {
    lineKey: line.lineKey,
    rawTotal,
    lineTotal: rawTotal - discount,
    discount,
    freeUnits,
    eligible,
  };
}

function pricePromo2x1ProductGroup(
  lines: Promo2x1LineInput[],
): Promo2x1LinePricing[] {
  type UnitSlot = { lineIndex: number; unitPrice: number };
  const slots: UnitSlot[] = [];

  lines.forEach((line, lineIndex) => {
    for (let unit = 0; unit < line.quantity; unit += 1) {
      slots.push({ lineIndex, unitPrice: line.unitPrice });
    }
  });

  if (slots.length < 2) {
    return lines.map((line) => priceStandaloneLine(line));
  }

  slots.sort((a, b) => a.unitPrice - b.unitPrice);
  const freeUnitsTotal = Math.floor(slots.length / 2);
  const discountByLine = Array.from({ length: lines.length }, () => 0);
  const freeUnitsByLine = Array.from({ length: lines.length }, () => 0);

  for (let i = 0; i < freeUnitsTotal; i += 1) {
    const slot = slots[i];
    discountByLine[slot.lineIndex] += slot.unitPrice;
    freeUnitsByLine[slot.lineIndex] += 1;
  }

  return lines.map((line, lineIndex) => {
    const rawTotal = line.unitPrice * line.quantity;
    const discount = discountByLine[lineIndex];

    return {
      lineKey: line.lineKey,
      rawTotal,
      lineTotal: rawTotal - discount,
      discount,
      freeUnits: freeUnitsByLine[lineIndex],
      eligible: true,
    };
  });
}

/** Calcula 2x1 agrupando por producto (suma talles/colores del mismo ítem). */
export function pricePromo2x1Lines(lines: Promo2x1LineInput[]) {
  const priced: Promo2x1LinePricing[] = [];
  const promoGroups = new Map<string, Promo2x1LineInput[]>();

  for (const line of lines) {
    const eligible = isProductPromo2x1Eligible(line.productPromo2x1);

    if (!eligible) {
      priced.push(priceStandaloneLine(line));
      continue;
    }

    const groupKey = line.productId ?? line.lineKey ?? `line-${priced.length}`;
    const group = promoGroups.get(groupKey) ?? [];
    group.push(line);
    promoGroups.set(groupKey, group);
  }

  for (const group of promoGroups.values()) {
    priced.push(...pricePromo2x1ProductGroup(group));
  }

  return {
    rawSubtotal: priced.reduce((sum, line) => sum + line.rawTotal, 0),
    promoDiscount: priced.reduce((sum, line) => sum + line.discount, 0),
    subtotal: priced.reduce((sum, line) => sum + line.lineTotal, 0),
    lines: priced,
  };
}

export function sumPromo2x1Cart(lines: Promo2x1LineInput[]) {
  return pricePromo2x1Lines(lines);
}

export function getPromo2x1LinePricing(line: Promo2x1LineInput): Promo2x1LinePricing {
  return pricePromo2x1Lines([line]).lines[0] ?? priceStandaloneLine(line);
}

export type CartPromoItem = {
  variantId: string;
  productId: string;
  price: number;
  quantity: number;
  promo2x1?: boolean;
};

export function getCartPromoPricing(items: CartPromoItem[]) {
  const result = pricePromo2x1Lines(
    items.map((item) => ({
      unitPrice: item.price,
      quantity: item.quantity,
      productPromo2x1: item.promo2x1 ?? false,
      productId: item.productId,
      lineKey: item.variantId,
    })),
  );

  const byVariantId = new Map<string, Promo2x1LinePricing>();
  for (const line of result.lines) {
    if (line.lineKey) {
      byVariantId.set(line.lineKey, line);
    }
  }

  return {
    ...result,
    byVariantId,
  };
}

/** Precio unitario efectivo para Mercado Pago (mantiene quantity real). */
export function getMercadoPagoUnitPrice(input: Promo2x1LineInput) {
  const { lineTotal } = getPromo2x1LinePricing(input);
  return Math.round((lineTotal / input.quantity) * 100) / 100;
}

export function getMercadoPagoUnitPriceFromPricing(
  lineTotal: number,
  quantity: number,
) {
  return Math.round((lineTotal / quantity) * 100) / 100;
}
