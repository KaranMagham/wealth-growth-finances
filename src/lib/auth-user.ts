import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({
    headers: Object.fromEntries((await headers()).entries()),
  });

  return session?.user?.id ?? null;
}
