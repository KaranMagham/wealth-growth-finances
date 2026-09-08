import { auth } from "@/lib/auth";

export async function getAuthenticatedSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function requireAdmin(headers: Headers) {
  const session = await getAuthenticatedSession(headers);

  if (!session?.user) {
    return { authorized: false as const, status: 401 as const };
  }

  const adminUserId = process.env.ADMIN_USER_ID?.trim();
  if (!adminUserId || session.user.id !== adminUserId) {
    return { authorized: false as const, status: 403 as const };
  }

  return {
    authorized: true as const,
    userId: session.user.id,
    sessionId: session.session.id,
    user: session.user,
  };
}