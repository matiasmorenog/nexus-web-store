# Planes y módulos

Modelo comercial: **3 planes empaquetados** en USD (Start / Grow / Pro). Precio fijo, **sin comisión** sobre ventas. Los módulos Plus siguen existiendo en código para gating; el cliente **no** los compra a la carta.

Relacionado: [NEX-13](https://linear.app/nexus-development/issue/NEX-13/pricing-tiers-start-grow-pro-usd-sin-take-rate), billing Fase C [NEX-10](https://linear.app/nexus-development/issue/NEX-10/onboarding-tiendas-billing-automatico), multi-tenant en [`multi-store.md`](multi-store.md).

---

## Principios

| Decisión | Detalle |
|----------|---------|
| Moneda | USD |
| Forma | Planes (no à la carte) |
| Take-rate | **No** |
| Forever-free | **No** (sin % no escala costo infra) |
| Trial | 14 días → plan pago |
| Anual | −20% sobre mensual |
| Wedge | Precio fijo transparente vs TN / Shopify (que cobrán % plataforma o gateway) |

---

## Planes (USD / mes)

| Tier | Mensual | Anual equiv. | Target |
|------|---------|--------------|--------|
| **Start** | 29 | ~23 | Emprende / Instagram → web |
| **Grow** | 59 | ~47 | Ya vende, quiere crecer |
| **Pro** | 99 | ~79 | Equipo + analytics + API |

### Núcleo en todos (vender)

Sin estos ítems la tienda no opera. Incluidos en Start / Grow / Pro:

| Área | Funcionalidad |
|------|---------------|
| Dashboard | KPIs, gráficos, alertas de stock, pedidos recientes |
| Productos | CRUD, variantes, stock, imágenes (Vercel Blob) |
| Pedidos | Listado, filtros, cambio de estado |
| Cobros | Mercado Pago, transferencia bancaria con 10% off en productos |
| Configuración | Nombre, retiro en local |
| Storefront | Catálogo, carrito, checkout, cuenta cliente |
| Integraciones base | Emails transaccionales |
| Usuarios | 1 owner por tienda |

### Módulos por tier

| ID | Módulo | Start | Grow | Pro |
|----|--------|:-----:|:----:|:---:|
| `marketing` | WhatsApp y Meta Pixel | ✓ | ✓ | ✓ |
| `seo` | SEO avanzado | ✓ | ✓ | ✓ |
| `coupons` | Cupones y promociones (incl. 2x1) | | ✓ | ✓ |
| `homeEditor` | Home editable | | ✓ | ✓ |
| `wishlist` | Wishlist | | ✓ | ✓ |
| `shippingCarriers` | Envíos carrier | | ✓ | ✓ |
| `crm` | CRM lite | | ✓ | ✓ |
| `multiUser` | Multi-usuario | | ✓ (owner + 2 staff) | ✓ (ilimitado / alto) |
| `analytics` | Analytics y reportes | | | ✓ |
| `api` | API y webhooks | | | ✓ |

**Upgrade ladder:** Start→Grow = promos, home, envíos, CRM, equipo. Grow→Pro = reportes fuertes + API.

Addons sueltos: **no** (salvo seats extra más adelante).

---

## Catálogo técnico de módulos

IDs estables en `src/lib/modules/catalog.ts`. Cada módulo declara `id`, copy UI, `includedInPlans`, rutas admin y superficies storefront. El precio comercial es el **tier**, no la suma de módulos.

---

## Arquitectura técnica

### Activación por tienda (hoy)

Por defecto **todos los módulos están activos** (modo demo). Para restringir:

```bash
# Solo núcleo (sin Plus) — aprox. “debajo de Start”
ENABLED_MODULES=none

# Subconjunto manual (simula un tier)
ENABLED_MODULES=marketing,seo,coupons,homeEditor
```

#### Por deploy (app1 vs app2)

| Proyecto Vercel | Slug | `ENABLED_MODULES` | Rol |
|-----------------|------|-------------------|-----|
| `goat-indumentaria` | `demo-store` | omitido / vacío | Demo full (Pro). Ve Plan y módulos |
| `vaporx-store` | `vape-demo` | `none` | Beta núcleo. Ve Plan y módulos |
| `manoviva-store` | `manoviva-italia` | ignorado | Start fijo (`marketing`, `seo`). Menú Plan y módulos oculto |

**Regla:** los módulos no se restringen por vertical. Gating = `storeHasModule()`.

Ver: [`multi-store.md`](multi-store.md), `.cursor/rules/modules-gating.mdc`.

### Activación por tienda (Fase C — SaaS)

```prisma
model StorePlan {
  id      String   @id @default(cuid())
  storeId String   @unique
  tier    PlanTier @default(START) // START | GROW | PRO
  store   Store    @relation(...)
}
```

Tier → set de `ModuleId` (ver `PLAN_TIERS` en catálogo). `ENABLED_MODULES` queda override para demos. Billing cobra **un tier**, no suma de módulos ([NEX-10](https://linear.app/nexus-development/issue/NEX-10)).

### Gating

| Capa | Mecanismo |
|------|-----------|
| Admin layout | `requireModule("coupons")` en layout de la ruta |
| Admin nav | Ítems inactivos con badge y link a `/admin/plan` |
| API admin | `assertModule(...)` → `403` `{ code: "MODULE_REQUIRED" }` |
| Storefront | Solo si afecta compradores (cupones, wishlist, pixel) |

### Promo 2x1 (dentro de `coupons`)

| Pieza | Comportamiento |
|-------|----------------|
| Activación | Módulo `coupons` **y** `StorePromotionSettings.promo2x1Enabled` |
| Storefront | Banner, badges, pricing — `isPromo2x1ActiveForStore()` |
| Admin productos | Checkbox 2x1 si `storeHasModule("coupons")` |
| Hero home (slide 2x1) | Editorial; **no** depende del toggle |
| Vertical | `features.promo2x1` = UI; no bloquea el módulo |

### Pantalla Plan (`/admin/plan`)

- Comparativa Start / Grow / Pro
- Módulos con badge de tier mínimo
- CTA “Solicitar” (manual hasta billing)
- Demo: activación vía `ENABLED_MODULES`

### Billing (Fase C — pendiente)

- Stripe Billing o Mercado Pago suscripciones
- Webhook → `StorePlan.tier`
- Trial 14 días del plan
- Facturación: precio del tier (mensual o anual −20%)

---

## Qué no modularizar

- Login admin, sesión, logout
- CRUD productos, variantes, stock, imágenes
- Pedidos y estados
- Configuración mínima de tienda
- Checkout, pagos, emails transaccionales
- Cuenta cliente y mis pedidos (storefront)

---

## Orden de implementación

1–13. Módulos producto ✅ (ver historial en git / Linear)
14. **Pricing comercial** — tiers en docs + catálogo (NEX-13) ← este doc
15. **Billing + onboarding** — NEX-10 (Fase C)

---

## Referencias en código

| Pieza | Ruta |
|-------|------|
| Catálogo / tiers | `src/lib/modules/catalog.ts` |
| Acceso / gating | `src/lib/modules/access.ts` |
| Pantalla Plan | `src/app/admin/(protected)/plan/page.tsx` |
| Env | `.env.example` → `ENABLED_MODULES` |
