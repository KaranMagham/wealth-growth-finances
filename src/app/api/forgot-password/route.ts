// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError, isAPIError } from "better-auth/api";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BETTER_AUTH_URL || new URL(req.url).origin;

    await auth.api.requestPasswordReset({
      body: {
        email: normalizedEmail,
        redirectTo: `${baseUrl}/reset-password`,
      },
      headers: Object.fromEntries((await headers()).entries()),
    });

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists for this email, we have sent password reset instructions.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as APIError;
      return NextResponse.json(
        { success: false, message: apiError.message },
        { status: Number(apiError.status) || 400 }
      );
    }

    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}