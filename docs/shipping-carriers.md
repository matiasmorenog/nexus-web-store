# Shipping carriers (AR)

Each enabled operator needs **its own credentials**. Checkout only quotes carriers that are enabled **and** configured. Creating a shipment uses the buyer-selected carrier API.

## Mercado Envíos

- **Auth:** Mercado Libre / Mercado Pago Access Token (`TEST-` / `APP_USR-`). Priority: Envíos admin → Cobros MP → `MERCADOENVIOS_ACCESS_TOKEN`.
- **Test:** use `TEST-` token first. Checkout with a real ZIP (e.g. 1425). Create-shipment may fail for external carts — message is explicit.
- **Prod:** switch to `APP_USR-` after quote works.
- **Admin guide:** Configuración → Envíos → card Mercado Envíos (includes how to test).

## Correo Argentino (MiCorreo)

- **Auth:** API user + password (HTTP Basic → JWT) + `customerId`.
- **Test (QA switch ON):** `apitest.correoargentino.com.ar` with QA credentials only. Quote in checkout → paid order → Admin «Generar envío» (test order, no real dispatch).
- **Prod (QA switch OFF):** production credentials + `api.correoargentino.com.ar`.
- Credentials come from a Correo commercial contact (not self-serve like MP).

## Andreani

- **Auth:** Client ID + Client Secret (Basic → Bearer) + contract number.
- **Test (sandbox switch ON):** `apisqa.andreani.com`. Quote → paid order → «Generar envío» (+ label when API returns it).
- **Prod (sandbox OFF):** `apis.andreani.com` with production credentials.
- Credentials from Andreani PyME / corporate portals.

## Shared admin settings

- Origin ZIP and default item weight (grams).
- Operator toggles: only configured carriers actually quote.
- Pickup in store remains free and independent of carriers.
