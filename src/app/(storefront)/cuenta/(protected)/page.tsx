import { redirect } from "next/navigation";
import { storefrontPath } from "@/lib/storefront-paths";

export default function CustomerAccountPage() {
  redirect(storefrontPath("accountOrders"));
}
