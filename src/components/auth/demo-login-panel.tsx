"use client";

import { useMemo, useState, type ReactNode } from "react";
import { signIn } from "next-auth/react";
import { setAuthIntentCookies } from "@/lib/auth-client";
import { isDemoLoginUiEnabled } from "@/lib/demo-login";
import {
  demoPersonasForStore,
  type DemoPersonaKind,
} from "@/lib/demo-personas";
import { storefrontPath } from "@/lib/storefront-paths";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function DemoLoginForm({ kind }: { kind: DemoPersonaKind }) {
  const personas = useMemo(() => demoPersonasForStore(undefined, kind), [kind]);
  const [personaId, setPersonaId] = useState(personas[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selected = personas.find((persona) => persona.id === personaId);

  if (personas.length === 0) return null;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!personaId || !selected) return;
    setError(null);
    setLoading(true);
    setAuthIntentCookies(selected.kind === "staff" ? "admin" : "customer", false);

    const result = await signIn("demo", {
      personaId,
      redirect: false,
    });

    if (result?.error) {
      setError("No se pudo iniciar la sesión demo. ¿Corriste el seed de esta tienda?");
      setLoading(false);
      return;
    }

    window.location.assign(
      selected.kind === "staff" ? "/admin" : storefrontPath("accountOrders"),
    );
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <Label htmlFor={`demo-persona-${kind}`}>Persona demo</Label>
        <select
          id={`demo-persona-${kind}`}
          value={personaId}
          onChange={(event) => setPersonaId(event.target.value)}
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40"
          required
        >
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.label}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="text-xs text-neutral-500">{selected.description}</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading || !personaId}>
        {loading ? "Ingresando..." : "Entrar como demo"}
      </Button>
    </form>
  );
}

export function LoginWithDemoOption({
  kind,
  children,
}: {
  kind: DemoPersonaKind;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!isDemoLoginUiEnabled()) return children;
  if (demoPersonasForStore(undefined, kind).length === 0) return children;

  return (
    <div className="space-y-4">
      {open ? null : children}
      <details
        className="rounded-lg border border-dashed border-[var(--brand-primary)]/35 bg-white/60"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary
          className={cn(
            "cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-[var(--brand-primary)]",
            "[&::-webkit-details-marker]:hidden",
          )}
        >
          <span className="flex items-center justify-between gap-2">
            <span>Inicio demo</span>
            <span className="text-xs font-normal text-neutral-500">
              {open ? "Ocultar" : "Acceso rápido"}
            </span>
          </span>
        </summary>
        {open ? (
          <div className="space-y-3 border-t border-[var(--brand-primary)]/15 px-3 pt-3 pb-4">
            <p className="text-xs text-neutral-600">
              Persona de prueba del seed. Sin contraseña. Solo en development y
              preview.
            </p>
            <DemoLoginForm kind={kind} />
          </div>
        ) : null}
      </details>
    </div>
  );
}
