# TODO — Nexus Web Store

Backlog único del proyecto (reemplaza Linear). Marcar `[x]` al mergear a `development`; mover a **Hecho** en el release.

## Manoviva (app3)

- [ ] Cobrar envío en checkout según tarifas de Poste Italiane por peso/cantidad (hoy `shippingCost = 0`). Falta que Raquel pase las tarifas.
- [ ] Cada cambio de schema liberado a producción: `db push` contra Neon `main` (pedir sí antes).

## Pagos

- [ ] Mercado Pago en producción + facturación AFIP (`docs/afip-integration.md`).

## Infra & CI

- [ ] Separar Vercel Blob por tienda (hoy un store compartido).
- [ ] (Opcional, futuro) `npm run build` en GitHub Actions — ver `docs/ci.md` Fase 2.

## SaaS (Fase C)

- [ ] Onboarding de tiendas sin desarrollador + billing automático por tier (`docs/modules-pricing.md`).
- [ ] Subida de logo por tienda desde el admin (hoy el logo vive en código; recién hace falta con el onboarding).

## Hecho (referencia)

- Fase A/B: storefront, admin, checkout MP, multi-tienda (3 deploys), módulos Plus, categorías dinámicas, CI lint + typecheck con branch protection.
- Pricing Start / Grow / Pro.
- Stripe (Italia), login demo.
- Manoviva: checkout con retiro + transferencia (descuento opcional) + efectivo opcional + WhatsApp; switch de tamaño por producto; páginas Consegne / Condizioni / Resi; compresión de fotos en el navegador; errores claros en carga de productos.
