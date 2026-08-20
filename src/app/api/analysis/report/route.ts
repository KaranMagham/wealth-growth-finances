import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "node:path";
import { existsSync } from "node:fs";

import { auth } from "@/lib/auth";
import {
    AnalysisPeriodError,
    getAnalysisPeriod,
} from "@/lib/analysis/getAnalysisPeriod";
import { getAnalysisData } from "@/lib/analysis/getAnalysisData";
import type { AnalysisResponse } from "@/lib/analysis/analysisTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLORS = {
    navy: "#020617",
    navyLight: "#0F172A",

    slate: "#334155",
    muted: "#1E293B",
    cardLabel: "#CBD5E1",

    text: "#020617",
    white: "#FFFFFF",

    green: "#047857",
    greenLight: "#34D399",

    red: "#B91C1C",
    amber: "#B45309",
};

const APP_LOGO_PATH = path.join(
    process.cwd(),
    "public",
    "logomain.png"
);

function formatCurrency(value: number) {
    return `INR ${Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;
}

function formatPercentage(value: number) {
    return `${Number(value || 0).toFixed(2)}%`;
}

function ensureSpace(
    doc: PDFKit.PDFDocument,
    requiredHeight: number
) {
    const bottomMargin = 55;

    if (
        doc.y + requiredHeight >
        doc.page.height - bottomMargin
    ) {
        doc.addPage();
        doc.y = 50;
    }
}

function addSectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    addTopSpacing = true
) {
    const topSpacing = addTopSpacing ? 24 : 0;
    const requiredHeight = topSpacing + 42;

    ensureSpace(doc, requiredHeight);

    doc.y += topSpacing;

    const y = doc.y;

    doc
        .fillColor(COLORS.green)
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(title, 50, y);

    doc
        .moveTo(50, y + 23)
        .lineTo(doc.page.width - 50, y + 23)
        .strokeColor(COLORS.slate)
        .lineWidth(1)
        .stroke();

    doc.y = y + 35;
}

function addRows(
    doc: PDFKit.PDFDocument,
    rows: Array<{
        label: string;
        value: string;
        valueColor?: string;
    }>
) {
    for (const row of rows) {
        ensureSpace(doc, 28);

        const y = doc.y;

        doc
            .fillColor(COLORS.muted)
            .font("Helvetica")
            .fontSize(10)
            .text(row.label, 50, y, {
                width: 250,
            });

        doc
            .fillColor(row.valueColor || COLORS.text)
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(row.value, 310, y, {
                width: doc.page.width - 360,
                align: "right",
            });

        doc
            .moveTo(50, y + 19)
            .lineTo(doc.page.width - 50, y + 19)
            .strokeColor("#CBD5E1")
            .lineWidth(0.5)
            .stroke();

        doc.y = y + 27;
    }
}

function addMetricCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    valueColor = COLORS.white
) {
    doc
        .roundedRect(x, y, width, height, 10)
        .fillColor(COLORS.navyLight)
        .fill();

    doc
        .roundedRect(x, y, width, height, 10)
        .strokeColor(COLORS.slate)
        .lineWidth(0.8)
        .stroke();

    doc
        .fillColor(COLORS.cardLabel)
        .font("Helvetica")
        .fontSize(9)
        .text(label, x + 14, y + 13, {
            width: width - 28,
        });

    doc
        .fillColor(valueColor)
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(value, x + 14, y + 33, {
            width: width - 28,
        });
}

function addSummaryCards(
    doc: PDFKit.PDFDocument,
    analysis: AnalysisResponse
) {
    ensureSpace(doc, 220);

    const cardGap = 12;
    const left = 50;
    const availableWidth = doc.page.width - 100;
    const cardWidth =
        (availableWidth - cardGap) / 2;
    const cardHeight = 62;
    const startY = doc.y;

    const summaryCards = [
        {
            label: "Income",
            value: formatCurrency(analysis.summary.income),
            color: COLORS.green,
        },
        {
            label: "Expenses",
            value: formatCurrency(analysis.summary.expenses),
            color: COLORS.red,
        },
        {
            label: "Savings",
            value: formatCurrency(analysis.summary.savings),
            color:
                analysis.summary.savings >= 0
                    ? COLORS.green
                    : COLORS.red,
        },
        {
            label: "Savings Rate",
            value: formatPercentage(
                analysis.summary.savingsRate
            ),
            color:
                analysis.summary.savingsRate >= 0
                    ? COLORS.green
                    : COLORS.red,
        },
        {
            label: "Investment Value",
            value: formatCurrency(
                analysis.summary.investmentValue
            ),
            color: COLORS.white,
        },
        {
            label: "Investment Profit / Loss",
            value: `${analysis.summary.investmentProfitLoss >= 0 ? "+" : ""}${formatCurrency(
                analysis.summary.investmentProfitLoss
            )}`,
            color:
                analysis.summary.investmentProfitLoss >= 0
                    ? COLORS.green
                    : COLORS.red,
        },
    ];

    summaryCards.forEach((card, index) => {
        const row = Math.floor(index / 2);
        const column = index % 2;

        addMetricCard(
            doc,
            left + column * (cardWidth + cardGap),
            startY + row * (cardHeight + 10),
            cardWidth,
            cardHeight,
            card.label,
            card.value,
            card.color
        );
    });

    doc.y = startY + 3 * (cardHeight + 10);
}

function buildPdf(
    analysis: AnalysisResponse
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            bufferPages: true,
            info: {
                Title: "Wealth Growth Financial Analysis Report",
                Author: "Wealth Growth",
                Subject: "Personal Financial Analysis",
            },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        const pageWidth = doc.page.width;

        doc
            .rect(0, 0, pageWidth, 105)
            .fillColor(COLORS.navy)
            .fill();

        const logoOuterSize = 56;
        const logoPadding = 4;
        const logoImageSize =
            logoOuterSize - logoPadding * 2;

        const logoX = 50;
        const logoY = 24;

        const logoCenterX = logoX + logoOuterSize / 2;
        const logoCenterY = logoY + logoOuterSize / 2;

        const titleX = logoX + logoOuterSize + 18;

        if (existsSync(APP_LOGO_PATH)) {
            doc
                .circle(
                    logoCenterX,
                    logoCenterY,
                    logoOuterSize / 2
                )
                .fillColor("#1E293B")
                .fill();

            doc
                .circle(
                    logoCenterX,
                    logoCenterY,
                    logoOuterSize / 2 - 1
                )
                .strokeColor("#D4AF37")
                .lineWidth(2)
                .stroke();

            doc.save();

            doc
                .circle(
                    logoCenterX,
                    logoCenterY,
                    logoImageSize / 2
                )
                .clip();

            doc.image(
                APP_LOGO_PATH,
                logoX + logoPadding,
                logoY + logoPadding,
                {
                    fit: [logoImageSize, logoImageSize],
                    align: "center",
                    valign: "center",
                }
            );

            doc.restore();
        }

        doc
            .fillColor(COLORS.greenLight)
            .font("Helvetica-Bold")
            .fontSize(22)
            .text("WEALTH GROWTH", titleX, 33);

        doc
            .fillColor(COLORS.white)
            .font("Helvetica-Bold")
            .fontSize(13)
            .text(
                "Financial Analysis Report",
                titleX,
                61
            );

        doc
            .fillColor(COLORS.text)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(analysis.period.label, 50, 122);

        doc
            .fillColor(COLORS.muted)
            .font("Helvetica")
            .fontSize(9)
            .text(
                `Report period: ${analysis.period.from} to ${analysis.period.to}`,
                50,
                140
            );

        doc.text(
            `Generated: ${new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )}`,
            50,
            156
        );

        doc
            .fillColor(COLORS.muted)
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                "Based on recorded transactions, budgets, goals, and investments available for the selected period.",
                50,
                174,
                {
                    width: doc.page.width - 100,
                }
            );

        doc.y = 208;

        addSectionTitle(
            doc,
            "Financial Summary",
            false
        );
        addSummaryCards(doc, analysis);

        addSectionTitle(doc, "Budget Usage");

        const budgetPercentage =
            analysis.summary.budgetedAmount > 0
                ? (analysis.summary.budgetUsed /
                    analysis.summary.budgetedAmount) *
                100
                : 0;

        addRows(doc, [
            {
                label: "Budgeted Amount",
                value: formatCurrency(
                    analysis.summary.budgetedAmount
                ),
            },
            {
                label: "Budget Used",
                value: formatCurrency(
                    analysis.summary.budgetUsed
                ),
                valueColor:
                    budgetPercentage > 100
                        ? COLORS.red
                        : budgetPercentage >= 80
                            ? COLORS.amber
                            : COLORS.green,
            },
            {
                label: "Budget Usage",
                value: formatPercentage(budgetPercentage),
                valueColor:
                    budgetPercentage > 100
                        ? COLORS.red
                        : budgetPercentage >= 80
                            ? COLORS.amber
                            : COLORS.green,
            },
        ]);

        addSectionTitle(doc, "Expense Breakdown");

        if (analysis.expenseBreakdown.length === 0) {
            addRows(doc, [
                {
                    label: "Expenses",
                    value: "No expense data for this period",
                },
            ]);
        } else {
            addRows(
                doc,
                analysis.expenseBreakdown.map((item) => ({
                    label: item.category,
                    value: `${formatCurrency(
                        item.amount
                    )} (${formatPercentage(item.percentage)})`,
                }))
            );
        }

        addSectionTitle(doc, "Portfolio Performance");

        addRows(doc, [
            {
                label: "Total Invested",
                value: formatCurrency(
                    analysis.summary.totalInvested
                ),
            },
            {
                label: "Current Portfolio Value",
                value: formatCurrency(
                    analysis.summary.investmentValue
                ),
                valueColor: COLORS.green,
            },
            {
                label: "Overall Profit / Loss",
                value: `${analysis.summary.investmentProfitLoss >= 0 ? "+" : ""}${formatCurrency(
                    analysis.summary.investmentProfitLoss
                )}`,
                valueColor:
                    analysis.summary.investmentProfitLoss >= 0
                        ? COLORS.green
                        : COLORS.red,
            },
            {
                label: "Overall Return",
                value: formatPercentage(
                    analysis.summary.investmentReturnPercentage
                ),
                valueColor:
                    analysis.summary.investmentReturnPercentage >= 0
                        ? COLORS.green
                        : COLORS.red,
            },
        ]);

        addSectionTitle(doc, "Investment Distribution");

        if (analysis.investmentDistribution.length === 0) {
            addRows(doc, [
                {
                    label: "Investments",
                    value: "No investment data available",
                },
            ]);
        } else {
            addRows(
                doc,
                analysis.investmentDistribution.map((item) => ({
                    label: item.type,
                    value: `${formatCurrency(
                        item.amount
                    )} (${formatPercentage(item.percentage)})`,
                    valueColor:
                        item.profitLoss >= 0
                            ? COLORS.green
                            : COLORS.red,
                }))
            );
        }

        addSectionTitle(doc, "Goals Overview");

        addRows(doc, [
            {
                label: "Total Goals",
                value: String(analysis.goals.totalGoals),
            },
            {
                label: "Completed Goals",
                value: String(analysis.goals.completedGoals),
                valueColor: COLORS.green,
            },
            {
                label: "Target Amount",
                value: formatCurrency(
                    analysis.goals.targetAmount
                ),
            },
            {
                label: "Saved Amount",
                value: formatCurrency(
                    analysis.goals.savedAmount
                ),
            },
            {
                label: "Overall Progress",
                value: formatPercentage(
                    analysis.goals.overallProgress
                ),
                valueColor: COLORS.green,
            },
        ]);

        const pageRange = doc.bufferedPageRange();

        for (
            let pageIndex = 0;
            pageIndex < pageRange.count;
            pageIndex++
        ) {
            doc.switchToPage(pageIndex);

            const footerY =
                doc.page.height -
                doc.page.margins.bottom -
                16;

            doc
                .moveTo(50, footerY - 8)
                .lineTo(doc.page.width - 50, footerY - 8)
                .strokeColor(COLORS.slate)
                .lineWidth(0.5)
                .stroke();

            doc
                .fillColor(COLORS.muted)
                .font("Helvetica")
                .fontSize(8)
                .text(
                    "Wealth Growth • Generated from your recorded financial data",
                    50,
                    footerY,
                    {
                        width: 330,
                        lineBreak: false,
                    }
                );

            doc.text(
                `Page ${pageIndex + 1} of ${pageRange.count}`,
                doc.page.width - 140,
                footerY,
                {
                    width: 90,
                    align: "right",
                    lineBreak: false,
                }
            );
        }

        doc.end();
    });
}

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

        const pdfBuffer = await buildPdf(analysis);

        const fileName = [
            "wealth-growth-analysis",
            analysis.period.from,
            "to",
            analysis.period.to,
        ].join("-");

        return new NextResponse(
            new Uint8Array(pdfBuffer),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Analysis PDF error:", error);

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
                message: "Unable to generate financial report.",
            },
            { status: 500 }
        );
    }
}