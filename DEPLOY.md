# Deploy en Vercel

## 1. Base de datos (Neon — gratis)

1. Creá cuenta en [neon.tech](https://neon.tech)
2. **New Project** → nombre de tu proyecto
3. En el dashboard → **Connect** → copiá **dos** connection strings:
   - **Pooled** → `DATABASE_URL` (runtime en Vercel y `next dev`)
   - **Direct** → `DIRECT_URL` (solo migraciones y `db:setup` desde tu máquina)

### Formato obligatorio para Vercel (serverless)

La URL pooled **debe** incluir:

- Host con `-pooler` (ej. `ep-xxx-pooler.us-east-1.aws.neon.tech`)
- `sslmode=require`
- `connection_limit=1` — una conexión por instancia serverless
- `pgbouncer=true` — Prisma + PgBouncer de Neon

Ejemplo (reemplazá user, password y host):

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&connection_limit=1&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

> **No** uses la URL direct (sin pooler) como `DATABASE_URL` en Vercel: con muchas funciones en paralelo podés agotar el límite de conexiones de Neon.

Ver plantilla completa en `.env.example`.

## 2. Subir el código a GitHub

```bash
cd ~/Workspace/nexus-web-store
git add .
git commit -m "Prepare for Vercel deploy"
gh repo create nexus-web-store --private --source=. --push
```

Si no tenés `gh`, creá el repo manualmente en GitHub y:

```bash
git remote add origin https://github.com/TU_USUARIO/nexus-web-store.git
git push -u origin main
```

## 3. Importar en Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Seleccioná `nexus-web-store`
3. Framework: **Next.js** (detectado automáticamente)
4. Agregá estas **Environment Variables** (solo **Production**; no hace falta duplicar en Development si desarrollás local con `.env`):

### Obligatorias en Vercel (Production)

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Neon **Pooled** (`-pooler`) + `sslmode=require&connection_limit=1&pgbouncer=true` |
| `DIRECT_URL` | Neon **Direct** (sin `-pooler`) + `sslmode=require` — **no** uses `DATABASE_URL_UNPOOLED`; copiá el valor directo acá |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://nexus-web-store.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Igual que `AUTH_URL` |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob (subir fotos en admin) |
| `RESEND_API_KEY` | API key de [resend.com](https://resend.com) — **misma en local y Production** |
| `STORE_VERTICAL` | `apparel` o `vape` — define UI, catálogo y labels |
| `NEXT_PUBLIC_STORE_VERTICAL` | Igual que `STORE_VERTICAL` (componentes cliente) |
| `DEFAULT_STORE_SLUG` | Slug de la tienda en DB (`demo-store` o `vape-demo`) |

### Opcionales en Vercel

| Variable | Cuándo |
|----------|--------|
| `MERCADOPAGO_ACCESS_TOKEN` | Pagos reales (sin esto checkout en modo demo) |
| `MERCADOENVIOS_ACCESS_TOKEN` | Cotización envíos real (sin esto modo demo) |

### No agregar / podés borrar en Vercel

| Variable | Motivo |
|----------|--------|
| `DATABASE_URL_UNPOOLED` | Reemplazada por `DIRECT_URL` (Prisma lee `DIRECT_URL`) |
| `BLOB_STORE_ID` | La crea la integración; el código no la usa |
| `BLOB_WEBHOOK_PUBLIC_KEY` | El proyecto no usa webhooks de Blob |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email desde DB (owner) |
| `STORE_NOTIFICATION_EMAIL` | Idem |

Runtime: **una fila** en `Store` por deploy, elegida con `DEFAULT_STORE_SLUG`. El seed crea **2 tiendas** en la misma DB (ver `prisma/seed-env.ts`).

### Emails (Resend)

1. Cuenta en [resend.com](https://resend.com) → **API Keys** → crear key (`re_...`)
2. Misma `RESEND_API_KEY` en **`.env` local** y **Vercel Production**
3. El remitente (`From`) se arma en runtime: **`{nombre tienda} <{email owner en DB}>`** (mismo email que contacto y notificaciones)

**Resend y el dominio del remitente:** el email del owner debe estar **verificado en Resend** (o su dominio, ej. Gmail verificado), si no Resend rechaza el envío. Para la demo del portfolio con alias Gmail, registrá la cuenta Resend con ese mismo inbox.

Sin `RESEND_API_KEY`, los emails solo se imprimen en logs (`demo-log`).

### Imágenes (Vercel Blob)

1. En el proyecto de Vercel → **Storage** → **Create Database** → **Blob**
2. **Access: Public** (obligatorio — las fotos se muestran en la tienda con URL directa; un store Private no sirve y no se puede cambiar después)
3. **Region: São Paulo (gru1)** recomendado para Argentina
4. Conectá el store al proyecto; se crea `BLOB_READ_WRITE_TOKEN` automáticamente
5. Para desarrollo local con subida de fotos, copiá el mismo token a `.env`:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

(Vercel → tu proyecto → **Storage** → Blob → **Connect to Project** → copiar token, o Settings → Environment Variables.)

Las fotos se comprimen a **WebP** (máx. 1200×1600 px) al subir. Plan Hobby: 1 GB storage, 10 GB transfer/mes.

5. **Deploy**

## 4. Inicializar la base de datos (una sola vez)

Desde tu máquina, con las URLs de Neon (direct para schema, pooled opcional):

```bash
DATABASE_URL="postgresql://...@ep-xxx-pooler...?sslmode=require&connection_limit=1&pgbouncer=true" \
DIRECT_URL="postgresql://...@ep-xxx...?sslmode=require" \
npm run db:setup
```

Esto crea las tablas y carga los productos demo. Config del seed: `prisma/seed-env.ts`.

```bash
npm run db:seed:all        # ambas tiendas
npm run db:seed:apparel    # solo demo-store (Goat)
npm run db:seed:vape       # solo vape-demo (Cloud)
npm run db:wipe:apparel    # borrar solo apparel
npm run db:wipe:vape       # borrar solo vape
```

### Checklist post-deploy (conexiones)

En Vercel → Settings → Environment Variables, confirmá:

- [ ] `DATABASE_URL` usa host `-pooler`
- [ ] `DATABASE_URL` incluye `connection_limit=1` y `pgbouncer=true`
- [ ] `DIRECT_URL` configurada (Neon direct, sin `-pooler`) — no `DATABASE_URL_UNPOOLED`
- [ ] `BLOB_READ_WRITE_TOKEN` presente si usás subida de fotos
- [ ] `RESEND_API_KEY` (emails reales local y demo; remitente desde DB)
- [ ] Sin vars de email duplicadas (todo desde DB)
- [ ] Tras cambiar URLs → **Redeploy**

## 5. Actualizar URLs post-deploy

En Vercel → Settings → Environment Variables, actualizá:

- `AUTH_URL` → `https://tu-proyecto.vercel.app`
- `NEXT_PUBLIC_APP_URL` → `https://tu-proyecto.vercel.app`

Redeploy: Deployments → ⋮ → Redeploy.

## 6. Verificar

- Tienda: `https://tu-proyecto.vercel.app`
- Admin: `https://tu-proyecto.vercel.app/admin/login`
- Credenciales admin: las de `prisma/seed-env.ts` (email del owner queda en DB tras el seed)

## Desarrollo local con PostgreSQL

```bash
docker compose up -d
```

En `.env` (ver `.env.example`):

```env
DATABASE_URL="postgresql://nexus:nexus@localhost:5432/nexus_web_store"
DIRECT_URL="postgresql://nexus:nexus@localhost:5432/nexus_web_store"
```

```bash
npm run db:setup
npm run dev
```

Si subís fotos en admin en local, agregá `BLOB_READ_WRITE_TOKEN` en `.env` (mismo valor que en Vercel Production). Para emails reales, `RESEND_API_KEY` (misma key que en Vercel).

## 7. Dos tiendas (mismo repo, dos proyectos Vercel)

Una sola base Neon con **2 filas** `Store` (slugs distintos). Dos proyectos Vercel apuntan al mismo repo `main` pero con env distinto:

| Variable | Proyecto apparel | Proyecto vape |
|----------|------------------|---------------|
| `STORE_VERTICAL` | `apparel` | `vape` |
| `NEXT_PUBLIC_STORE_VERTICAL` | `apparel` | `vape` |
| `DEFAULT_STORE_SLUG` | `demo-store` | `vape-demo` |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | URL del deploy apparel | URL del deploy vape |
| `AUTH_SECRET` | **Distinto por proyecto** | **Distinto por proyecto** |
| `MERCADOPAGO_ACCESS_TOKEN` | Cuenta MP tienda 1 | Cuenta MP tienda 2 |
| `BLOB_READ_WRITE_TOKEN` | Mismo o store Blob separado | Mismo o store Blob separado |

Slugs y owners del seed: `prisma/seed-env.ts` → `SEED_STORES`.

Variables, valores permitidos y perfiles: `.env.example` → sección **TIENDA ACTIVA**. En local: `npm run dev:apparel` / `npm run dev:vape` (`scripts/dev-store.sh`).

### Webhooks Mercado Pago

Cada dominio/proyecto necesita su propio webhook en el panel de MP:

- Apparel: `https://tu-tienda-apparel.vercel.app/api/webhooks/mercadopago`
- Vape: `https://tu-tienda-vape.vercel.app/api/webhooks/mercadopago`

Usá el `MERCADOPAGO_ACCESS_TOKEN` de la cuenta MP correspondiente a cada tienda.

### Aislamiento opcional (2 Neon)

Si más adelante querés separar datos por completo, podés usar **2 proyectos Neon** (uno por tienda) con el mismo código. Para 2 tiendas chicas, **1 Neon + 2 Store** es más barato y suficiente.

## 8. Hobby vs Pro (uso comercial)

| | Hobby (gratis) | Pro (~USD 20/mes por miembro) |
|---|---|---|
| Proyectos | Hasta ~200 por cuenta | Más cuota y features de equipo |
| Uso permitido | Demo personal, portfolio, pruebas | **Tiendas con ventas reales** |
| Mercado Pago producción | No recomendado (ToS) | Sí |
| Dominio custom | Limitado en Hobby | Incluido |

**Checklist antes de vender:**

- [ ] Plan **Pro** en Vercel si la tienda es comercial (ventas reales, MP producción)
- [ ] `AUTH_SECRET` único por proyecto Vercel
- [ ] `AUTH_URL` y `NEXT_PUBLIC_APP_URL` con el dominio final de cada tienda
- [ ] Webhook MP configurado por dominio
- [ ] `DEFAULT_STORE_SLUG` correcto en cada deploy
- [ ] Email del owner verificado en Resend

> No hay límite de “2 proyectos” en Hobby: el límite real es la **cuota compartida** entre todos tus proyectos y las restricciones de **uso comercial**.
