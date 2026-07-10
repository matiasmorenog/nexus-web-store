# Nexus Web Store

**E-commerce full-stack** para indumentaria deportiva — storefront, checkout con Mercado Pago, panel admin y emails transaccionales. Primer producto de [**Nexus**](https://github.com/matiasmorenog), pensado para desplegar tiendas reales y evolucionar a SaaS multi-tenant.

<p>
  <a href="https://nexus-web-store.vercel.app"><strong>Demo en vivo →</strong></a>
  ·
  <a href="https://nexus-web-store.vercel.app/admin/login">Admin</a>
  ·
  <a href="DEPLOY.md">Deploy</a>
  ·
  <a href="docs/multi-store.md">Dos tiendas</a>
  ·
  <a href="docs/caching-and-routes.md">Cache & rutas</a>
</p>

---

## Resumen

| Área | Qué incluye |
|------|-------------|
| **Storefront** | Catálogo con filtros en el cliente, PDP con variantes, carrito persistente, checkout, páginas legales |
| **Pagos** | Mercado Pago Checkout Pro + webhook (modo demo sin credenciales) |
| **Admin** | Dashboard con KPIs y gráficos, CRUD de productos/variantes, pedidos, imágenes (Vercel Blob) |
| **Backend** | PostgreSQL + Prisma, multi-tenant (`storeId`), emails con Resend |

La tienda demo se llama **Goat** en el storefront; **Nexus** no aparece en la UI pública.

---

## Stack

Next.js 16 · TypeScript · Tailwind CSS 4 · PostgreSQL · Prisma · NextAuth v5 · Zustand · Mercado Pago · Resend · Vercel Blob · Neon

---

## Decisiones técnicas

Puntos que prioricé en el diseño (útiles si estás evaluando el repo):

**Catálogo en el cliente** — Un único snapshot de productos (`unstable_cache`, 10 min) se filtra, ordena y pagina en el browser. Cero queries por cambio de filtro en la URL.

**Cache por capas** — ISR en home/catálogo/PDP, `unstable_cache` para datos pesados, `force-dynamic` en admin y checkout. Invalidación por tags al editar productos o confirmar pagos. Detalle en [`docs/caching-and-routes.md`](docs/caching-and-routes.md).

**Neon + serverless** — Pooler con `connection_limit=1`; queries admin en `$transaction` secuencial para evitar timeouts del pool.

**Multi-tenant + dos deploys** — Schema con `storeId`; hoy **dos proyectos Vercel** (app1 + app2) leen distinto `DEFAULT_STORE_SLUG` sobre la misma Neon. Verticales en `src/lib/store-verticals/`. Detalle en [`docs/multi-store.md`](docs/multi-store.md).

**Sin middleware Edge** — Auth del admin en layout server-side (límite de Vercel en middleware + DB).

---

## Funcionalidades

### Comprador

- Home con hero, categorías y destacados
- Catálogo con filtros por URL y búsqueda por texto
- Ficha de producto (talle, color, stock, 2x1)
- Carrito (drawer + página) con persistencia local
- Checkout: envío cotizado por CP, retiro en local, Mercado Pago
- Páginas legales, FAQ, guía de talles y contacto

### Comerciante (admin)

- Login con NextAuth
- Dashboard: alertas, ventas por período, top productos, pedidos recientes
- Productos: alta/edición, variantes, imágenes WebP, filtros y búsqueda
- Pedidos: listado, filtros, cambio de estado
- Configuración: nombre, envío fijo, retiro local

### Integraciones

- **Mercado Pago** — Checkout Pro + webhook; demo sin token
- **Emails** — Confirmación al cliente y aviso al comerciante (Resend o log en dev)
- **Imágenes** — Subida optimizada a Vercel Blob

---

## Inicio rápido

### Requisitos

Node.js 20+, cuenta [Neon](https://neon.tech) (PostgreSQL)

### Setup

```bash
git clone https://github.com/matiasmorenog/nexus-web-store.git
cd nexus-web-store
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

- **Tienda:** [http://localhost:3000](http://localhost:3000)
- **Admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Credenciales demo en `prisma/seed-env.ts` (email del owner + contraseña `admin123` por defecto).

### Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (Turbopack) |
| `npm run build && npm run start` | Probar como producción (cache real) |
| `npm run db:setup` | Schema + seed + pedidos demo |
| `npm run cache:revalidate` | Invalidar cache (con dev server activo) |
| `npm run db:studio` | Prisma Studio |

---

## Variables de entorno

Ver `.env.example`. Mínimo para desarrollo:

- `DATABASE_URL` / `DIRECT_URL` — Neon (pooler + direct)
- `AUTH_SECRET` / `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Opcionales: `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`

Sin Mercado Pago configurado, el checkout corre en **modo demo** (pago simulado).

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (storefront)/     # Tienda pública (ISR + filtros cliente)
│   ├── admin/            # Panel protegido (force-dynamic)
│   └── api/              # Checkout, webhooks, admin, internal
├── components/
│   ├── storefront/
│   ├── admin/
│   └── ui/
├── lib/                  # Queries, cache, auth, emails, catálogo
└── stores/               # Carrito (Zustand)
prisma/                   # Schema, seed, seed-env.ts
docs/                     # Guías técnicas (cache, rutas)
```

---

## Deploy

Guía completa en [`DEPLOY.md`](DEPLOY.md): Neon pooler, env vars en Vercel, `db:setup` en producción.

**Producción:** [https://nexus-web-store.vercel.app](https://nexus-web-store.vercel.app)

---

## Roadmap

Estado del producto. Marcá `[x]` al implementar cada ítem.

<details>
<summary><strong>Storefront</strong></summary>

- [x] Home, catálogo, filtros URL, PDP variantes
- [x] Carrito Zustand + drawer
- [x] Checkout y páginas post-pago
- [x] Búsqueda por texto
- [x] Retiro en local
- [x] Páginas legales, FAQ, contacto
- [x] Cuenta cliente + mis pedidos
- [x] Cupones (módulo Plus — admin + checkout)
- [x] Home editable (módulo Plus — bloques por tienda)
- [x] Export CSV (módulo Plus — pedidos y productos)
- [x] CRM lite (módulo Plus — clientes, tags y notas)
- [x] SEO avanzado (módulo Plus — sitemap, meta, JSON-LD)
- [x] Wishlist (módulo Plus — favoritos en storefront y cuenta)
- [x] Analytics avanzado (módulo Plus — comparación, embudo, clientes fieles, categorías, export CSV)
- [x] WhatsApp y Meta Pixel (módulo Plus)
- [x] Envíos carrier (módulo Plus — cotización por CP y seguimiento)
- [x] Temas premium (módulo Plus — paletas app2 + toggle visitante)

</details>

<details>
<summary><strong>Pagos y pedidos</strong></summary>

- [x] Mercado Pago + webhook + descuento de stock
- [x] Emails transaccionales (Resend)
- [ ] MP producción, AFIP

</details>

<details>
<summary><strong>Admin</strong></summary>

- [x] Dashboard con gráficos y períodos
- [x] CRUD productos, variantes, imágenes
- [x] Pedidos con filtros y estados
- [x] Configuración de tienda
- [x] Home editable (módulo Plus — bloques por tienda)
- [x] Export CSV (módulo Plus)
- [x] CRM lite (módulo Plus)
- [x] SEO avanzado (módulo Plus)
- [x] Wishlist (módulo Plus)
- [x] Analytics avanzado (módulo Plus)
- [x] WhatsApp y Meta Pixel (módulo Plus)
- [x] Envíos carrier (módulo Plus — cotización por CP y seguimiento)
- [x] Temas premium (módulo Plus)
- [x] Multi-usuario (módulo Plus)
- [x] API y webhooks (módulo Plus)

</details>

- [x] Multi-tenant schema, seed demo, deploy Vercel + Neon
- [x] Dos tiendas en producción (app1 + app2, 2 proyectos Vercel, 1 Neon) — ver [`docs/multi-store.md`](docs/multi-store.md)
- [x] Catálogo de módulos admin + plan base / Plus — ver [`docs/modules-pricing.md`](docs/modules-pricing.md)
- [x] GitHub Actions CI (lint + typecheck en PRs) — ver [`docs/ci.md`](docs/ci.md)
- [ ] CI Fase 1.5: corregir lint preexistente + branch protection en `development`
- [ ] CI Fase 2 (opcional, futuro): `build` en GitHub Actions — cuando la app esté en producción activa; hoy Vercel builda en preview/deploy
- [ ] Separar Vercel Blob por tienda antes de salir a producción
- [ ] Onboarding, billing automático

</details>

### Fases

| Fase | Objetivo |
|------|----------|
| **A** | Un negocio real (1 tienda) — casi completa |
| **B** | Competir con Tienda Nube lite (cupones, banners, carriers) |
| **C** | SaaS multi-tienda (onboarding, billing, temas) |

Reglas de desarrollo para agentes: `.cursor/rules/`

---

## Licencia

Proyecto privado — portfolio / demo de Nexus.
