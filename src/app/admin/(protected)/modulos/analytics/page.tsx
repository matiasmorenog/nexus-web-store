import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy URL → Tráfico (Analytics Plus split). */
export default function AdminAnalyticsRedirectPage() {
  redirect("/admin/modulos/trafico");
}
