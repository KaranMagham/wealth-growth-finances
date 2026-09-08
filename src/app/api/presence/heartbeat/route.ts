import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedSession } from "@/lib/admin/requireAdmin";
import { updatePresence } from "@/lib/presence/updatePresence";

export async function POST(request: NextRequest) {
  const session = await getAuthenticatedSession(request.headers);

  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await updatePresence(session.user.id, session.session.id);
  return NextResponse.json({ success: true });
}