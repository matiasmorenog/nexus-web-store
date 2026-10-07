"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { readAdminLocaleFromDocument, type AdminLocale } from "@/lib/admin-locale";

const COPY: Record<
  AdminLocale,
  {
    title: string;
    description: string;
    enableLabel: string;
    savedMessage: string;
    saveLabel: string;
    savingLabel: string;
    errorFallback: string;
  }
> = {
  es: {
    title: "Efectivo al retirar",
    description:
      "El cliente confirma el pedido y paga en efectivo cuando lo retira en persona.",
    enableLabel: "Activar pago en efectivo en checkout",
    savedMessage: "Configuración de efectivo guardada.",
    saveLabel: "Guardar efectivo",
    savingLabel: "Guardando...",
    errorFallback: "No se pudo guardar la configuración.",
  },
  it: {
    title: "Contanti al ritiro",
    description:
      "Il cliente conferma l'ordine e paga in contanti quando lo ritira di persona.",
    enableLabel: "Attiva pagamento in contanti in checkout",
    savedMessage: "Configurazione contanti salvata.",
    saveLabel: "Salva contanti",
    savingLabel: "Salvataggio...",
    errorFallback: "Non è stato possibile salvare la configurazione.",
  },
};

type AdminCashPaymentFormProps = {
  initialEnabled: boolean;
};

export function AdminCashPaymentForm({ initialEnabled }: AdminCashPaymentFormProps) {
  const router = useRouter();
  const copy = COPY[readAdminLocaleFromDocument()];
  const [cashEnabled, setCashEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ cashEnabled }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? copy.errorFallback);
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : copy.errorFallback,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title={copy.title} description={copy.description} className="max-w-lg">
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={cashEnabled}
            onChange={(event) => setCashEnabled(event.target.checked)}
          />
          {copy.enableLabel}
        </label>

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">{copy.savedMessage}</AdminFormAlert>
        ) : null}

        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? copy.savingLabel : copy.saveLabel}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}
