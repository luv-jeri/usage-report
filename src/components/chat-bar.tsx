"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderTrail } from "@/components/ui/border-trail";
import {
  ChevronDown, Send, Sparkles, Loader2, Bot, User, Trash2,
  TrendingUp, GitPullRequest, DollarSign,
} from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
  id: string;
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, text: "Highest token usage day?" },
  { icon: GitPullRequest, text: "How many PRs merged?" },
  { icon: DollarSign, text: "Total cost incurred?" },
];

let msgId = 0;
function nextId() {
  return `msg-${++msgId}`;
}

export function ChatBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setIsExpanded(true);
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
          history: messages
            .filter((m) => !m.content.startsWith("Error:") && m.content.trim())
            .map((m) => ({ role: m.role, content: m.content })),
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
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    if (isLoading && abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <motion.div
        ref={barRef}
        className="max-w-[700px] mx-auto pointer-events-auto"
        layout
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          layout
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Border Trail animation */}
          <BorderTrail
            className="bg-gradient-to-l from-[#a855f7] via-[#c084fc] to-[#a855f7]"
            size={isExpanded ? 200 : 120}
            transition={{
              repeat: Infinity,
              duration: isExpanded ? 6 : 4,
              ease: "linear",
            }}
          />

          <Card
            className={`relative border-0 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden rounded-2xl transition-colors duration-500 ${
              isExpanded
                ? "bg-card/95"
                : "bg-[#a855f7]/10"
            }`}
          >
            {/* ── Expanded: Messages panel ── */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="border-b border-border/30 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[#a855f7]/12 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-[#a855f7]" />
                      </div>
                      <span className="text-xs font-semibold text-foreground/80 tracking-wide">
                        Report Assistant
                      </span>
                      <Badge variant="secondary" className="text-[8px] px-1.5 py-0 font-medium">
                        AI
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {messages.length > 0 && (
                        <button
                          onClick={handleClear}
                          className="p-1.5 rounded-md hover:bg-muted/80 transition-colors group/clear"
                          title="Clear chat"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground group-hover/clear:text-destructive transition-colors" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1.5 rounded-md hover:bg-muted/80 transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="max-h-[50vh] overflow-y-auto px-4 py-3 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center py-4 gap-3">
                        <p className="text-xs text-muted-foreground">Try asking:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {SUGGESTED_QUESTIONS.map((q) => (
                            <button
                              key={q.text}
                              onClick={() => sendMessage(q.text)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-muted/20 hover:bg-[#a855f7]/10 hover:border-[#a855f7]/25 transition-all duration-200 text-left group/q"
                            >
                              <q.icon className="h-3 w-3 text-muted-foreground group-hover/q:text-[#a855f7] transition-colors shrink-0" />
                              <span className="text-[11px] text-muted-foreground group-hover/q:text-foreground/80 transition-colors whitespace-nowrap">
                                {q.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={`flex gap-2 ${
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-1 ${
                              msg.role === "user"
                                ? "bg-[#a855f7]/12"
                                : "bg-muted/60"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <User className="h-2.5 w-2.5 text-[#a855f7]" />
                            ) : (
                              <Bot className="h-2.5 w-2.5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Bubble */}
                          <div
                            className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-[#a855f7]/10 text-foreground border border-[#a855f7]/12 rounded-tr-sm whitespace-pre-wrap"
                                : "bg-muted/30 text-foreground/90 border border-border/15 rounded-tl-sm"
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
                              <span className="flex items-center gap-1.5 text-muted-foreground py-0.5">
                                <span className="flex gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input bar — always visible at bottom center ── */}
            <div className="flex items-end gap-2.5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-[#a855f7] shrink-0 mb-2 opacity-70" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (messages.length > 0) setIsExpanded(true);
                }}
                placeholder="Ask about this report..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[34px] max-h-[100px] py-1.5"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 mb-0.5"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-white" />
                )}
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
