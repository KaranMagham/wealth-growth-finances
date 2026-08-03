import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError, isAPIError } from "better-auth/api";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: Object.fromEntries((await headers()).entries()),
    });

    return NextResponse.json(
      { success: true, session },
      { status: 200 }
    );
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as APIError;
      return NextResponse.json(
        { success: false, message: apiError.message, session: null },
        { status: Number(apiError.status) || 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error", session: null },
      { status: 500 }
    );
  }
}
