# Deploy y operación

Repo: `matiasmorenog/nexus-web-store`. **Un Neon**, **dos filas** `Store` en DB, **dos proyectos Vercel** con env distinto. Cada deploy lee una tienda y su layout vía `DEFAULT_STORE_SLUG`.

**Avances y checklist:** [`docs/multi-store.md`](docs/multi-store.md) (implementación hecha + pendientes Vercel/GitHub).

## Checklist operación (Vercel / GitHub)

- [x] Ignored Build Step en **nexus-web-store**: `bash scripts/vercel-should-build-apparel.sh`
- [x] Ignored Build Step en **nexus-vape-store**: `bash scripts/vercel-should-build-vape.sh`
- [x] Branch protection: `main` + `development` → Require pull request
- [x] Default branch en GitHub → `development`
- [ ] Release `development` → `main` cuando haya cambios listos para producción

Vercel → cada proyecto → **Settings → Git → Ignored Build Step** → pegar el comando de la fila correspondiente.

## Producción actual

| Proyecto Vercel | Tienda | URL | `DEFAULT_STORE_SLUG` |
|-----------------|--------|-----|----------------------|
| `nexus-web-store` | Goat (apparel) | https://nexus-web-store.vercel.app | `demo-store` |
| `nexus-vape-store` | VAPORX (vape) | https://nexus-vape-store.vercel.app | `vape-demo` |

Admin: `/admin/login` — credenciales en `prisma/seed-env.ts`.

## Variables por proyecto

Marcá **Production** y **Preview** en Vercel. Compartidas entre proyectos salvo donde se indica.

| Variable | Apparel | Vape |
|----------|---------|------|
| `DEFAULT_STORE_SLUG` | `demo-store` | `vape-demo` |
| `NEXT_PUBLIC_DEFAULT_STORE_SLUG` | `demo-store` | `vape-demo` |
| `AUTH_URL` | `https://nexus-web-store.vercel.app` | `https://nexus-vape-store.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | igual que `AUTH_URL` | igual que `AUTH_URL` |
| `AUTH_SECRET` | **único por proyecto** | **único por proyecto** |
| `DATABASE_URL` | Neon pooled (misma DB) | Neon pooled (misma DB) |
| `DIRECT_URL` | Neon direct (misma DB) | Neon direct (misma DB) |
| `BLOB_READ_WRITE_TOKEN` | compartido o separado | compartido o separado |
| `RESEND_API_KEY` | compartida | compartida |
| `MERCADOPAGO_ACCESS_TOKEN` | cuenta MP apparel | cuenta MP vape |

Opcionales: `MERCADOENVIOS_ACCESS_TOKEN` (sin esto, envíos en modo demo).

No uses: `DATABASE_URL_UNPOOLED`, `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY`, vars de email en env (salen de DB).

Detalle de slugs y valores: `.env.example` → **TIENDA ACTIVA**.

## Neon (`DATABASE_URL` en Vercel)

URL **pooled** (`-pooler` en el host):

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&connection_limit=1&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

No uses la URL direct como `DATABASE_URL` en Vercel.

## Base de datos (seed)

Desde tu máquina (una vez o cuando resetees demo):

```bash
npm run db:setup          # schema + ambas tiendas + pedidos demo apparel
npm run db:seed:all       # solo re-seed ambas tiendas
npm run db:seed:apparel   # solo demo-store
npm run db:seed:vape      # solo vape-demo
npm run db:wipe:apparel   # borra solo apparel (sin re-seed)
npm run db:wipe:vape      # borra solo vape
```

Owners y slugs: `prisma/seed-env.ts` → `SEED_STORES`.

Tras cambiar env en Vercel → **Redeploy**.

## Servicios

**Resend:** remitente `{nombre tienda} <{email owner en DB}>`. El email del owner debe estar verificado en Resend. Sin `RESEND_API_KEY`, emails solo en logs.

**Vercel Blob:** Storage → Blob → **Public**, región `gru1` recomendada. WebP al subir (máx. 1200×1600). Mismo token en local `.env` si subís fotos en dev.

**Mercado Pago — webhooks (uno por dominio):**

- Apparel: `https://nexus-web-store.vercel.app/api/webhooks/mercadopago`
- Vape: `https://nexus-vape-store.vercel.app/api/webhooks/mercadopago`

## Desarrollo local

```bash
cp .env.example .env   # completar DATABASE_URL, etc.
npm run db:setup
npm run dev:apparel    # :3000
npm run dev:vape       # :3001
npm run dev:both       # ambas a la vez
```

Docker Postgres alternativo: ver comentarios en `.env.example`.

## Menos builds en Vercel

**Settings → Git → Ignored Build Step** (en cada proyecto):

| Proyecto | Comando |
|----------|---------|
| apparel | `bash scripts/vercel-should-build-apparel.sh` |
| vape | `bash scripts/vercel-should-build-vape.sh` |

Exit 0 = omitir build. Ej.: PR solo vape → apparel no builda; PR solo docs → ninguno.

Preview en vape es opcional; podés probar vape con `npm run dev:vape` y dejar preview solo en apparel.

## Git: branches y PRs

Regla para el agente: `.cursor/rules/git-workflow.mdc`.

```
feat/mi-cambio  ──PR──►  development  ──PR──►  main  ──►  producción (Vercel ×2)
```

- **`development`** — integración. Los PR de features van **acá**, no a `main`.
- **`main`** — producción. Solo entra vía PR desde `development`.

### Feature (día a día)

```bash
git checkout development && git pull
git checkout -b feat/mi-cambio
git push -u origin feat/mi-cambio
gh pr create --base development
```

### Release a producción

Cuando `development` esté estable:

```bash
gh pr create --base main --head development --title "release: development → main"
```

Merge → deploy de producción en apparel + vape (salvo Ignored Build Step).

| Evento | Producción (`main`) | Preview |
|--------|---------------------|---------|
| PR / merge → `development` | No | Sí |
| PR / merge → `main` | Sí (×2) | — |
| Push directo a `main` | Sí | **Evitar** |

**GitHub (recomendado):** Settings → General → Default branch → `development` (así `gh pr create` apunta ahí por defecto). Protegé `main` y `development` con **Require pull request**.

Template PR: `.github/pull_request_template.md`.

## Hobby vs Pro

| | Hobby | Pro (~USD 20/mes) |
|---|--------|-------------------|
| Uso | Demo / portfolio | **Ventas reales** |
| MP producción | No recomendado (ToS) | Sí |

Antes de vender: plan Pro, `AUTH_SECRET` distinto por proyecto, webhooks MP, owner verificado en Resend.

## Segundo proyecto Vercel (referencia)

Si hay que recrear vape: [vercel.com/new](https://vercel.com/new) → mismo repo → env de la tabla con fila **Vape** → `AUTH_URL` / `NEXT_PUBLIC_APP_URL` con la URL final del proyecto.

Aislamiento total de datos (opcional): 2 proyectos Neon en lugar de 1. Para pocas tiendas, **1 Neon + 2 Store** alcanza.
