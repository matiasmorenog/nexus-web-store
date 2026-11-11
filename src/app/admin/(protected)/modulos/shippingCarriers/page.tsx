import { redirect } from "next/navigation";

export default function AdminShippingCarriersLegacyRedirect() {
  redirect("/admin/configuracion/envios");
}
