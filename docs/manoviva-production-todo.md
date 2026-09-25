# Manoviva — datos pendientes de producción

La instancia puede publicarse como muestra visual, pero no debe abrir pedidos ni cobros hasta completar esta lista.

- ~~Reemplazar email owner~~ — hecho: `morenor127@gmail.com` (seed + DB development).
- ~~Sustituir la contraseña administrativa inicial~~ — hash en Neon **development** ya actualizado. **Nunca** guardar la contraseña en el repo.
  - Seed app3: setear `APP3_STORE_OWNER_PASSWORD` (o `MANOVIVA_OWNER_PASSWORD`) en el entorno al correr `db:seed:app3`; sin env usa solo fallback demo local (`admin123`).
  - Producción (cuando exista Neon `main` / Vercel Production): setear password por canal seguro — reset en admin, o seed one-off con env en Vercel/CI **sin** commitear el valor. No escribir prod DB sin sí explícito.
  - Si la contraseña estuvo en un commit de GitHub: **rotar** la de la dueña y actualizar el hash en DB.
- Definir ciudad, dirección comercial y horarios.
- Incorporar el número real de WhatsApp y obtener autorización para publicarlo.
- Confirmar zonas, costos y transportista para entregas.
- Confirmar si habrá retiro y cuál será el punto de entrega.
- Configurar la cuenta Stripe propia de Manoviva y validar webhooks.
- Completar razón social, identificación fiscal, privacidad, condiciones y devoluciones aplicables en Italia.
- Activar el formulario de contacto, checkout, pagos y entregas solamente después de validar los puntos anteriores.

Mientras estos datos sean provisionales, la web debe mostrar el aviso “Sito in preparazione” y mantener desactivados los flujos comerciales.
