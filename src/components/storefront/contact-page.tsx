"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, MapPin } from "lucide-react";
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Consulta desde ${storeName}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${fromEmail}\n\n${message}`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border bg-neutral-50 p-6 space-y-4"
        >
          <div>
            <Label htmlFor="contact-name">Nombre</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
            />
          </div>
          <div>
            <Label htmlFor="contact-message">Mensaje</Label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar consulta
          </Button>
          <p className="text-xs text-neutral-500">
            Al enviar se abrirá tu cliente de correo con el mensaje preparado.
          </p>
        </form>
      </div>
    </div>
  );
}
