import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy hub URL → first Config child. */
export default function AdminConfigIndexPage() {
  redirect("/admin/configuracion/idioma");
}
