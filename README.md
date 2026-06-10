# Nexus Web Store

Tienda de **ropa deportiva y CrossFit** construida con Next.js — primer producto de **Nexus**, diseñada para portfolio, despliegue para clientes reales (boxes, tiendas de indumentaria funcional) y evolución futura a plataforma SaaS multi-tienda.

## Características

- **Storefront:** catálogo con filtros, detalle de producto con variantes (talle/color), carrito persistente y checkout
- **Pagos:** integración con Mercado Pago Checkout Pro (modo demo sin credenciales)
- **Admin:** panel protegido para gestionar productos, pedidos y configuración de tienda
- **Multi-tenant ready:** modelo de datos preparado para múltiples tiendas (`storeId` en todas las entidades)

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma
- NextAuth.js v5
- Zustand (carrito)
- Mercado Pago SDK

## Inicio rápido

### 1. Variables de entorno

```bash
cp .env.example .env
```

### 2. Instalar y configurar

```bash
npm install
npm run db:setup
```

### 3. Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

### Credenciales demo (admin)

- **URL:** `/admin/login`
- **Email:** `admin@crossnexus.com`
- **Password:** `admin123`

## Mercado Pago

Para activar pagos reales, configurá en `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Sin credenciales válidas, el checkout funciona en **modo demo** (simula pago exitoso).

## Deploy en Vercel

1. Cambiá `provider` en `prisma/schema.prisma` a `postgresql` y configurá `DATABASE_URL`
2. Creá un proyecto en [Neon](https://neon.tech) o [Supabase](https://supabase.com)
3. Conectá el repo a Vercel
4. Configurá las variables de entorno de `.env.example`
5. Ejecutá `npm run db:setup` contra la base de producción
6. Deploy automático

## Estructura

```
src/
├── app/
│   ├── (storefront)/    # Tienda pública
│   ├── admin/           # Panel de administración
│   └── api/             # Checkout, webhooks, auth
├── components/
│   ├── storefront/
│   ├── admin/
│   └── ui/
├── lib/
└── stores/
```

## Roadmap

- **Fase 1 (actual):** Demo portfolio con seed data
- **Fase 2:** Personalización para cliente real (branding del box, catálogo CrossFit, MP producción)
- **Fase 3:** SaaS multi-tienda con onboarding y suscripciones

---

Built with **Nexus** — e-commerce sin comisiones.
