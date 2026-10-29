import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/constants/transaction";
import { getAuthenticatedUserId } from "@/lib/auth-user";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

type ScannedTransaction = {
  type: "Income" | "Expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

function isModelUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const providerError = error as { status?: number; message?: string };
  return providerError.status === 404 || providerError.message?.includes("is no longer available") === true;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function parseModelResponse(text: string): ScannedTransaction | null {
  const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(jsonText) as Partial<ScannedTransaction>;
  const type = parsed.type === "Income" || parsed.type === "Expense" ? parsed.type : null;
  const categories = type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (
    !type ||
    typeof parsed.amount !== "number" ||
    !Number.isFinite(parsed.amount) ||
    parsed.amount <= 0 ||
    typeof parsed.category !== "string" ||
    !categories.includes(parsed.category as never) ||
    typeof parsed.description !== "string" ||
    typeof parsed.paymentMethod !== "string" ||
    !PAYMENT_METHODS.includes(parsed.paymentMethod as never) ||
    !isValidDate(parsed.date)
  ) {
    return null;
  }

  return {
    type,
    amount: Math.round(parsed.amount * 100) / 100,
    category: parsed.category,
    description: parsed.description.trim(),
    paymentMethod: parsed.paymentMethod,
    date: parsed.date,
  };
}

export async function POST(request: Request) {
  try {
    if (!(await getAuthenticatedUserId())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Receipt scanning is not configured" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("receipt");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Please upload a receipt image" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, message: "Upload a JPEG, PNG, WEBP, HEIC, or HEIF image" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "Receipt images must be 8 MB or smaller" }, { status: 400 });
    }

    const imageData = Buffer.from(await file.arrayBuffer()).toString("base64");
    const client = new GoogleGenAI({ apiKey });
    const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: imageData,
              },
            },
            {
              text: `Extract a single financial transaction from this image. Return only valid JSON with exactly these fields:
{"type":"Expense","amount":0,"category":"Other","description":"","paymentMethod":"Other","date":"YYYY-MM-DD"}

Use type "Expense" for receipts, bills, purchases, and payments. Use "Income" only for clear income evidence such as a payslip, salary credit, refund, or payment received.
Allowed expense categories: ${EXPENSE_CATEGORIES.join(", ")}.
Allowed income categories: ${INCOME_CATEGORIES.join(", ")}.
Allowed payment methods: ${PAYMENT_METHODS.join(", ")}.
Use the final total paid or credited, not a subtotal or tax-only amount. Use today's date only when no date is visible. If the image is not a financial document or the amount cannot be read, return {"error":"unreadable"}.`,
            },
          ],
        },
      ];
    const config = { responseMimeType: "application/json" as const };
    const configuredModel = process.env.GEMINI_SCANNER_MODEL || "gemini-3.8-flash";
    let response;

    try {
      response = await client.models.generateContent({
        model: configuredModel,
        contents,
        config,
      });
    } catch (error) {
      if (!isModelUnavailable(error) || configuredModel === "gemini-2.0-flash") {
        throw error;
      }

      console.warn("Receipt scanner model unavailable; trying fallback", {
        configuredModel,
        fallbackModel: "gemini-2.0-flash",
      });
      response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config,
      });
    }

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json({ success: false, message: "The receipt could not be read" }, { status: 422 });
    }

    let transaction: ScannedTransaction | null = null;
    try {
      transaction = parseModelResponse(text);
    } catch {
      transaction = null;
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "The receipt could not be read clearly. Try a sharper image." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 });
  } catch (error) {
    console.error("Scan receipt error:", error);
    return NextResponse.json(
      { success: false, message: "Receipt scanning is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
