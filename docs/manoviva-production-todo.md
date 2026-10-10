# Manoviva — estado de producción

Tienda real en producción (`manoviva-store`, slug `manoviva-italia`, Neon `main`). Pendientes vivos en [`TODO.md`](../TODO.md) § Manoviva.

## Activo

- Checkout con retiro, transferencia (descuento opcional), efectivo opcional y WhatsApp.
- Páginas Consegne / Condizioni / Resi con contenido real.
- Owner `morenor127@gmail.com`. Contraseña **nunca** en el repo; reset por admin o seed one-off con env (`APP3_STORE_OWNER_PASSWORD` / `MANOVIVA_OWNER_PASSWORD`). Si una contraseña llegó a un commit: rotarla y actualizar el hash.
- Plan Start fijo (`marketing`, `seo`); menú Plan y módulos oculto.

## Comportamiento a tener en cuenta

- Formulario de contacto: `/api/contact` responde 503 para app3 (cerrado por código). El contacto va por WhatsApp/email.
- Envío: `shippingCost = 0` hasta cargar tarifas Poste Italiane (ver `TODO.md`).
- El aviso “Sito in preparazione” solo aparece si el email de la tienda termina en `.example`.

## Base de datos

- Cambios de schema liberados a producción requieren `db push` contra Neon `main` con sí explícito.
- `db:seed:app3` borra la tienda: no se corre contra `main` sin sí explícito.
