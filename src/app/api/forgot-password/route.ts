// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError, isAPIError } from "better-auth/api";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

  try {
    // Placeholder – replace with real Better Auth reset endpoint
    // await auth.api.requestPasswordReset({ body: { email } });

    return NextResponse.json(
      {
        success: true,
        message: "If that email exists, we will send a reset link.",
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

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}