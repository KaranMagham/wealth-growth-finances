import { NextRequest, NextResponse } from "next/server";
import { APIError, isAPIError } from "better-auth/api";

import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: unknown;
      newPassword?: unknown;
    };

    const token = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    await auth.api.resetPassword({
      body: { token, newPassword },
      headers: Object.fromEntries(request.headers.entries()),
    });

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as APIError;
      return NextResponse.json(
        { success: false, message: apiError.message },
        { status: Number(apiError.status) || 400 }
      );
    }

    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset password." },
      { status: 500 }
    );
  }
}