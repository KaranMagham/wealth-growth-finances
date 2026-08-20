import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getAnalysisPeriod,
  AnalysisPeriodError,
} from "@/lib/analysis/getAnalysisPeriod";
import { getAnalysisData } from "@/lib/analysis/getAnalysisData";

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

    const { searchParams } = new URL(request.url);

    const period = getAnalysisPeriod(
      searchParams.get("period"),
      searchParams.get("from"),
      searchParams.get("to")
    );

    const analysis = await getAnalysisData(
      userId,
      period
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis API error:", error);

    if (error instanceof AnalysisPeriodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate financial analysis.",
      },
      { status: 500 }
    );
  }
}