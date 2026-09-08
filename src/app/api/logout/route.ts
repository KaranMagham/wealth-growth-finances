// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError, isAPIError } from "better-auth/api";
import { getAuthenticatedSession } from "@/lib/admin/requireAdmin";
import { recordActivity } from "@/lib/activity/recordActivity";
import { endPresence } from "@/lib/presence/updatePresence";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req.headers);
    const { headers: setHeaders } = await auth.api.signOut({
      returnHeaders: true,
      headers: Object.fromEntries((await headers()).entries()),
    });

    const res = NextResponse.json(
      { success: true, message: "Logged out" },
      { status: 200 }
    );

    if (session?.user) {
      await recordActivity({
        userId: session.user.id,
        sessionId: session.session.id,
        action: "LOGOUT",
      });
      await endPresence(session.user.id, session.session.id);
    }

    const cookies = setHeaders.getSetCookie();
    cookies.forEach((cookie) => {
      res.headers.append("Set-Cookie", cookie);
    });

    return res;
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as APIError;
      return NextResponse.json(
        { success: false, message: apiError.message },
        { status: Number(apiError.status) || 400 }
      );
    }

    console.error("SignOut error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}