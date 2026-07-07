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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreStaffMember } from "@/lib/store-users";

type AdminStoreUsersPanelProps = {
  members: StoreStaffMember[];
  canManage: boolean;
};

export function AdminStoreUsersPanel({
  members,
  canManage,
}: AdminStoreUsersPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/store-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, name, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo invitar al usuario.");
      }

      setEmail("");
      setName("");
      setPassword("");
      setSuccess("Usuario invitado correctamente.");
      router.refresh();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "No se pudo invitar al usuario.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm("¿Quitar el acceso de este usuario a la tienda?")) {
      return;
    }

    setRemovingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/store-users/${userId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo quitar al usuario.");
      }

      setSuccess("Usuario quitado de la tienda.");
      router.refresh();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "No se pudo quitar al usuario.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="Usuarios staff"
        description="Personas con acceso al panel admin además del owner."
      >
        {members.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Todavía no hay usuarios staff. Invitá a alguien con el formulario de
            abajo.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {member.name ?? member.email}
                  </p>
                  <p className="text-neutral-600">{member.email}</p>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={removingId === member.id}
                    onClick={() => handleRemove(member.id)}
                  >
                    {removingId === member.id ? "Quitando…" : "Quitar"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {canManage ? (
        <AdminCard
          title="Invitar usuario"
          description="Creá un usuario staff con email y contraseña propios."
        >
          <AdminForm onSubmit={handleInvite} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Nombre</Label>
                <Input
                  id="staff-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Contraseña temporal</Label>
              <Input
                id="staff-password"
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
            {success ? (
              <AdminFormAlert variant="success">{success}</AdminFormAlert>
            ) : null}

            <AdminFormActions>
              <Button type="submit" disabled={loading}>
                {loading ? "Invitando…" : "Invitar usuario"}
              </Button>
            </AdminFormActions>
          </AdminForm>
        </AdminCard>
      ) : (
        <p className="text-sm text-neutral-600">
          Solo el owner de la tienda puede invitar o quitar usuarios staff.
        </p>
      )}
    </div>
  );
}
