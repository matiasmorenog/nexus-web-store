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

### Integración Neon ↔ Vercel (preview branching)

Si conectaste Neon con la integración de Vercel, puede crearse **un branch de Neon por cada preview deploy** (cada PR). Eso no viene del código del repo.

**Para este proyecto** (un Neon, dos tiendas, datos demo compartidos) conviene **una sola DB** para Production y Preview.

#### ¿Qué integración tenés?

| Dónde ves Neon | Tipo | Cómo cortar branches por preview |
|----------------|------|----------------------------------|
| Vercel → **Storage** → aparece Neon Postgres | Vercel-Managed | Desactivar **Preview** en Deployments Configuration (abajo) |
| Vercel → **Storage** solo muestra Blob (tu caso habitual) | **Neon-Managed** | **Disconnect** en Neon Console (no hay toggle) |

Si en Storage solo ves Blob, Neon está enlazado desde **Neon Console → Integrations → Vercel** o desde **Vercel → Integrations** (Connectable Account), no desde Storage.

#### Neon-Managed — desactivar branching (recomendado acá)

No se puede apagar el branching por preview sin desconectar la integración. Pasos:

1. **Neon Console** → [console.neon.tech](https://console.neon.tech) → tu proyecto.
2. Menú **Integrations** → Vercel → **Manage** → **Disconnect**.
3. En **Vercel** (cada proyecto: `nexus-web-store` y `nexus-vape-store`):
   - **Settings → Environment Variables**
   - Confirmá que existen `DATABASE_URL` y `DIRECT_URL` para **Production** y **Preview** (copiá las URLs desde Neon → Connection details del branch `main` / production).
   - Si la integración había inyectado vars con prefijo o duplicadas (`POSTGRES_URL`, `PGHOST`, etc.), dejalas solo si las usás; este repo usa `DATABASE_URL` + `DIRECT_URL`.
4. Opcional: **Vercel → Team/Project → Integrations** → Neon → **Remove** si sigue instalada.
5. **Redeploy** un preview para verificar que ya no aparecen branches `preview/*` nuevos.

La DB en Neon no se borra; solo dejás de crear branches automáticos.

#### Vercel-Managed — solo si Neon aparece en Storage

Repetí en **cada** proyecto Vercel:

1. Vercel → proyecto → **Storage** → base Neon.
2. **Projects** → tu proyecto → **Settings**.
3. **Advanced Options** → **Deployments Configuration**.
4. **Desactivá Preview**.
5. Guardá.

#### Limpiar branches viejos

Neon Console → proyecto → **Branches** (o Integrations → Vercel → Manage → Branches) → eliminá `preview/*`. No borres `main` / `production`.

Doc Neon: [Neon-Managed](https://neon.com/docs/guides/neon-managed-vercel-integration), [Vercel-Managed](https://neon.com/docs/guides/vercel-managed-integration), [preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup).

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

Regla completa para el agente: `.cursor/rules/git-workflow.mdc`.

```
feat|fix|refactor|chore|docs/*  ──PR──►  development  ──PR──►  main  ──►  producción (Vercel ×2)
```

- **`development`** — integración y preview. **Una tarea = un branch nuevo** desde acá.
- **`main`** — producción. Solo release PR desde `development`.
- Nombres: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/` + `kebab-case`.
- No mezclar implementaciones en el mismo branch. No PR de features a `main`.

### Feature (día a día)

```bash
git fetch origin development
git checkout development && git pull origin development
git checkout -b feat/mi-cambio          # branch nuevo, nombre acorde a la tarea
# ... trabajo y commits cuando corresponda ...
git fetch origin development && git merge origin/development
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
