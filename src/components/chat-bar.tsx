"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X, Send, Sparkles, Loader2, Bot, User, Trash2,
  MessageSquare, TrendingUp, GitPullRequest, DollarSign,
} from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
  id: string;
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, text: "Highest token usage day?" },
  { icon: GitPullRequest, text: "How many PRs were merged?" },
  { icon: DollarSign, text: "What was the total cost?" },
];

let msgId = 0;
function nextId() {
  return `msg-${++msgId}`;
}

export function ChatBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Click outside to collapse
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed, id: nextId() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const aiMessage: Message = { role: "model", content: "", id: nextId() };
    setMessages([...newMessages, aiMessage]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: `Error: ${err.error || "Something went wrong. Please try again."}`,
          };
          return updated;
        });
        setIsLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "chunk" && event.text) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + event.text,
                };
                return updated;
              });
            } else if (event.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: `Error: ${event.error}`,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Error: Connection failed. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (isLoading && abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  };

  // ── Collapsed: Floating action button ──
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative flex items-center gap-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-[#a855f7]/25 hover:shadow-[#a855f7]/40 transition-all duration-300 hover:scale-105 active:scale-95">
          <MessageSquare className="h-4.5 w-4.5" />
          <span className="text-sm font-medium">Ask AI</span>
          {messages.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white text-[#a855f7] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {messages.filter((m) => m.role === "user").length}
            </span>
          )}
        </div>
      </button>
    );
  }

  // ── Expanded: Chat panel ──
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={panelRef}
        className="pointer-events-auto fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-[560px] animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <Card className="border-border/60 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[70vh] rounded-2xl">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-[#a855f7]/8 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#a855f7]/15 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground/95 leading-none">
                  Report Assistant
                </span>
              </div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                AI
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors group/clear"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/clear:text-destructive transition-colors" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-[#a855f7]/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/70 mb-1">
                    Ask about this report
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usage, costs, commits, PRs, or claims
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[320px]">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q.text}
                      onClick={() => {
                        sendMessage(q.text);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-[#a855f7]/10 hover:border-[#a855f7]/30 transition-all duration-200 text-left group/q"
                    >
                      <q.icon className="h-3.5 w-3.5 text-muted-foreground group-hover/q:text-[#a855f7] transition-colors shrink-0" />
                      <span className="text-xs text-muted-foreground group-hover/q:text-foreground/80 transition-colors">
                        {q.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Avatar */}
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user"
                        ? "bg-[#a855f7]/15"
                        : "bg-muted/80"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-3 w-3 text-[#a855f7]" />
                    ) : (
                      <Bot className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#a855f7]/12 text-foreground border border-[#a855f7]/15 rounded-br-md whitespace-pre-wrap"
                        : "bg-muted/40 text-foreground/90 border border-border/20 rounded-bl-md"
                    }`}
                  >
                    {msg.content ? (
                      msg.role === "user" ? (
                        msg.content
                      ) : (
                        <Markdown
                          components={{
                            h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            code: ({ children }) => <code className="bg-background/60 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            table: ({ children }) => <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse">{children}</table></div>,
                            thead: ({ children }) => <thead className="border-b border-border/50">{children}</thead>,
                            th: ({ children }) => <th className="text-left py-1.5 px-2 font-semibold text-foreground">{children}</th>,
                            td: ({ children }) => <td className="py-1.5 px-2 border-b border-border/20">{children}</td>,
                            hr: () => <hr className="border-border/30 my-2" />,
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      )
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <span className="flex gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className="border-t border-border/30 px-4 py-3">
            <div className="flex items-end gap-2 bg-muted/30 rounded-xl px-3 py-2 border border-border/20 focus-within:border-[#a855f7]/30 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[32px] max-h-[100px] py-1"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-white" />
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
