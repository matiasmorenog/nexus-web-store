# Deploy en Vercel — Alaska Indumentaria

## 1. Base de datos (Neon — gratis)

1. Creá cuenta en [neon.tech](https://neon.tech)
2. **New Project** → nombre `alaska-indumentaria`
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
4. Agregá estas **Environment Variables**:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Neon **Pooled** + `connection_limit=1&pgbouncer=true` (ver §1) |
| `DIRECT_URL` | Neon **Direct** (requerida para `prisma generate` en build; migraciones locales) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://TU-DOMINIO.vercel.app` (actualizar después del 1er deploy) |
| `NEXT_PUBLIC_APP_URL` | Igual que `AUTH_URL` |
| `DEFAULT_STORE_SLUG` | `alaska-indumentaria` |
| `MERCADOPAGO_ACCESS_TOKEN` | Opcional (modo demo sin esto) |
| `MERCADOENVIOS_ACCESS_TOKEN` | Opcional (modo demo sin esto) |
| `RESEND_API_KEY` | Opcional (sin esto los emails se loguean en consola) |
| `EMAIL_FROM` | `Alaska Indumentaria <onboarding@resend.dev>` o tu dominio verificado |
| `STORE_NOTIFICATION_EMAIL` | `admin@alaskaindumentaria.com` (avisos de nueva venta) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Opcional (email en página de contacto; default `contacto@alaskaindumentaria.com`) |
| `BLOB_READ_WRITE_TOKEN` | Opcional (sin esto no se pueden subir fotos en admin; URLs externas siguen funcionando) |

### Imágenes (Vercel Blob)

1. En el proyecto de Vercel → **Storage** → **Create Database** → **Blob**
2. **Access: Public** (obligatorio — las fotos se muestran en la tienda con URL directa; un store Private no sirve y no se puede cambiar después)
3. **Region: São Paulo (gru1)** recomendado para Argentina
4. Conectá el store al proyecto; se crea `BLOB_READ_WRITE_TOKEN` automáticamente
5. Para desarrollo local, copiá el token a `.env`:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

Las fotos se comprimen a **WebP** (máx. 1200×1600 px) al subir. Plan Hobby: 1 GB storage, 10 GB transfer/mes.

5. **Deploy**

## 4. Inicializar la base de datos (una sola vez)

Desde tu máquina, con las URLs de Neon (direct para schema, pooled opcional):

```bash
DATABASE_URL="postgresql://...@ep-xxx-pooler...?sslmode=require&connection_limit=1&pgbouncer=true" \
DIRECT_URL="postgresql://...@ep-xxx...?sslmode=require" \
npm run db:setup
```

Esto crea las tablas y carga los productos demo.

### Checklist post-deploy (conexiones)

En Vercel → Settings → Environment Variables, confirmá:

- [ ] `DATABASE_URL` usa host `-pooler`
- [ ] `DATABASE_URL` incluye `connection_limit=1`
- [ ] `DATABASE_URL` incluye `pgbouncer=true`
- [ ] `DIRECT_URL` configurada (Neon direct, sin `-pooler`) — requerida para el build
- [ ] Tras cambiar URLs → **Redeploy**

## 5. Actualizar URLs post-deploy

En Vercel → Settings → Environment Variables, actualizá:

- `AUTH_URL` → `https://tu-proyecto.vercel.app`
- `NEXT_PUBLIC_APP_URL` → `https://tu-proyecto.vercel.app`

Redeploy: Deployments → ⋮ → Redeploy.

## 6. Verificar

- Tienda: `https://tu-proyecto.vercel.app`
- Admin: `https://tu-proyecto.vercel.app/admin/login`
- Credenciales: `admin@alaskaindumentaria.com` / `admin123`

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
