# Módulos admin y pricing

Modelo comercial y técnico para vender el backoffice en **plan base + módulos plus**. El plan base cubre operación diaria; cada módulo extra se activa por tienda y suma al precio mensual.

Relacionado: roadmap Fase B/C en [`README.md`](../README.md), multi-tenant en [`multi-store.md`](multi-store.md).

---

## Plan Base (~USD 100/mes)

Incluido sin costo adicional. Sin estos ítems la tienda no opera.

| Área | Funcionalidad |
|------|---------------|
| Dashboard | KPIs, gráficos, alertas de stock, pedidos recientes |
| Productos | CRUD, variantes, stock, imágenes (Vercel Blob) |
| Pedidos | Listado, filtros, cambio de estado |
| Configuración | Nombre, envío fijo, retiro en local |
| Storefront | Catálogo, carrito, checkout, cuenta cliente |
| Integraciones base | Mercado Pago, emails transaccionales |
| Usuarios | 1 owner por tienda |

---

## Catálogo de módulos Plus

Precios orientativos en USD/mes. Ajustar según mercado y costo de soporte.

| ID | Módulo | Precio sugerido | Descripción |
|----|--------|-----------------|-------------|
| `coupons` | Cupones y promociones | +20 | Códigos de descuento, reglas por categoría, promos avanzadas |
| `homeEditor` | Home editable | +25 | Banners, hero y secciones sin tocar código |
| `analytics` | Analytics avanzado | +30 | Funnels, cohortes, comparación de períodos, export |
| `crm` | CRM lite | +25 | Clientes, historial de compras, tags y notas |
| `shippingCarriers` | Envíos carrier | +40 | Cotización y etiquetas con operadores logísticos |
| `marketing` | WhatsApp y Meta Pixel | +20 | Botón WhatsApp, pixel de conversión, eventos checkout |
| `multiUser` | Multi-usuario | +18/usuario | Roles vendedor, depósito, solo lectura |
| `api` | API y webhooks | +50 | REST para productos/pedidos, webhooks de eventos |
| `premiumThemes` | Temas premium | +15 | Temas visuales adicionales (vape, apparel, futuros) |
| `seo` | SEO avanzado | +15 | Sitemap dinámico, meta por página, structured data |
| `exports` | Export y reportes | +12 | CSV de pedidos/productos, reportes contables |
| `wishlist` | Wishlist | +10 | Lista de deseos en storefront y cuenta cliente |

---

## Ejemplos de pricing

| Perfil | Módulos | Total aprox. |
|--------|---------|--------------|
| Tienda chica | Solo base | USD 100 |
| Tienda en crecimiento | base + cupones + home editable | USD 145 |
| Marca establecida | base + cupones + analytics + CRM + exports | USD 192 |
| Integrador | base + API + webhooks + multi-usuario (3) | USD 204 |

---

## Arquitectura técnica

### Catálogo en código

Definición única en `src/lib/modules/catalog.ts`. Cada módulo declara:

- `id` — clave estable (usada en DB y env)
- `name`, `description` — UI admin
- `monthlyPriceUsd` — pricing de referencia
- `adminRoutes` — rutas del backoffice que requiere
- `category` — agrupación en la pantalla Plan

### Activación por tienda (hoy)

Por defecto **todos los módulos están activos** (modo demo). Para restringir:

```bash
# Solo plan base
ENABLED_MODULES=none

# Subconjunto manual
ENABLED_MODULES=coupons,homeEditor,analytics
```

### Activación por tienda (Fase C — SaaS)

Migración prevista a tablas Prisma:

```prisma
model StorePlan {
  id      String   @id @default(cuid())
  storeId String   @unique
  tier    PlanTier @default(BASIC)
  store   Store    @relation(...)
}

model StoreModule {
  id        String    @id @default(cuid())
  storeId   String
  moduleId  String
  enabledAt DateTime  @default(now())
  expiresAt DateTime?
  store     Store     @relation(...)
  @@unique([storeId, moduleId])
}
```

`storeHasModule()` leerá primero DB; `ENABLED_MODULES` queda como override para dev y demos.

### Gating

| Capa | Mecanismo |
|------|-----------|
| Admin layout | `requireModule("coupons")` en `layout.tsx` de la ruta |
| Admin nav | Ítems de módulos inactivos con badge "Plus" y link a `/admin/plan` |
| API admin | `assertModule("coupons")` → `403` con `{ code: "MODULE_REQUIRED" }` |
| Storefront | Solo si el módulo afecta compradores (cupones, wishlist, pixel) |

### Pantalla Plan (`/admin/plan`)

- Resumen del plan base activo
- Grid de módulos con precio, descripción y estado (activo / disponible)
- CTA "Solicitar activación" (manual hasta integrar billing)
- Sin billing automático en Fase B; activación por soporte o env

### Billing (Fase C — pendiente)

- Stripe Billing o Mercado Pago suscripciones
- Webhook de pago → `StoreModule.enabledAt`
- Trial 14 días por módulo (opcional)
- Facturación: base + suma de módulos activos

---

## Qué no modularizar

Funcionalidad que debe existir siempre en plan base:

- Login admin, sesión, logout
- CRUD productos, variantes, stock, imágenes
- Pedidos y estados
- Configuración mínima de tienda
- Checkout, pagos, emails transaccionales
- Cuenta cliente y mis pedidos (storefront)

---

## Orden de implementación de módulos

1. **Infra** — catálogo, `storeHasModule`, pantalla Plan, nav condicional ✅
2. **Cupones** — CRUD admin, validación checkout, descuento en pedido ✅
3. **Home editable** — bloques por tienda (hero estático vape, carrusel apparel) ✅
4. **Export CSV** — pedidos y productos en admin ✅
5. **CRM lite** — clientes desde pedidos, tags y notas ✅
6. **SEO avanzado** — sitemap, robots, meta y JSON-LD ✅
7. **Wishlist** — favoritos en storefront y cuenta ✅
8. **Analytics avanzado** — comparación de períodos, embudo y cohortes ✅
9. **Marketing** — WhatsApp y Meta Pixel ✅
10. **Envíos carrier** — cotización por CP, operador preferido y etiquetas demo ✅
11. **API / Multi-usuario / Temas premium** — cuando haya demanda
12. **Billing** — al cerrar el segundo cliente SaaS (Fase C)

---

## Referencias en código

| Pieza | Ruta |
|-------|------|
| Catálogo | `src/lib/modules/catalog.ts` |
| Acceso / gating | `src/lib/modules/access.ts` |
| Cupones | `src/lib/coupons/`, `/admin/modulos/coupons` |
| Home editable | `src/lib/home-content/`, `/admin/modulos/homeEditor` |
| Export CSV | `src/lib/exports/`, `/admin/modulos/exports` |
| CRM lite | `src/lib/crm/`, `/admin/modulos/crm` |
| SEO avanzado | `src/lib/seo/`, `/admin/modulos/seo`, `/sitemap.xml`, `/robots.txt` |
| Wishlist | `src/lib/wishlist/`, `/admin/modulos/wishlist`, `/favoritos` |
| Analytics avanzado | `src/lib/advanced-analytics/`, `/admin/modulos/analytics` |
| Marketing | `src/lib/marketing/`, `/admin/modulos/marketing` |
| Envíos carrier | `src/lib/shipping-carriers/`, `/admin/modulos/shippingCarriers`, `/api/shipping/quote` |
| Errores API | `src/lib/modules/api-error.ts` |
| Nav admin | `src/lib/modules/admin-nav.ts` |
| Pantalla Plan | `src/app/admin/(protected)/plan/page.tsx` |
| Env | `.env.example` → `ENABLED_MODULES` |
