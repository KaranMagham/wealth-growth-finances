import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError, isAPIError } from "better-auth/api";

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password, image } = await req.json();

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const { headers: setHeaders } = await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        email,
        password,
        name: fullname,
      },
      headers: Object.fromEntries((await headers()).entries()),
    });

    const res = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
      },
      { status: 201 }
    );

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

    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}