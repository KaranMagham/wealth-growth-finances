import { forbidden, redirect } from "next/navigation";
import { headers } from "next/headers";

import { requireAdmin } from "@/lib/admin/requireAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdmin(await headers());

  if (!access.authorized) {
    if (access.status === 401) redirect("/login");
    forbidden();
  }

  return children;
}