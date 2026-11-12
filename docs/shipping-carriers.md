# Shipping carriers (AR)

Each enabled operator needs **its own credentials**. Checkout only quotes carriers that are enabled **and** configured. Creating a shipment uses the buyer-selected carrier API.

## Mercado Envíos

- **Auth:** Mercado Libre / Mercado Pago Access Token (`TEST-` / `APP_USR-`). Priority: Envíos admin → Cobros MP → `MERCADOENVIOS_ACCESS_TOKEN`.
- **Quote:** Mercado Libre shipping options API.
- **Create shipment:** Not available as a generic external-cart label API. Quote works; create fails with a clear message — finish in ML or use Correo/Andreani.
- **Admin guide:** Configuración → Envíos → card Mercado Envíos.

## Correo Argentino (MiCorreo)

- **Auth:** API user + password (HTTP Basic → JWT) + `customerId`. Sandbox uses `apitest.correoargentino.com.ar`.
- **Quote:** `POST /rates`.
- **Create shipment:** import/create order endpoints; tracking stored on the order.
- Credentials come from a Correo commercial contact (not self-serve like MP).

## Andreani

- **Auth:** Client ID + Client Secret (Basic → Bearer) + contract number. Sandbox: `apisqa.andreani.com`.
- **Quote:** `GET /v1/tarifas`.
- **Create shipment:** order API + label fetch when available.
- Credentials from Andreani PyME / corporate portals.

## Shared admin settings

- Origin ZIP and default item weight (grams).
- Operator toggles: only configured carriers actually quote.
- Pickup in store remains free and independent of carriers.
