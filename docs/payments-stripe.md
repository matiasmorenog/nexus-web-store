# Pagos con tarjeta — Stripe Checkout

Método de cobro `CARD` dentro de **Admin → Cobros** (`StorePaymentSettings`), disponible para cualquier tienda (no es módulo Plus). Primer uso: Manoviva (EUR, Italia).

## Cómo funciona

1. Checkout (`POST /api/checkout`, `paymentMethod: "card"`) crea el pedido `PENDING` + `paymentMethod CARD` y una **Checkout Session** de Stripe (redirect hospedado).
   - Moneda y locale desde la config del vertical (`EUR` / `it` en Manoviva).
   - Sin `payment_method_types`: los medios (tarjeta, Apple Pay, Google Pay, PayPal…) se activan en **Stripe Dashboard → Settings → Payment methods**.
   - Line items igual que Mercado Pago (promo 2x1 / cupón / descuento repartidos); si el redondeo no cuadra con el total, se manda una sola línea con el total del pedido.
   - `success_url` / `cancel_url` → rutas localizadas (`/cassa/conferma`, `/cassa/errore` en Manoviva).
2. Webhook `POST /api/webhooks/stripe` (firma verificada con el `whsec_` de la tienda):
   - `checkout.session.completed` (pagado) y `checkout.session.async_payment_succeeded` → `fulfillPaidOrder` (stock, cupón, emails, AFIP/webhooks). Idempotente.
   - `checkout.session.async_payment_failed` / `checkout.session.expired` → pedido `CANCELLED` solo si sigue `PENDING`.
3. Keys por tienda cifradas (`PAYMENT_SECRETS_KEY` o `AUTH_SECRET`), igual que el token de Mercado Pago.

## Configuración (por tienda)

En **Admin → Cobros → Tarjeta (Stripe)** hay una guía paso a paso (ES/IT). Resumen:

1. Secret key: Developers → API keys (`sk_test_…` / `sk_live_…`).
2. Webhook endpoint: `https://<dominio>/api/webhooks/stripe` con eventos
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   (opcional `checkout.session.expired`).
3. Signing secret `whsec_…` del endpoint.
4. Activar el switch y guardar (no se puede activar sin key + secret).

Test y Live tienen keys y webhooks distintos.

## Prueba local con Stripe CLI

```bash
npm run dev:app3                       # Manoviva en :3002
stripe login
stripe listen --forward-to localhost:3002/api/webhooks/stripe
# copiar el whsec_ que imprime → Admin → Cobros → Signing secret
```

1. Admin → Cobros: pegar `sk_test_…` + `whsec_…` del CLI, activar, guardar.
2. Checkout → «Carta di credito» → pagar con `4242 4242 4242 4242`, fecha futura, cualquier CVC.
3. El CLI muestra `checkout.session.completed` → `200`; el pedido pasa a **Pagado** en Admin → Ordini.

Sin el CLI (o sin webhook) el pedido queda `PENDING` aunque Stripe haya cobrado.

## Producción

- Schema aditivo (`CARD`, campos `stripe*`): requiere `prisma db push` contra la DB de cada deploy (Manoviva = Neon `main`, con confirmación explícita).
- Nunca commitear keys; se cargan solo desde el admin.
