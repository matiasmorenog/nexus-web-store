# AFIP — preparación e integración

Estado: **scaffolding listo**, emisión real de comprobantes pendiente ([NEX-6](https://linear.app/nexus-development)).

## Qué hay hoy

| Pieza | Estado |
|-------|--------|
| CUIT/DNI opcional en checkout | ✅ |
| Campos de factura en `Order` (`invoiceStatus`, CAE, nº, error) | ✅ |
| Config AFIP por tienda (`StoreAfipSettings`) | ✅ |
| Cola al pagar → `invoiceStatus: PENDING` si AFIP activo | ✅ |
| Webhook `order.paid` con ítems + montos + `customer.taxId` | ✅ |
| WS AFIP (homologación / producción) | ⏳ Fase posterior |

## Flujo al pagar

1. Cliente completa checkout (opcional: CUIT/CUIL/DNI).
2. Pago confirmado (demo sin MP o webhook Mercado Pago).
3. `fulfillPaidOrder`:
   - Si AFIP activo en admin → `invoiceStatus = PENDING` (log `[AFIP] … WS pending`).
   - Webhook `order.paid` con payload completo (si módulo `api` + URL configurada).

## Probar en desarrollo (sin AFIP real)

### 1. Checkout demo

Sin `MERCADOPAGO_ACCESS_TOKEN` ni token en Admin → Configuración.

```bash
npm run dev:app1
```

### 2. Webhook de prueba

1. [webhook.site](https://webhook.site) → copiar URL.
2. Admin → **API y webhooks** → activar webhook + secret (mín. 8 chars).
3. (Opcional) Misma pantalla → **Facturación AFIP** → activar + CUIT comercio + PV.
4. Compra de prueba en storefront.
5. Ver POST en webhook.site con evento `order.paid`.

### 3. Verificar firma

Header `X-Nexus-Signature`: `sha256=<hmac-sha256 del body con tu secret>`.

Helper en código: `verifyStoreWebhookSignature` en `src/lib/store-api/verify-signature.ts`.

Script de ejemplo: `scripts/afip-webhook-receiver.example.mjs`.

### 4. Detalle del pedido vía API

```bash
curl -H "Authorization: Bearer nws_TU_CLAVE" \
  "http://localhost:3000/api/v1/orders/ORDER_ID"
```

Incluye `customerTaxId`, `invoiceStatus`, ítems con SKU.

## Payload `order.paid` (resumen)

```json
{
  "event": "order.paid",
  "storeId": "...",
  "occurredAt": "2026-07-11T...",
  "data": {
    "orderId": "...",
    "status": "PAID",
    "total": 15000,
    "subtotal": 14000,
    "shippingCost": 1000,
    "promoDiscount": 0,
    "couponCode": null,
    "couponDiscount": 0,
    "customer": {
      "name": "...",
      "email": "...",
      "phone": "...",
      "taxId": "20123456789"
    },
    "shipping": { "isPickup": false, "address": "...", "city": "...", "zip": "..." },
    "items": [
      {
        "id": "...",
        "quantity": 1,
        "unitPrice": 14000,
        "sku": "SKU-001",
        "product": { "id": "...", "slug": "...", "name": "..." },
        "variant": { "id": "...", "size": "M", "color": "Negro" }
      }
    ],
    "invoice": { "status": "PENDING" }
  }
}
```

## Config admin

**Admin → API y webhooks → Facturación AFIP**

- **Homologación**: entorno de prueba AFIP (recomendado hasta go-live).
- **CUIT comercio** + **punto de venta**: requeridos si AFIP está activo.
- Activar encola facturación; aún no llama al WS.

## Próxima implementación (NEX-6)

Archivos a extender:

| Archivo | Rol |
|---------|-----|
| `src/lib/afip/process-paid-order.ts` | Llamar WS AFIP desde cola `PENDING` |
| `src/lib/afip/ws-client.ts` | Cliente WSAA + WSFEv1 (homologación/prod) |
| Certificados | Vercel secrets o Blob cifrado por tienda |

Variables futuras (ver `.env.example`):

- `AFIP_CERT_PATH` / secrets por deploy
- Posible extensión `StoreAfipSettings` para certificado por tienda

## Referencias

- `src/lib/afip/` — tipos, settings, payload webhook, cola
- `src/lib/store-api/verify-signature.ts` — verificación HMAC
- `docs/modules-pricing.md` — módulo `api`
