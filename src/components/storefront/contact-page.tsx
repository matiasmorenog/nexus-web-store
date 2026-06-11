"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactPageContent } from "@/lib/info-pages";

type ContactPageProps = {
  page: ContactPageContent;
  email: string;
  storeName: string;
};

export function ContactPage({ page, email, storeName }: ContactPageProps) {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
        throw new Error(result.error ?? "No se pudo enviar la consulta");
      }

      setSent(true);
      setName("");
      setFromEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="transition-colors hover:text-[var(--brand-primary)]">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{page.title}</span>
      </nav>

      <h1 className="text-3xl font-bold">
        <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
          {page.title}
        </span>
      </h1>
      <p className="mt-3 text-neutral-600">{page.description}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-primary)]" />
            <div>
              <p className="font-medium">Email</p>
              <a
                href={`mailto:${email}`}
                className="text-sm text-neutral-600 transition-colors hover:text-[var(--brand-primary)]"
              >
                {email}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-primary)]" />
            <div>
              <p className="font-medium">Retiro en local</p>
              <p className="text-sm text-neutral-600">
                Disponible según opción en checkout. Te confirmamos el punto de
                retiro por email cuando tu pedido esté listo.
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Respondemos de lunes a viernes en horario comercial. Para cambios o
            devoluciones, incluí tu número de pedido.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-neutral-50 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="mt-4 font-medium">¡Consulta enviada!</p>
            <p className="mt-2 text-sm text-neutral-600">
              Recibimos tu mensaje en {storeName}. Te responderemos a la brevedad.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => setSent(false)}
            >
              Enviar otra consulta
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border bg-neutral-50 p-6"
          >
            <div>
              <Label htmlFor="contact-name">Nombre</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Tu email</Label>
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
              <Label htmlFor="contact-message">Mensaje</Label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                rows={5}
                disabled={loading}
                className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 disabled:opacity-50"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar consulta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
