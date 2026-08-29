"use client";

import {
    FormEvent,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    Bot,
    Loader2,
    Send,
    X,
} from "lucide-react";

import { useSession } from "../../hooks/useSession";

interface AssistantResponse {
    success: boolean;
    answer?: string;
    message?: string;
    intent?: string;
    aiGenerated?: boolean;
    webSearchUsed?: boolean;
    calculation?: {
        status: string;
        requestedPrice: number;
        cashAfterPurchase: number;
        monthsOfExpensesAfterPurchase:
        | number
        | null;
        monthsToRebuildPurchaseAmount:
        | number
        | null;
        recommendedMinimumCashBuffer: number;
        reasons: string[];
        assumptions: string[];
    };
}

export default function FloatingWealthAssistant() {
    const router = useRouter();
    const { status } = useSession();

    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const [loginMessage, setLoginMessage] =
        useState("");
    const [aiGenerated, setAiGenerated] =
        useState(false);
    const [webSearchUsed, setWebSearchUsed] =
        useState(false);
    const [isLoading, setIsLoading] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setAnswer("");
            setAiGenerated(false);
            setWebSearchUsed(false);

            const response = await fetch(
                "/api/wealth-assistant/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                    body: JSON.stringify({
                        question: trimmedQuestion,
                    }),
                }
            );

            const data =
                (await response.json()) as AssistantResponse;

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to process your question."
                );
            }

            setAnswer(
                data.answer ||
                "I could not generate an answer."
            );

            setAiGenerated(Boolean(data.aiGenerated));
            setWebSearchUsed(
                Boolean(data.webSearchUsed)
            );

            setQuestion("");
        } catch (error) {
            console.error(
                "Wealth assistant error:",
                error
            );

            if (
                error instanceof Error &&
                error.message === "Unauthorized"
            ) {
                setError(
                    "Your session has expired. Please log in again."
                );

                window.setTimeout(() => {
                    router.push("/login");
                }, 700);

                return;
            }

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to process your question."
            );
        } finally {
        setIsLoading(false);
    }
}

function handleAssistantClick() {
    if (status === "loading") {
        return;
    }

    if (status !== "authenticated") {
        setLoginMessage(
            "Please log in to use Wealth Assistant."
        );

        window.setTimeout(() => {
            setLoginMessage("");
            router.push("/login");
        }, 1500);

        return;
    }

    setLoginMessage("");
    setIsOpen((current) => !current);
}

function handleClose() {
    setIsOpen(false);
}

return (
    <>
        {isOpen && (
            <section
                aria-label="Wealth Assistant"
                className="fixed bottom-24 right-4 z-50 flex max-h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#334155] bg-[#0F172A] shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-[#334155] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-[#34D399]" />

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Wealth Assistant
                            </h2>

                            <p className="text-xs text-[#94A3B8]">
                                Read-only financial guidance
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close Wealth Assistant"
                        className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    {!answer && !error && (
                        <div className="space-y-3">
                            <p className="text-sm leading-6 text-[#CBD5E1]">
                                Ask about affordability, spending,
                                savings, goals, or investments.
                            </p>

                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                                    Try asking
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Can I afford a ₹2 lakh bike?",
                                        "Where am I spending too much?",
                                        "Am I on track for my goals?",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() =>
                                                setQuestion(suggestion)
                                            }
                                            className="rounded-full border border-[#334155] px-3 py-1.5 text-left text-xs text-[#CBD5E1] transition hover:border-[#34D399] hover:text-white"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                            <Loader2 className="h-4 w-4 animate-spin text-[#34D399]" />
                            Reviewing your financial data...
                        </div>
                    )}

                    {answer && !isLoading && (
                        <>
                            <p className="whitespace-pre-line text-sm leading-6 text-[#E2E8F0]">
                                {answer}
                            </p>

                            <div className="mt-4 border-t border-[#334155] pt-3">
                                <p className="text-xs text-[#64748B]">
                                    {aiGenerated
                                        ? "Includes an AI-generated suggestion."
                                        : "Based on your recorded financial data."}
                                </p>

                                {webSearchUsed && (
                                    <p className="mt-1 text-xs text-[#64748B]">
                                        Current web information was used for part of this response.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="rounded-xl border border-[#7F1D1D] bg-[#450A0A]/40 p-3">
                            <p className="text-sm leading-6 text-[#FB7185]">
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="shrink-0 border-t border-[#334155] p-3"
                >
                    <div className="flex items-end gap-2">
                        <textarea
                            value={question}
                            onChange={(event) =>
                                setQuestion(event.target.value)
                            }
                            placeholder="Ask a financial question..."
                            rows={2}
                            maxLength={500}
                            disabled={isLoading}
                            className="min-h-10 flex-1 resize-none rounded-xl border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-white outline-none placeholder:text-[#64748B] focus:border-[#34D399] disabled:opacity-60"
                        />

                        <button
                            type="submit"
                            disabled={
                                isLoading ||
                                !question.trim()
                            }
                            aria-label="Send question"
                            className="rounded-xl bg-[#10B981] p-3 text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <p className="mt-2 text-[11px] leading-4 text-[#64748B]">
                        Wealth Assistant is read-only. It does not
                        create transactions or modify your financial data.
                    </p>
                </form>
            </section>
        )}

        {loginMessage && (
            <div className="fixed bottom-24 right-4 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] shadow-xl">
                {loginMessage}
            </div>
        )}

        <button
            type="button"
            onClick={handleAssistantClick}
            disabled={status === "loading"}
            aria-label={
                status === "authenticated"
                    ? isOpen
                        ? "Close Wealth Assistant"
                        : "Open Wealth Assistant"
                    : "Log in to use Wealth Assistant"
            }
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xl transition hover:scale-105 hover:bg-[#059669] disabled:cursor-wait disabled:opacity-70"
        >
            {isOpen ? (
                <X className="h-6 w-6" />
            ) : (
                <Bot className="h-6 w-6" />
            )}
        </button>
    </>
);
}