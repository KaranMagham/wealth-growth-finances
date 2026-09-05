"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, History, Loader2, Plus, Send, X } from "lucide-react";

import { useSession } from "../../hooks/useSession";

interface AssistantResponse {
    success: boolean;
    answer?: string;
    message?: string;
    aiGenerated?: boolean;
    webSearchUsed?: boolean;
    conversationId?: string;
}

type AssistantMessage = {
    _id?: string;
    role: "user" | "assistant";
    content: string;
};

const conversationStorageKey = "wealth-growth-assistant-conversation";
type ConfirmationAction = "close" | "new";
type SavedConversation = {
    _id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
};

export default function FloatingWealthAssistant() {
    const router = useRouter();
    const { status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [error, setError] = useState("");
    const [loginMessage, setLoginMessage] = useState("");
    const [aiGenerated, setAiGenerated] = useState(false);
    const [webSearchUsed, setWebSearchUsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const latestMessageRef = useRef<HTMLDivElement>(null);

    async function loadConversation(force = false) {
        if (isLoading && !force) return;
        setIsLoading(true);
        setError("");
        try {
            const savedId = window.localStorage.getItem(conversationStorageKey);
            const response = await fetch(
                savedId
                    ? `/api/wealth-assistant/conversation?conversationId=${encodeURIComponent(savedId)}`
                    : "/api/wealth-assistant/conversation",
                {
                    method: savedId ? "GET" : "POST",
                    headers: { Accept: "application/json" },
                credentials: "include",
                cache: "no-store",
                }
            );
            const data = (await response.json()) as {
                success: boolean;
                conversation?: { _id: string } | null;
                messages?: AssistantMessage[];
                message?: string;
            };
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load conversation history.");
            }
            const nextConversationId = data.conversation?._id || null;
            setConversationId(nextConversationId);
            setMessages(data.messages || []);
            if (nextConversationId) {
                window.localStorage.setItem(conversationStorageKey, nextConversationId);
            } else {
                window.localStorage.removeItem(conversationStorageKey);
            }
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load conversation history.");
        } finally {
            setIsLoading(false);
        }
    }

    function clearActiveConversation() {
        setMessages([]);
        setConversationId(null);
        setAiGenerated(false);
        setWebSearchUsed(false);
        window.localStorage.removeItem(conversationStorageKey);
    }

    async function loadHistory() {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("/api/wealth-assistant/conversations", { credentials: "include", cache: "no-store" });
            const data = (await response.json()) as { success: boolean; conversations?: SavedConversation[]; message?: string };
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to load saved conversations.");
            setSavedConversations(data.conversations || []);
            setHistoryOpen(true);
        } catch (historyError) {
            setError(historyError instanceof Error ? historyError.message : "Unable to load saved conversations.");
        } finally {
            setIsLoading(false);
        }
    }

    async function openSavedConversation(id: string) {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/wealth-assistant/conversation?conversationId=${encodeURIComponent(id)}`, { credentials: "include", cache: "no-store" });
            const data = (await response.json()) as { success: boolean; conversation?: { _id: string } | null; messages?: AssistantMessage[]; message?: string };
            if (!response.ok || !data.success || !data.conversation) throw new Error(data.message || "Unable to open conversation.");
            setConversationId(data.conversation._id);
            setMessages(data.messages || []);
            setHistoryOpen(false);
            window.localStorage.removeItem(conversationStorageKey);
        } catch (conversationError) {
            setError(conversationError instanceof Error ? conversationError.message : "Unable to open conversation.");
        } finally {
            setIsLoading(false);
        }
    }

    async function completeConfirmation(save: boolean) {
        if (!conversationId || !confirmationAction) return;
        setIsLoading(true);
        setError("");
        try {
            const endpoint = save
                ? `/api/wealth-assistant/conversation/${conversationId}/save`
                : `/api/wealth-assistant/conversation/${conversationId}`;
            const response = await fetch(endpoint, {
                method: save ? "POST" : "DELETE",
                credentials: "include",
                cache: "no-store",
            });
            const data = (await response.json()) as { success: boolean; message?: string };
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to update conversation.");
            clearActiveConversation();
            setConfirmationAction(null);
            if (confirmationAction === "close") {
                setIsOpen(false);
            } else {
                await loadConversation(true);
            }
        } catch (confirmationError) {
            setError(confirmationError instanceof Error ? confirmationError.message : "Unable to update conversation.");
        } finally {
            setIsLoading(false);
        }
    }

    function requestNewChat() {
        if (isLoading) return;
        if (messages.length > 0) {
            setConfirmationAction("new");
            return;
        }
        clearActiveConversation();
        void loadConversation();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion || isLoading) return;
        try {
            setIsLoading(true);
            setError("");
            setAiGenerated(false);
            setWebSearchUsed(false);
            const response = await fetch("/api/wealth-assistant/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({
                    question: trimmedQuestion,
                    ...(conversationId ? { conversationId } : {}),
                }),
            });
            const data = (await response.json()) as AssistantResponse;
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to process your question.");
            }
            if (data.answer) {
                setMessages((current) => [
                    ...current,
                    { role: "user", content: trimmedQuestion },
                    { role: "assistant", content: data.answer as string },
                ]);
            }
            if (data.conversationId) {
                setConversationId(data.conversationId);
                window.localStorage.setItem(conversationStorageKey, data.conversationId);
            }
            setAiGenerated(Boolean(data.aiGenerated));
            setWebSearchUsed(Boolean(data.webSearchUsed));
            setQuestion("");
        } catch (submitError) {
            console.error("Wealth assistant error:", submitError);
            if (submitError instanceof Error && submitError.message === "Unauthorized") {
                setError("Your session has expired. Please log in again.");
                window.setTimeout(() => router.push("/login"), 700);
            } else {
                setError(submitError instanceof Error ? submitError.message : "Unable to process your question.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isOpen || messages.length === 0) return;

        latestMessageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [isOpen, messages.length]);

    function handleAssistantClick() {
        if (status === "loading") return;
        if (status !== "authenticated") {
            setLoginMessage("Please log in to use Wealth Assistant.");
            window.setTimeout(() => {
                setLoginMessage("");
                router.push("/login");
            }, 1500);
            return;
        }
        setLoginMessage("");
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (nextOpen) void loadConversation();
    }

    return (
        <>
            {isOpen && (
                <section aria-label="Wealth Assistant" className="fixed bottom-24 right-4 z-50 flex max-h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#334155] bg-[#0F172A] shadow-2xl">
                    <header className="flex shrink-0 items-center justify-between border-b border-[#334155] px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-[#34D399]" />
                            <div>
                                <h2 className="text-sm font-semibold text-white">Wealth Assistant</h2>
                                <p className="text-xs text-[#94A3B8]">Read-only financial guidance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={requestNewChat} aria-label="Start a new chat" className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white"><Plus className="h-4 w-4" /></button>
                            <button type="button" onClick={() => void loadHistory()} aria-label="Open saved conversation history" className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white"><History className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setConfirmationAction("close")} disabled={isLoading} className="rounded-lg px-2 py-1.5 text-xs text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white disabled:opacity-50">Close Chat</button>
                            <button type="button" onClick={() => setIsOpen(false)} aria-label="Minimize Wealth Assistant" className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white"><X className="h-4 w-4" /></button>
                        </div>
                    </header>
                    {historyOpen && (
                        <div className="absolute inset-x-0 top-[61px] z-10 max-h-72 overflow-y-auto border-b border-[#334155] bg-[#0F172A] p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Saved conversations</h3>
                                <button type="button" onClick={() => setHistoryOpen(false)} className="text-xs text-[#64748B] hover:text-white">Close</button>
                            </div>
                            {savedConversations.length === 0 && <p className="text-sm text-[#64748B]">No saved conversations yet.</p>}
                            <div className="space-y-2">
                                {savedConversations.map((conversation) => (
                                    <button key={conversation._id} type="button" onClick={() => void openSavedConversation(conversation._id)} className="w-full rounded-lg border border-[#334155] px-3 py-2 text-left hover:border-[#34D399]">
                                        <p className="text-sm text-[#E2E8F0]">{conversation.title}</p>
                                        <p className="mt-1 text-xs text-[#64748B]">{conversation.messageCount} messages · {new Date(conversation.updatedAt).toLocaleDateString("en-IN")}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {isLoading && messages.length === 0 && <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><Loader2 className="h-4 w-4 animate-spin text-[#34D399]" />Reviewing your financial data...</div>}
                        {messages.length === 0 && !error && !isLoading && (
                            <div className="space-y-3">
                                <p className="text-sm leading-6 text-[#CBD5E1]">Ask about affordability, spending, savings, goals, or investments.</p>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">Try asking</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["Can I afford a ₹2 lakh bike?", "Where am I spending too much?", "Am I on track for my goals?"].map((suggestion) => <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="rounded-full border border-[#334155] px-3 py-1.5 text-left text-xs text-[#CBD5E1] transition hover:border-[#34D399] hover:text-white">{suggestion}</button>)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {messages.length > 0 && !isLoading && <div className="space-y-4">
                            {messages.map((message, index) => <div ref={index === messages.length - 1 ? latestMessageRef : undefined} key={message._id || `${message.role}-${index}`} className={message.role === "user" ? "ml-8" : "mr-4"}>
                                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#64748B]">{message.role === "user" ? "You" : "Wealth Assistant"}</p>
                                <p className={`whitespace-pre-line rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-[#10B981]/15 text-[#D1FAE5]" : "bg-[#1E293B] text-[#E2E8F0]"}`}>{message.content}</p>
                            </div>)}
                            <div className="border-t border-[#334155] pt-3">
                                <p className="text-xs text-[#64748B]">{aiGenerated ? "Includes an AI-generated suggestion." : "Based on your recorded financial data."}</p>
                                {webSearchUsed && <p className="mt-1 text-xs text-[#64748B]">Current web information was used for part of this response.</p>}
                            </div>
                        </div>}
                        {error && <div className="rounded-xl border border-[#7F1D1D] bg-[#450A0A]/40 p-3"><p className="text-sm leading-6 text-[#FB7185]">{error}</p></div>}
                    </div>
                    <form onSubmit={handleSubmit} className="shrink-0 border-t border-[#334155] p-3">
                        <div className="flex items-end gap-2">
                            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Ask a financial question..." rows={2} maxLength={500} disabled={isLoading} className="min-h-10 flex-1 resize-none rounded-xl border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-white outline-none placeholder:text-[#64748B] focus:border-[#34D399] disabled:opacity-60" />
                            <button type="submit" disabled={isLoading || !question.trim()} aria-label="Send question" className="rounded-xl bg-[#10B981] p-3 text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-[#64748B]">Wealth Assistant is read-only. It does not create transactions or modify your financial data.</p>
                    </form>
                    {confirmationAction && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/80 p-5">
                            <div role="dialog" aria-modal="true" className="w-full rounded-xl border border-[#334155] bg-[#0F172A] p-4 shadow-2xl">
                                <h3 className="text-sm font-semibold text-white">{confirmationAction === "close" ? "Do you want to save this conversation?" : "Do you want to save this conversation before starting a new one?"}</h3>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button type="button" onClick={() => setConfirmationAction(null)} className="rounded-lg px-3 py-2 text-xs text-[#CBD5E1] hover:bg-[#1E293B]">{confirmationAction === "close" ? "Cancel" : "Cancel"}</button>
                                    <button type="button" onClick={() => void completeConfirmation(false)} className="rounded-lg border border-[#7F1D1D] px-3 py-2 text-xs text-[#FDA4AF] hover:bg-[#450A0A]">{confirmationAction === "close" ? "Don't Save" : "Discard"}</button>
                                    <button type="button" onClick={() => void completeConfirmation(true)} className="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-medium text-white hover:bg-[#059669]">{confirmationAction === "close" ? "Save Chat" : "Save"}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}
            {loginMessage && <div className="fixed bottom-24 right-4 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] shadow-xl">{loginMessage}</div>}
            <button type="button" onClick={handleAssistantClick} disabled={status === "loading"} aria-label={status === "authenticated" ? isOpen ? "Close Wealth Assistant" : "Open Wealth Assistant" : "Log in to use Wealth Assistant"} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xl transition hover:scale-105 hover:bg-[#059669] disabled:cursor-wait disabled:opacity-70">{isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}</button>
        </>
    );
}
