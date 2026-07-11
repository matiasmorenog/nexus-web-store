"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreStaffRole } from "@prisma/client";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  adminSelectClass,
} from "@/components/admin/admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  STORE_STAFF_ROLE_DESCRIPTIONS,
  STORE_STAFF_ROLE_LABELS,
  STORE_STAFF_ROLES,
  type StoreStaffMember,
} from "@/lib/store-users";

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
  const [staffRole, setStaffRole] = useState<StoreStaffRole>("SELLER");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
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
        body: JSON.stringify({ email, name, password, staffRole }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo invitar al usuario.");
      }

      setEmail("");
      setName("");
      setPassword("");
      setStaffRole("SELLER");
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

  const handleRoleChange = async (userId: string, nextRole: StoreStaffRole) => {
    setUpdatingRoleId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/store-users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ staffRole: nextRole }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo actualizar el rol.");
      }

      setSuccess("Rol actualizado correctamente.");
      router.refresh();
    } catch (roleError) {
      setError(
        roleError instanceof Error
          ? roleError.message
          : "No se pudo actualizar el rol.",
      );
    } finally {
      setUpdatingRoleId(null);
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
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-900">
                      {member.name ?? member.email}
                    </p>
                    <Badge variant="default">
                      {STORE_STAFF_ROLE_LABELS[member.staffRole]}
                    </Badge>
                  </div>
                  <p className="text-neutral-600">{member.email}</p>
                  <p className="text-xs text-neutral-500">
                    {STORE_STAFF_ROLE_DESCRIPTIONS[member.staffRole]}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={member.staffRole}
                      disabled={updatingRoleId === member.id}
                      onChange={(event) =>
                        void handleRoleChange(
                          member.id,
                          event.target.value as StoreStaffRole,
                        )
                      }
                      className={adminSelectClass}
                      aria-label={`Rol de ${member.name ?? member.email}`}
                    >
                      {STORE_STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {STORE_STAFF_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={removingId === member.id}
                      onClick={() => handleRemove(member.id)}
                    >
                      {removingId === member.id ? "Quitando…" : "Quitar"}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {canManage ? (
        <AdminCard
          title="Invitar usuario"
          description="Creá un usuario staff con email, contraseña y rol."
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
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="staff-role">Rol</Label>
                <select
                  id="staff-role"
                  value={staffRole}
                  onChange={(event) =>
                    setStaffRole(event.target.value as StoreStaffRole)
                  }
                  className={adminSelectClass}
                >
                  {STORE_STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {STORE_STAFF_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500">
                  {STORE_STAFF_ROLE_DESCRIPTIONS[staffRole]}
                </p>
              </div>
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
