import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/lib/auth";
import { getAnalysisPeriod } from "@/lib/analysis/getAnalysisPeriod";
import { getWealthAssistantContextForPeriod } from "@/lib/wealth-assistant/getWealthAssistantContext";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const period = getAnalysisPeriod(
      searchParams.get("period") ||
        "last-3-months",
      searchParams.get("from"),
      searchParams.get("to")
    );

    const { context } = await getWealthAssistantContextForPeriod(userId, period, searchParams.get("question") || "");

    return NextResponse.json({
      success: true,
      period: {
        key: period.key,
        label: period.label,
        from: period.from,
        to: period.to,
      },
      context,
    });
  } catch (error) {
    console.error(
      "Wealth assistant context error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to prepare financial context.",
      },
      { status: 500 }
    );
  }
}