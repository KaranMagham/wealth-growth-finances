import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError, isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const requestHeaders = await headers();
    const { headers: setHeaders, response } = await auth.api.signInSocial({
      returnHeaders: true,
      body: {
        provider: "github",
        callbackURL: "/dashboard",
      },
      headers: Object.fromEntries(requestHeaders.entries()),
    });

    const responsePayload = response as {
      url?: string;
      redirect?: boolean;
    };

    const responseJson = NextResponse.json(
      {
        success: true,
        message: "GitHub login initiated",
        url: responsePayload?.url,
        redirect: responsePayload?.redirect,
      },
      { status: 200 }
    );

    const cookies = setHeaders.getSetCookie();
    cookies.forEach((cookie) => {
      responseJson.headers.append("Set-Cookie", cookie);
    });

    return responseJson;
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
