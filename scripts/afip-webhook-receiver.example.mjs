/**
 * Receptor mínimo para probar webhooks order.paid en local.
 *
 * Uso:
 *   WEBHOOK_SECRET=tu-secret node scripts/afip-webhook-receiver.example.mjs
 *
 * Con tienda local: pegar http://localhost:4567 en Admin → API → URL webhook
 * (Next hace fetch saliente; no hace falta ngrok si ambos corren en la misma máquina)
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.WEBHOOK_PORT ?? 4567);
const SECRET = process.env.WEBHOOK_SECRET;

function verifySignature(secret, rawBody, signatureHeader) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = `sha256=${digest}`;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

if (!SECRET || SECRET.length < 8) {
  console.error("Definí WEBHOOK_SECRET (mín. 8 caracteres).");
  process.exit(1);
}

createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method not allowed");
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const signature = req.headers["x-nexus-signature"];
    const event = req.headers["x-nexus-event"];

    if (
      !verifySignature(
        SECRET,
        rawBody,
        typeof signature === "string" ? signature : null,
      )
    ) {
      console.warn("[webhook] Firma inválida");
      res.writeHead(401);
      res.end("Invalid signature");
      return;
    }

    const payload = JSON.parse(rawBody);
    console.log("\n[webhook] Evento:", event);
    console.log(JSON.stringify(payload, null, 2));

    if (payload.data?.invoice?.status === "PENDING") {
      console.log("[AFIP stub] Pedido listo para facturar en homologación");
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true }));
  });
}).listen(PORT, () => {
  console.log(`Webhook receiver en http://localhost:${PORT}`);
  console.log("Esperando POST order.paid…");
});
