"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle, Mail, MapPin } from "lucide-react";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactPageContent } from "@/lib/info-pages";

const fieldClass =
  "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

type ContactPageProps = {
  page: ContactPageContent;
  email: string;
  storeName: string;
  locale?: string;
  allowPickup?: boolean;
};

export function ContactPage({
  page,
  email,
  storeName,
  locale = "es-AR",
  allowPickup = true,
}: ContactPageProps) {
  const isItalian = locale === "it-IT";
  const isProvisional = isItalian && email.endsWith(".example");
  const title = isItalian ? "Contatti" : page.title;
  const description = isItalian
    ? "Scrivici per una creazione personalizzata, un regalo o qualsiasi informazione."
    : page.description;
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isProvisional) {
      setError("Il modulo sarà attivato quando saranno disponibili i contatti definitivi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: fromEmail, message }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error ??
            (isItalian ? "Non è stato possibile inviare il messaggio" : "No se pudo enviar la consulta"),
        );
      }

      setSent(true);
      setName("");
      setFromEmail("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isItalian
            ? "Errore imprevisto"
            : "Error inesperado",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-2 text-sm text-neutral-500">
        <Link href="/" className="transition-colors hover:text-[var(--brand-primary)]">
          {isItalian ? "Home" : "Inicio"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{title}</span>
      </nav>

      <StorefrontPageHeader title={title} description={description} />

      {isProvisional ? (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <strong>Sito in preparazione.</strong> Email, sede e modalità di consegna sono dati
          provvisori e verranno sostituiti prima dell&apos;apertura degli ordini.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)]">
              <Mail className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Email</p>
              <a
                href={`mailto:${email}`}
                className="text-sm text-neutral-600 transition-colors hover:text-[var(--brand-primary)]"
              >
                {email}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)]">
              <MapPin className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                {isProvisional
                  ? "Sede provvisoria"
                  : allowPickup
                  ? isItalian
                    ? "Ritiro"
                    : "Retiro en local"
                  : isItalian
                    ? "Creazione su misura"
                    : "Creación personalizada"}
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {isProvisional
                  ? "Italia · città e laboratorio da definire"
                  : allowPickup
                  ? isItalian
                    ? "Ti confermeremo via email il punto e il momento del ritiro."
                    : "Disponible según opción en checkout. Te confirmamos el punto de retiro por email cuando tu pedido esté listo."
                  : isItalian
                    ? "Raccontaci l'occasione, i colori e i dettagli che immagini. Ti risponderemo con una proposta."
                    : "Contanos la ocasión y los detalles que imaginás. Te responderemos con una propuesta."}
              </p>
            </div>
          </div>
          <p className="border-t border-neutral-100 pt-4 text-sm text-neutral-500">
            {isProvisional
              ? "Contatti, orari e sede devono essere confermati dalla titolare."
              : isItalian
              ? "Rispondiamo dal lunedì al venerdì in orario commerciale."
              : "Respondemos de lunes a viernes en horario comercial. Para cambios o devoluciones, incluí tu número de pedido."}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/80 bg-[var(--brand-primary-soft)]/40 p-8 text-center shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="mt-4 font-medium text-neutral-900">
              {isItalian ? "Messaggio inviato!" : "¡Consulta enviada!"}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {isItalian
                ? `Abbiamo ricevuto il tuo messaggio per ${storeName}. Ti risponderemo presto.`
                : `Recibimos tu mensaje en ${storeName}. Te responderemos a la brevedad.`}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => setSent(false)}
            >
              {isItalian ? "Invia un altro messaggio" : "Enviar otra consulta"}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6"
          >
            <div>
              <Label htmlFor="contact-name">{isItalian ? "Nome" : "Nombre"}</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">{isItalian ? "La tua email" : "Tu email"}</Label>
              <Input
                id="contact-email"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="contact-message">{isItalian ? "Messaggio" : "Mensaje"}</Label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                rows={5}
                disabled={loading}
                className={fieldClass}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading || isProvisional}>
              {isProvisional
                ? "Modulo non ancora attivo"
                : loading
                ? isItalian
                  ? "Invio..."
                  : "Enviando..."
                : isItalian
                  ? "Invia messaggio"
                  : "Enviar consulta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
