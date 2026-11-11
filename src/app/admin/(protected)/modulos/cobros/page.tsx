import { redirect } from "next/navigation";

export default function AdminCobrosLegacyRedirect() {
  redirect("/admin/configuracion/cobros");
}
