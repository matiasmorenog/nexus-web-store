# TODO — Nexus Web Store

Backlog único del proyecto (reemplaza Linear). Marcar `[x]` al mergear a `development`; mover a **Hecho** en el release.

## Envíos

- [ ] Multi-carrier real: ME + MiCorreo + Andreani (credenciales, cotizar, crear envío, guías admin).

## Manoviva (app3)

- [ ] Cobrar envío en checkout según tarifas de Poste Italiane por peso/cantidad (hoy `shippingCost = 0`). Falta que Raquel pase las tarifas.
- [ ] Cada cambio de schema liberado a producción: `db push` contra Neon `main` (pedir sí antes).
- [x] Recorte 3:4 al subir/reemplazar fotos de producto (admin, todas las tiendas).

## Pagos

- [ ] Mercado Pago en producción + facturación AFIP (`docs/afip-integration.md`).

## Infra & CI

- [x] Gate admin por membership `UserStore` en la tienda del deploy (login + sesión protegida).
- [x] Admin reload lento: JWT re-bind membership en cada `/api/auth/session` + layout (skip bind si slug del deploy ya en token).

- [x] Vercel Web Analytics en storefront compartido (3 tiendas); activar toggle en cada proyecto Vercel (ver `DEPLOY.md`).
- [x] Admin Pro: panel de tráfico web en `/admin/modulos/analytics` (API Vercel; env `VERCEL_WEB_ANALYTICS_TOKEN` + project/team).
- [x] Analytics admin: serializar Neon + tráfico Vercel en Suspense aparte.
- [x] Analytics tráfico: país, browser, OS + serie diaria (sin UTM; requiere Vercel Plus).
- [x] Separar Analytics Plus en nav Tráfico + Reportes; filtros 24h/7d/30d en Tráfico.
- [x] Admin: Plan/SEO/Marketing/API/Multi-usuario bajo acordeón Configuración (Wishlist queda top-level); Idioma y Seguridad como rutas hijas; Config solo despliega.
- [x] Admin: Cobros + Envíos bajo Configuración (URLs `/admin/configuracion/cobros` y `/admin/configuracion/envios` + redirect legacy).
- [x] Admin plan base: QR de home/producto en Config + atajo PNG en editar producto.
- [x] Admin: date/datetime pickers custom (estilo Rocha) en pedidos, exports y cupones.
- [ ] Separar Vercel Blob por tienda (hoy un store compartido).
- [ ] (Opcional, futuro) `npm run build` en GitHub Actions — ver `docs/ci.md` Fase 2.

## SaaS (Fase C)

- [ ] Onboarding de tiendas sin desarrollador + billing automático por tier (`docs/modules-pricing.md`).
- [ ] Subida de logo por tienda desde el admin (hoy el logo vive en código; recién hace falta con el onboarding).

## Admin / módulos

- [x] CRM full: KPIs, filtros, segmentos, WhatsApp ficha, export CSV (dejar de ser “lite”).

## Hecho (referencia)

- Fase A/B: storefront, admin, checkout MP, multi-tienda (3 deploys), módulos Plus, categorías dinámicas, CI lint + typecheck con branch protection.
- Pricing Start / Grow / Pro.
- Stripe (Italia), login demo.
- Manoviva: checkout con retiro + transferencia (descuento opcional) + efectivo opcional + WhatsApp; switch de tamaño por producto; páginas Consegne / Condizioni / Resi; compresión de fotos en el navegador; errores claros en carga de productos.
- Nombres de variante genéricos en todas las tiendas: Modelo / Tamaño (IT: Modello / Misura).
