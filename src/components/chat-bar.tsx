"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

export function ChatBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsExpanded(true);

    // Add placeholder for AI response
    const aiMessage: Message = { role: "model", content: "" };
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
            role: "model",
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
                  role: "model",
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
          role: "model",
          content: "Error: Connection failed. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-[1400px] mx-auto pointer-events-auto">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Expanded: Message area */}
          {isExpanded && (
            <div className="border-b border-border/40">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#a855f7]" />
                  <span className="text-sm font-medium text-foreground/90">
                    Report Assistant
                  </span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    AI
                  </Badge>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Messages */}
              <div className="max-h-[55vh] overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask anything about the report — usage, costs, commits, PRs, or claims.
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#a855f7]/15 text-foreground border border-[#a855f7]/20 whitespace-pre-wrap"
                          : "bg-muted/50 text-foreground/90 border border-border/30"
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
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input bar (always visible) */}
          <div className="flex items-end gap-2 px-4 py-3">
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
              >
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <Sparkles className="h-4 w-4 text-[#a855f7] shrink-0 mb-2.5" />
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
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[120px] py-2"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
