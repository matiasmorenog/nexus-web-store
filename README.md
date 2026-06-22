# Nexus Web Store

Tienda de **ropa deportiva y CrossFit** construida con Next.js — primer producto de **Nexus**, diseñada para portfolio, despliegue para clientes reales (boxes, tiendas de indumentaria funcional) y evolución futura a plataforma SaaS multi-tienda.

## Características

- **Storefront:** catálogo con filtros, detalle de producto con variantes (talle/color), carrito persistente y checkout
- **Pagos:** integración con Mercado Pago Checkout Pro (modo demo sin credenciales)
- **Envíos:** cotización y seguimiento con Mercado Envíos (modo demo sin credenciales)
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
- **Email:** el configurado en el seed (`SEED_ADMIN_EMAIL`, default `admin@example.com`)
- **Password:** `admin123`

## Mercado Pago

Para activar pagos reales, configurá en `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Sin credenciales válidas, el checkout funciona en **modo demo** (simula pago exitoso).

## Mercado Envíos

Sin `MERCADOENVIOS_ACCESS_TOKEN`, el checkout cotiza envío según CP, genera un código de seguimiento simulado (18 caracteres, formato Mercado Libre + Correo Argentino) y enlaza al [formulario oficial de Correo Argentino para envíos MercadoLibre](https://www.correoargentino.com.ar/formularios/mercadolibre). Mercado Libre no expone una URL pública de rastreo; en producción se guarda la URL del transportista que devuelve la API.

Para integración real (futuro):

```env
MERCADOENVIOS_ACCESS_TOKEN="TEST-..."
```

## Deploy en Vercel

Ver guía paso a paso en [`DEPLOY.md`](DEPLOY.md).

1. Creá un proyecto en [Neon](https://neon.tech) y copiá la connection string (pooler)
2. Configurá las variables de entorno en Vercel (ver `DEPLOY.md`)
3. Ejecutá `npm run db:setup` contra la base de producción
4. Deploy / redeploy en Vercel

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

## Roadmap de features

Estado actual del producto vs. lo necesario para operar como app real. Actualizar los checkboxes al implementar cada ítem.

> Reglas de Cursor en `.cursor/rules/` (`project-context.mdc`, `roadmap.mdc`) — resumen para el agente y prioridades sin re-explorar el código.

### Storefront (comprador)

- [x] Home con hero, categorías y productos destacados
- [x] Catálogo con listado de productos
- [x] Filtros por categoría, talle y precio máximo (query params)
- [x] Detalle de producto con variantes (talle / color / stock / precio)
- [x] Carrito persistente (Zustand + localStorage)
- [x] Drawer de carrito en header + página `/carrito`
- [x] Checkout con datos de envío del cliente
- [x] Páginas post-pago (éxito / pendiente / error)
- [x] Header y footer responsive con navegación por categorías
- [x] Búsqueda por texto (header + filtros del catálogo, query `q`)
- [ ] Cuenta de cliente (registro, login, perfil)
- [ ] Mis pedidos y seguimiento de estado
- [ ] Cupones y promociones
- [x] Retiro en local en checkout (opción en checkout si `allowPickup`; envío $0)
- [ ] Múltiples opciones de envío (zonas, carriers, peso)
- [ ] Wishlist / favoritos
- [ ] Reviews y valoraciones de productos
- [ ] Newsletter / captura de emails
- [x] Páginas legales (términos, privacidad, cambios y devoluciones)
- [x] FAQ, guía de talles y contacto
- [ ] SEO por producto/categoría (meta tags, Open Graph, sitemap) — pospuesto para demo
- [ ] Integración WhatsApp (“consultar por WA”)
- [ ] Carrito abandonado (email recordatorio)

### Pagos y pedidos

- [x] Integración Mercado Pago Checkout Pro
- [x] Webhook de confirmación de pago
- [x] Modo demo sin credenciales MP (simula pago exitoso)
- [x] Descuento de stock al confirmar pedido
- [ ] Mercado Pago en producción (credenciales reales)
- [x] Email de confirmación de compra al cliente (demo: consola; con `RESEND_API_KEY`: envío real)
- [x] Email de notificación de venta al comerciante
- [ ] Facturación / integración AFIP (Argentina)

### Panel admin

- [x] Login protegido (NextAuth, credenciales)
- [x] Dashboard con KPIs básicos (productos, pedidos, ingresos)
- [x] Alta de productos con variante inicial
- [x] Listado y eliminación de productos
- [x] Listado de pedidos con cambio de estado
- [x] Configuración: nombre tienda, costo envío fijo, flag retiro local
- [x] Edición de productos existentes
- [x] CRUD de variantes adicionales (talle/color/stock/precio)
- [ ] Gestión de inventario (ajustes manuales, alertas de stock bajo)
- [x] Subida de imágenes (Vercel Blob, WebP optimizado al subir)
- [ ] Galería / múltiples fotos por producto
- [ ] Categorías dinámicas (hoy: lista fija en código)
- [x] Filtros y búsqueda en pedidos
- [ ] Detalle de pedido con notas internas
- [ ] Exportar pedidos / productos (CSV)
- [ ] Dashboard con gráficos y períodos
- [ ] Gestión de clientes (CRM lite)
- [ ] Gestión de usuarios y permisos (roles existen en schema, sin UI)
- [ ] Configuración de marca (logo, colores, dominio custom)
- [ ] Cupones, banners y home editable desde admin

### Infraestructura y SaaS

- [x] Modelo multi-tenant en Prisma (`storeId` en entidades)
- [x] Tienda demo (seed configurable vía `prisma/seed-env.ts`)
- [x] Deploy en Vercel + PostgreSQL (Neon)
- [ ] Dominio propio por tienda (`customDomain` en schema, sin implementar)
- [ ] Onboarding self-service (“creá tu tienda”)
- [ ] Planes y facturación (suscripción mensual)
- [ ] Temas / templates intercambiables
- [ ] Integraciones (Instagram, Google Shopping, Meta Pixel)
- [ ] Envíos con carriers (OCA, Andreani, Correo Argentino)
- [ ] API pública y webhooks para terceros

### Fases de producto

**Fase A — Usable por un negocio real (1 tienda)**  
Editar productos, subir fotos, emails, búsqueda, retiro en local, páginas legales, SEO básico, cuenta cliente.

**Fase B — Competir con Tienda Nube lite**  
Cupones, home editable, categorías dinámicas, dominio custom, analytics, envíos carrier, WhatsApp / Meta Pixel.

**Fase C — SaaS multi-tienda**  
Onboarding, planes/billing, temas, multi-usuario, API.

---

Built with **Nexus** — e-commerce sin comisiones.
