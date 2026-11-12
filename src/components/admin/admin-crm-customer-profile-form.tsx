"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminTextarea } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  normalizeCustomerEmail,
  parseCustomerTags,
  type CrmCustomerProfile,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

type AdminCrmCustomerProfileFormProps = {
  email: string;
  profile: CrmCustomerProfile;
  readOnly?: boolean;
  compact?: boolean;
};

export function AdminCrmCustomerProfileForm({
  email,
  profile,
  readOnly = false,
  compact = false,
}: AdminCrmCustomerProfileFormProps) {
  const router = useRouter();
  const [tagsInput, setTagsInput] = useState(profile.tags.join(", "));
  const [notes, setNotes] = useState(profile.notes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(
        `/api/admin/crm/customers/${encodeURIComponent(normalizeCustomerEmail(email))}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            tags: parseCustomerTags(tagsInput),
            notes,
          }),
        },
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar el perfil.");
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el perfil.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminCard
      className={cn(compact && "h-full")}
      title="Tags y notas"
      description="Info interna del equipo."
    >
      <form className="flex h-full flex-col gap-3" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="crm-tags">Tags</Label>
          <Input
            id="crm-tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="vip, mayorista, instagram"
            disabled={readOnly}
          />
          <p className="text-xs text-neutral-500">Separá con comas · máx. 12</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-1.5">
          <Label htmlFor="crm-notes">Notas internas</Label>
          <AdminTextarea
            id="crm-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={compact ? 4 : 5}
            placeholder="Preferencias, acuerdos, envío..."
            disabled={readOnly}
            className={cn(compact && "min-h-[6.5rem] resize-y")}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-emerald-600">Perfil guardado.</p>
        ) : null}

        {readOnly ? (
          <p className="text-sm text-neutral-500">Solo lectura.</p>
        ) : (
          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-fit shrink-0 rounded-md px-4"
          >
            {pending ? "Guardando..." : "Guardar perfil"}
          </Button>
        )}
      </form>
    </AdminCard>
  );
}
