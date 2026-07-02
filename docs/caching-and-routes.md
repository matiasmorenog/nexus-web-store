# Rutas y cache — guía simple

Cómo se cargan las páginas y cuándo se actualizan los datos. Si editás productos en el admin, empezá por la sección **«Cuando cambiás algo»**.

---

## Los 4 modos que usa este proyecto

### 1. Página con ISR (`revalidate = 600` en catálogo)

**Qué es:** Next guarda el HTML de la página y lo reutiliza. En home, catálogo y PDP el techo es **10 minutos** (`STOREFRONT_CATALOG_REVALIDATE_SECONDS` — mismo valor que el cache de datos del catálogo).

**Dónde:** Home, catálogo (`/productos`), ficha de producto (`/producto/...`).

**Nota:** Si editás un producto o hay un pago, los tags/paths invalidan antes de que venza el TTL.

---

### 2. `unstable_cache` — cache de datos en el servidor

**Qué es:** Envuelve una función async (típicamente una query a Prisma) y guarda su **resultado** en el Data Cache de Next. Ese valor lo pueden reutilizar otros requests mientras dure el TTL (ver `src/lib/cache-ttl.ts`).

**Cuándo expira:** Por tiempo o al instante si llamás `revalidateTag` / `revalidatePath` desde el admin o al confirmar un pago.

**Dónde:** `getStore`, `getCatalogIndex`, `getFeaturedProducts`, dashboard admin, facetas de productos admin.

**Un request** es una visita concreta a una URL (entrada, recarga o cambio de ruta). `unstable_cache` **sí** sobrevive entre requests en **producción** (`next start` / Vercel): si otro usuario entra 10 segundos después, puede usar la misma copia sin volver a Neon.

**En `npm run dev`:** Next no persiste el Data Cache igual que en prod (HMR, recargas frecuentes). Cada F5 suele ser cache miss → más queries a Neon y más skeletons. Eso es normal; **no** significa que el cache esté roto. Para probar cache como en Vercel: `npm run build && npm run start`. Opcional: `NEXT_PRIVATE_DEBUG_CACHE=1` en `.env` para ver hits/misses en la terminal.

---

### 3. `cache()` de React — deduplicar dentro de un request

**Qué es:** Importado de `react`. Si el layout y la page llaman `getStore()` en la **misma carga**, Prisma corre una sola vez. Cuando termina ese request, el resultado se descarta.

**Para qué sirve:** Evitar queries duplicadas cuando varios server components del mismo árbol necesitan los mismos datos.

**Dónde:** `requireAdminSession`, `getAdminOrdersPageData`, y como envoltorio de funciones que adentro usan `unstable_cache` (ej. `getAdminProductsSummary`).

**Alcance:** Termina cuando termina el request. No persiste entre recargas ni entre usuarios distintos.

---

### 4. `force-dynamic` o cliente — siempre fresco

**`force-dynamic`:** La page se ejecuta en cada request (admin, checkout). No se reutiliza HTML cacheado de visitas anteriores.

**Cliente (`"use client"`):** Los datos viven en el browser (carrito con Zustand, filtros del catálogo). El servidor no los guarda ni los comparte.

**Dónde:** Todo el admin protegido, checkout, carrito.

---

## TTL de fallback (`src/lib/cache-ttl.ts`)

El TTL **no** es «cada cuánto cambian los datos». Es el máximo que pueden quedar viejos si **no** corrió una invalidación. Los cambios reales disparan tag/path al instante.

| Constante | Segundos | Uso | Invalidación principal |
|-----------|----------|-----|------------------------|
| `STORE_CACHE_REVALIDATE_SECONDS` | 3600 (1 h) | `getStore` | Guardar config → tag `store` + paths legales |
| `STOREFRONT_CATALOG_REVALIDATE_SECONDS` | 600 (10 min) | Queries catálogo/destacados/PDP **e** ISR home / productos / PDP | Crear/editar/eliminar producto; pago confirmado (stock) |
| `ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS` | 300 (5 min) | Dashboard admin | Editar producto/pedido; pago confirmado |
| `ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS` | 600 (10 min) | Facetas en `/admin/productos` | Editar producto |

**Qué no subimos más:** listado de pedidos admin (sin `unstable_cache`); checkout (`force-dynamic`).

---

### Resumen por ruta

| Ruta | ¿Cómo carga? | Datos de DB | ¿Cuándo se actualiza? |
|------|--------------|-------------|------------------------|
| `/` | ISR 10 min | Destacados + nombre tienda | Al editar producto, pago o config tienda |
| `/productos` | ISR 10 min | Índice completo 1×; filtros en el **navegador** | Idem |
| `/producto/[slug]` | ISR 10 min | 1 producto | Idem (+ path del slug) |
| `/privacidad`, `/contacto`, etc. | SSG + ISR ~1 h | Texto en código; nombre tienda y email (contacto) desde DB | Ver **Páginas legales** |
| `/carrito` | Solo navegador | Nada en servidor | Siempre al instante (localStorage/Zustand) |
| `/checkout` | Cada visita | Tienda + cotización envío | Siempre |
| `/checkout/exito` | Cada visita | Estado del pedido recién pagado | Siempre |

### Páginas legales (`/privacidad`, `/contacto`, …)

Ruta: `(storefront)/[slug]/page.tsx` · slugs fijos en `src/lib/info-pages.ts`.

**En el build (`next build`):** `generateStaticParams()` lista los 7 slugs (`terminos`, `privacidad`, `cambios-y-devoluciones`, `envios`, `guia-de-talles`, `faq`, `contacto`) y Next **pregenera el HTML** de cada uno.

**Qué es estático vs qué viene de la DB:**

| Parte | Origen | Cuándo cambia |
|-------|--------|----------------|
| Textos legales (párrafos, listas) | `INFO_PAGES` en `info-pages.ts` | Solo al **deploy** (es código, no CMS) |
| `{{storeName}}` en títulos y cuerpo | `getStore()` en runtime del render | Al guardar config → tag `store` + `revalidatePath` de cada slug legal |
| Email en `/contacto` | `getMerchantEmail()` | Cuando se regenera esa página |

El TTL de `getStore` es **1 h**; las legales se regeneran antes si guardás config (paths explícitos) o cuando Next revalida el HTML por ISR ligado a esos datos.

**Al cambiar nombre de tienda en admin:** `saveStoreSettingsFromForm` invalida tag `store` y hace `revalidatePath` de `/`, `/checkout` y **todas** las páginas legales (`INFO_PAGE_SLUGS`).

### Flujo del catálogo

```
Visitante entra a /productos
    │
    ├─ Next sirve HTML cacheado (ISR, max 10 min)
    │
    └─ Índice de productos (unstable_cache 10 min, tag catalog-index)
            │
            └─ CatalogPageClient filtra en el browser (0 queries por filtro)
```

Mismo TTL (600s) en datos e HTML: si expira solo por tiempo, las dos capas se alinean. Las mutaciones en admin/pago invalidan tags **y** paths al instante.

### Funciones de datos (storefront)

| Función | Archivo | TTL fallback | Tag / path |
|---------|---------|--------------|------------|
| `getStore` | `store-context.ts` | 1 h | `store` — resuelve por `DEFAULT_STORE_SLUG` (`src/lib/store-env.ts`) |
| `getCatalogIndex` | `catalog-index-query.ts` | 10 min | `catalog-index` |
| `getFeaturedProducts` | `featured-products-query.ts` | 10 min | `featured-products` |
| `getStorefrontProduct` | `product-page-query.ts` | 10 min | `revalidatePath` del slug |

---

## Neon y `connection_limit=1`

`DATABASE_URL` usa el pooler de Neon con **`connection_limit=1`** (mismo valor en local y en Vercel — ver `DEPLOY.md`). Cada instancia de Node tiene **una sola conexión** al pool.

**Regla:** no lanzar varias queries de Prisma en **`Promise.all`** en el mismo request si cada una pide su propia conexión. Usar **`db.$transaction`** (secuencial, una conexión) o queries en serie.

| Área | Patrón |
|------|--------|
| Dashboard analytics (gráfico + top 5) | Queries en serie (sin `$transaction`; bloques Suspense en paralelo) |
| Dashboard alertas | Dos `count` en serie |
| Pedidos admin (`getAdminOrdersPageData`) | Una `$transaction` con todas las queries de la página |
| Productos admin (summary) | `$transaction` secuencial |
| Listados con total + página | Secuencial (batch, luego `count`) |

**Dashboard `/admin`:** tres bloques `Suspense` en paralelo (streaming). En cache miss, compiten por la misma conexión; cada bloque debe usar **como máximo 1 conexión** internamente. Evitar `Promise.all` dentro de un bloque.

Si el pool se satura, Prisma devuelve **`P2024`** (timeout ~10 s). No subir `connection_limit` solo en local: conviene replicar prod.

### Tienda activa en admin

Deploy de **una tienda** por base: `requireAdminSession` y `getAdminStoreId` (server actions) usan **`getStoreId()`** (slug en `store-env.ts`), no el `storeId` del JWT. Así, tras `db:seed`, el admin apunta a la tienda correcta sin query extra de usuario en cada request. La sesión JWT solo identifica al usuario.

---

## Admin

Todo el admin autenticado es **`force-dynamic`**: cada visita pega a la DB (salvo las partes con `unstable_cache` abajo).

| Ruta | Qué hace al cargar | Cache de datos |
|------|-------------------|----------------|
| `/admin` | Dashboard en 3 bloques con skeleton | **unstable_cache 5 min** (alertas, analytics SQL agregado, pedidos recientes) |
| `/admin/productos` | Panel de filtros (cache 10 min) + listado | **Tabla:** solo si hay filtro del panel o búsqueda `q`; sin filtros, 0 queries al listado |
| `/admin/pedidos` | Lista + filtros (1 query grande) | Query en cada visita; `cache()` deduplica si el mismo request la pide más de una vez |
| `/admin/productos/.../edit` | Producto + variantes por API al abrir | Sin cache |
| `/admin/configuracion` | Datos de tienda directo de DB | Sin cache |

**Scroll infinito** (pedidos y productos): páginas 2, 3… van por `GET /api/admin/orders` o `.../products` — siempre DB, sin cache persistente.

---

## Cuando cambiás algo (invalidación)

### Creás, editás o eliminás un producto o variante (admin)

`createProduct`, `updateProduct`, `deleteProduct` y mutaciones de variantes llaman `revalidateStorefrontProductSurfaces(slug)` + cache admin de productos/dashboard.

| Se actualiza | Cómo |
|--------------|------|
| Home, catálogo, PDP en producción | Tags `catalog-index`, `featured-products` + paths `/`, `/productos`, `/producto/{slug}` |
| Panel de filtros en `/admin/productos` | Tag `admin-products-summary-{storeId}` |
| Dashboard (alertas de stock) | Tag `admin-dashboard-{storeId}` |
| Páginas admin de productos | `revalidatePath` |

### Cambiás estado de un pedido

| Se actualiza | Cómo |
|--------------|------|
| Dashboard admin | Tag `admin-dashboard-{storeId}` |
| Lista de pedidos | `revalidatePath("/admin/pedidos")` |

### Guardás configuración de tienda (nombre, envío, retiro)

| Se actualiza | Cómo |
|--------------|------|
| Nombre en header/footer, checkout, legales | Tag `store` + paths `/`, `/checkout`, `/privacidad`, … |

### Llega un pago (webhook o demo)

`fulfillPaidOrder` descuenta stock y llama `revalidateStorefrontStockSurfaces` (catálogo, home, PDPs del pedido) + tag dashboard admin. Sin queries extra: solo invalidación de cache.

### Después de `db:seed` / `db:demo-orders` (scripts locales)

Los scripts de Prisma **no** corren dentro de Next: no pueden llamar `revalidateTag` directamente.

| Comando | Qué hace |
|---------|----------|
| `npm run cache:revalidate` | `POST /api/internal/revalidate-cache` (requiere `npm run dev` activo) |
| `db:seed`, `db:demo-orders`, `db:setup` | Al final encadenan `cache:revalidate` automáticamente |

Auth: header `Authorization: Bearer $AUTH_SECRET` (o `CACHE_REVALIDATE_SECRET`). URL: `CACHE_REVALIDATE_URL` o `http://localhost:3000`.

Si el servidor no está levantado, el script avisa y conviene **reiniciar `npm run dev`**.

Helper: `revalidateAllStoreCache()` en `src/lib/revalidate-all-cache.ts` (tags `store`, catálogo, destacados, admin + paths storefront/admin/PDPs).

---

## API (siempre dinámica)

No usan ISR. Cada llamada es en vivo.

| Ruta | Para qué |
|------|----------|
| `POST /api/checkout` | Crear pedido y pagar |
| `POST /api/webhooks/mercadopago` | Confirmar pago |
| `GET /api/admin/orders` | Más pedidos (scroll) |
| `GET /api/admin/products` | Más productos (scroll) |
| `GET /api/shipping/quote` | Cotizar envío por CP |
| `POST /api/contact` | Formulario de contacto |

---

## Referencia rápida de archivos

| Si querés ver… | Archivo |
|----------------|---------|
| Slug de tienda activa | `src/lib/store-env.ts` |
| Invalidar storefront al editar productos | `src/lib/revalidate-storefront-products.ts` |
| Invalidar cache admin | `src/lib/revalidate-admin-cache.ts` |
| Invalidar todo (post-seed) | `src/lib/revalidate-all-cache.ts`, `scripts/revalidate-cache.ts` |
| TTL centralizados | `src/lib/cache-ttl.ts` |
| Tags admin | `src/lib/admin-cache-tags.ts` |
| Dashboard admin (queries + cache) | `src/lib/admin-analytics.ts` |
| Sesión admin + `storeId` | `src/lib/admin-session.ts` |
| Mutaciones que disparan invalidación | `src/lib/admin-actions.ts`, `admin-store-settings.ts` |

---

## Pendiente (opcional)

- Cache de pedidos admin con `unstable_cache`
- Streaming en `/admin/productos` (como pedidos)

Ver `.cursor/rules/performance-todo.mdc`.

---

*Actualizar este doc si cambiás `revalidate`, tags o estrategia de cache en código.*
