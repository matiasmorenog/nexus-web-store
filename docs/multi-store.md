# Dos tiendas, un repo (app1 + app2)

Arquitectura para correr **Goat Indumentaria** (ropa) y **VAPORX** (app2) sin SaaS: mismo código en `main`, **dos proyectos Vercel**, **una base Neon** con dos filas `Store`. Cada deploy activa su tienda con `DEFAULT_STORE_SLUG` (layout y config derivados del slug).

Operación día a día: [`DEPLOY.md`](../DEPLOY.md). Cache y rutas: [`caching-and-routes.md`](caching-and-routes.md).

---

## Producción

| Proyecto Vercel | Slug | URL | Config storefront | Módulos (`ENABLED_MODULES`) |
|-----------------|------|-----|-------------------|----------------------------|
| `nexus-web-store` | `demo-store` | https://nexus-web-store.vercel.app | app1 | omitido → todos (demo full) |
| `nexus-vape-store` | `vape-demo` | https://nexus-vape-store.vercel.app | app2 | `none` → plan base (activar módulos por env) |

Los módulos Plus están **disponibles para ambas tiendas**; el vertical no los bloquea. Detalle en [`modules-pricing.md`](modules-pricing.md) y `.cursor/rules/modules-gating.mdc`.

---

## Cómo funciona en código

| Pieza | Ruta |
|-------|------|
| Registry slug → config | `src/lib/store-slugs.ts`, `src/lib/store-verticals/index.ts` |
| Config app1 / app2 | `src/lib/store-verticals/app1/config.ts`, `.../app2/config.ts` |
| Homes y layout por tienda | `src/themes/app1/`, `src/themes/app2/` |
| Componentes compartidos | `src/components/storefront/` (catálogo, carrito, checkout, header) |
| Store por deploy | `src/lib/store-env.ts`, `src/lib/store-context.ts` |
| Seed multi-tienda | `prisma/seed-env.ts` → `SEED_STORES` |
| Dev local | `scripts/dev-store.sh`, `npm run dev:app1` / `dev:app2` / `dev:both` |

**App1 (`demo-store`):** catálogo completo, filtros género/categoría/talle, home con hero y tiles.

**App2 (`vape-demo`):** catálogo completo con filtros nicotina/sabor, home con destacados. Variantes en UI como **Sabor** / **Nicotina** (mismos campos `color` / `size` en DB).

---

## Avances de implementación

Marcá `[x]` al cerrar cada ítem. El roadmap general del producto sigue en [`README.md`](../README.md) (siguiente feature: cuenta cliente).

### Código y datos

- [x] Registry slug → storefront config (`demo-store` / `vape-demo`)
- [x] Switches en home, redirect catálogo app2, Header/Footer desde config
- [x] Tokens UI por vertical (CSS vars, `Button.tsx`, layout storefront)
- [x] Categorías app2 + admin sin filtro género (`ProductTaxonomyFields`)
- [x] Labels Sabor/Nicotina en admin, PDP, carrito, checkout y emails
- [x] Modo home-only app2 (histórico) + `App2Home` (hero + grid)
- [x] Branding por deploy (metadata, `brandSuffix`, aviso +18, color por vertical / `Store.primaryColor`)
- [x] Seed: `demo-store` + `vape-demo`, owners distintos, scripts wipe/seed por tienda
- [x] `.env.example` documentado + `scripts/dev-store.sh`
- [x] Filtros catálogo parametrizados por vertical (app1; motor listo para app2 fase 2)

### Infra y deploy

- [x] Un Neon, dos filas `Store`
- [x] Dos proyectos Vercel con env distinto (slug, URLs, `AUTH_SECRET`, MP)
- [x] Webhooks Mercado Pago por dominio (documentado en `DEPLOY.md`)
- [x] `DEPLOY.md` acotado + flujo `development` → `main`
- [x] Scripts Ignored Build Step (`scripts/vercel-should-build-*.sh`)
- [x] Template PR (`.github/pull_request_template.md`)

### Pendiente — operación Vercel / GitHub

Pasos manuales; detalle en [`DEPLOY.md`](../DEPLOY.md).

- [x] **Ignored Build Step** en proyecto **app1**: `bash scripts/vercel-should-build-app1.sh`
- [x] **Ignored Build Step** en proyecto **app2**: `bash scripts/vercel-should-build-app2.sh`
- [x] **Protección de branches** en GitHub: `main` y `development` con *Require pull request*
- [x] **Default branch** en GitHub → `development`
- [x] **Release** `development` → `main` (PR #3 mergeado)

### Catálogo app2

- [x] Motor de filtros parametrizado por `catalogFacets` + labels desde config
- [x] Catálogo público activo en config `vape-demo` (sin env extra)
- [ ] (Opcional) `Product.attributes` para campos por categoría
- [ ] (Opcional) `@@unique([storeId, sku])` si hace falta SKU estricto entre productos
- [ ] (Opcional) `primaryColor` editable desde admin
- [ ] Corregir URLs Unsplash rotas en `prisma/seed-data-app2.ts`

---

## Flujo Git

Ver `.cursor/rules/git-workflow.mdc` y `DEPLOY.md`.

```
feat|fix|refactor|chore|docs/*  ──PR──►  development  ──PR──►  main  ──►  producción (Vercel ×2)
```

Una tarea = branch nuevo desde `development`. Producción solo vía release PR.

---

## Verificar scripts skip-build (local)

Simulá archivos cambiados:

```bash
# Solo docs → ambos proyectos deberían skip (exit 0)
VERCEL_GIT_PREVIOUS_SHA=HEAD~1 VERCEL_GIT_COMMIT_SHA=HEAD \
  bash scripts/vercel-should-build-app1.sh; echo "app1 exit: $?"

# Tras un commit que solo toque app2/, app1 skip y app2 build
```

Exit **0** = Vercel **omite** el build. Exit **1** = **ejecuta** build.
