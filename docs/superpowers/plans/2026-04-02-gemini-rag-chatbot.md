# Gemini RAG Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a streaming AI chatbot powered by Gemini File Search (RAG) to the usage-report app so leadership can ask questions about the data.

**Architecture:** A one-time setup script uploads report data to a Gemini File Search Store. A Next.js API route streams Gemini responses grounded in that data. A floating chat bar UI handles the conversation.

**Tech Stack:** Next.js 16, React 19, TypeScript, @google/genai SDK, Tailwind CSS v4, shadcn UI v4

**Spec:** `docs/superpowers/specs/2026-04-02-gemini-rag-chatbot-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/setup-rag.ts` | Create | One-time script: create File Search Store, upload data files |
| `public/data/report-context.md` | Create | Narrative context extracted from the report for RAG |
| `src/app/api/chat/route.ts` | Create | POST endpoint: streaming Gemini responses with File Search |
| `src/components/chat-bar.tsx` | Create | Client component: floating expandable chat bar |
| `src/app/layout.tsx` | Modify | Add ChatBar component |
| `.env.local` | Create | GEMINI_API_KEY and GEMINI_FILE_SEARCH_STORE |
| `package.json` | Modify | Add @google/genai dependency |

---

### Task 1: Install dependency and configure environment

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Modify: `.gitignore` (ensure `.env.local` is ignored)

- [ ] **Step 1: Install @google/genai**

```bash
cd /Users/sanjaykumar/Documents/u-p0/usage-report
npm install @google/genai
```

Expected: Package added to `dependencies` in `package.json`.

- [ ] **Step 2: Create `.env.local`**

Create `/Users/sanjaykumar/Documents/u-p0/usage-report/.env.local`:

```
GEMINI_API_KEY=<your-api-key-here>
GEMINI_FILE_SEARCH_STORE=
```

The `GEMINI_FILE_SEARCH_STORE` value will be filled by the setup script in Task 3.

- [ ] **Step 3: Verify `.gitignore` excludes `.env.local`**

Check `/Users/sanjaykumar/Documents/u-p0/usage-report/.gitignore` — if `.env.local` or `.env*.local` is already listed (Next.js default), no action needed. If missing, add:

```
.env.local
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add @google/genai dependency"
```

---

### Task 2: Create report context file

**Files:**
- Create: `public/data/report-context.md`

This file gives the AI context about what the report says — not just raw data, but the narrative claims and section structure.

- [ ] **Step 1: Create `public/data/report-context.md`**

```markdown
# Cursor Usage & Work Activity Report — Context Document

## About This Report
- **Author:** Sanjay Kumar (sanjay.kumar@evolphin.com)
- **Period:** Last 30 days
- **Purpose:** Transparent breakdown of Cursor AI usage correlated with actual work output
- **Audience:** Management / leadership at Evolphin Software
- **Classification:** Confidential Report

## Report Sections

### Hero / Overview
The report provides a transparent breakdown of Cursor usage, correlated with actual work output over the last 30 days. It includes the requested billing details for the highest token consumption day, along with additional context about contributions and working patterns.

### Key Metrics (Stat Cards)
- Total Cursor requests (split by free vs paid/on-demand)
- Total tokens consumed
- Total cost incurred
- Number of commits (split by company vs personal repos)
- Number of pull requests (total, company, merged)
- Number of repositories contributed to

### Daily Token Usage Chart
Shows tokens consumed per day over the 30-day period. Identifies peak usage days.

### Hourly Activity Chart
Shows when Cursor requests and commits happen by hour of day (IST timezone). Demonstrates working patterns — company work during business hours, personal projects in off-hours.

### Model Usage Breakdown
Which AI models were used (e.g., Claude, GPT-4) and how many tokens each consumed.

### Repository Breakdown
Commits and PRs per repository, categorized as Company (Evolphin-Software org) or Personal.

### Company Contributions
Detailed contributor stats for Evolphin-Software repos showing Sanjay's commits, additions, deletions relative to other contributors.

### Peak Day Deep Dive
The highest token usage day is analyzed in detail: what models were used, what commits were made, what features were delivered. This addresses the billing concern by showing the work output that justified the token usage.

### PR List
All pull requests with status (merged, open, closed), repository, and dates.

## Data Files
- **cursor-usage.csv**: Each row is a Cursor AI request with: date, user, kind (Free/On-Demand), model, maxMode, input tokens (with/without cache), cache read tokens, output tokens, total tokens, cost
- **commits.csv**: Each row is a git commit with: date, time (IST), repo, repoType (Company/Personal), SHA, commit message
- **prs.json**: Array of pull requests with: title, repository.nameWithOwner, state (MERGED/OPEN/CLOSED), createdAt, closedAt, url
- **company-contributions.json**: Contributor stats per Evolphin-Software repo including commits, additions, deletions per contributor
- **summary.json**: Aggregated counts — total commits by repo with type

## Key Claims in the Report
1. Cursor usage is transparent and justified by work output
2. The highest token usage day correlates with significant feature delivery
3. Company work happens during business hours; personal projects are off-hours
4. Free-tier requests make up a significant portion of usage (cost-efficient)
5. Work output (commits, PRs) demonstrates productive use of AI tooling
```

- [ ] **Step 2: Commit**

```bash
git add public/data/report-context.md
git commit -m "docs: add report context file for RAG ingestion"
```

---

### Task 3: Create the RAG setup script

**Files:**
- Create: `scripts/setup-rag.ts`

- [ ] **Step 1: Create `scripts/setup-rag.ts`**

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is required.");
  console.error("Set it in .env.local or export it before running this script.");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");
const ENV_PATH = path.join(process.cwd(), ".env.local");
const DATA_DIR = path.join(process.cwd(), "public", "data");

const FILES_TO_UPLOAD = [
  { path: "cursor-usage.csv", displayName: "cursor-usage", metadata: [{ key: "type", stringValue: "cursor-usage" }] },
  { path: "commits.csv", displayName: "commits", metadata: [{ key: "type", stringValue: "commits" }] },
  { path: "prs.json", displayName: "pull-requests", metadata: [{ key: "type", stringValue: "pull-requests" }] },
  { path: "company-contributions.json", displayName: "company-contributions", metadata: [{ key: "type", stringValue: "contributions" }] },
  { path: "summary.json", displayName: "summary", metadata: [{ key: "type", stringValue: "summary" }] },
  { path: "report-context.md", displayName: "report-context", metadata: [{ key: "type", stringValue: "report-narrative" }] },
];

async function waitForOperation(ai: GoogleGenAI, operation: any): Promise<void> {
  while (!operation.done) {
    console.log("  Waiting for processing...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    operation = await ai.operations.get({ operation });
  }
}

async function main() {
  // Check if store already exists
  const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const existingStore = envContent.match(/GEMINI_FILE_SEARCH_STORE=(.+)/)?.[1]?.trim();

  if (existingStore && !FORCE) {
    console.log(`File Search Store already configured: ${existingStore}`);
    console.log("Run with --force to recreate.");
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Create File Search Store
  console.log("Creating File Search Store...");
  const store = await ai.fileSearchStores.create({
    config: { displayName: "usage-report-rag" },
  });
  const storeName = store.name!;
  console.log(`Store created: ${storeName}`);

  // Upload each file
  for (const fileInfo of FILES_TO_UPLOAD) {
    const filePath = path.join(DATA_DIR, fileInfo.path);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} not found, skipping.`);
      continue;
    }
    console.log(`Uploading ${fileInfo.path}...`);

    // Upload to Files API first, then import into store
    const uploaded = await ai.files.upload({
      file: filePath,
      config: { displayName: fileInfo.displayName },
    });

    const operation = await ai.fileSearchStores.importFile({
      fileSearchStoreName: storeName,
      fileName: uploaded.name!,
      customMetadata: fileInfo.metadata,
    });

    await waitForOperation(ai, operation);
    console.log(`  Done: ${fileInfo.path}`);
  }

  // Update .env.local
  let newEnv = envContent;
  if (newEnv.includes("GEMINI_FILE_SEARCH_STORE=")) {
    newEnv = newEnv.replace(/GEMINI_FILE_SEARCH_STORE=.*/, `GEMINI_FILE_SEARCH_STORE=${storeName}`);
  } else {
    newEnv += `\nGEMINI_FILE_SEARCH_STORE=${storeName}\n`;
  }
  fs.writeFileSync(ENV_PATH, newEnv);

  console.log("\nSetup complete!");
  console.log(`Store name: ${storeName}`);
  console.log("GEMINI_FILE_SEARCH_STORE written to .env.local");
  console.log("\nYou can now run: npm run dev");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the setup script**

```bash
cd /Users/sanjaykumar/Documents/u-p0/usage-report
npx tsx scripts/setup-rag.ts
```

Expected: Each file uploads successfully. `.env.local` is updated with `GEMINI_FILE_SEARCH_STORE=fileSearchStores/xxxxx`.

- [ ] **Step 3: Verify the store was created**

Check `.env.local` — `GEMINI_FILE_SEARCH_STORE` should now have a value like `fileSearchStores/abc123`.

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-rag.ts
git commit -m "feat: add RAG setup script for Gemini File Search Store"
```

---

### Task 4: Create the chat API route

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create `src/app/api/chat/route.ts`**

```typescript
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI assistant for Sanjay Kumar's Cursor Usage & Work Activity Report.
You help leadership understand the data. Answer professionally and clearly.
Cite specific numbers, dates, and file sources from the data.
If you don't know something or the data doesn't contain the answer, say so honestly.
Do not make up data. Keep answers concise but complete.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE;

  if (!apiKey || !storeName) {
    return Response.json(
      { error: "Server not configured. Run the setup script first." },
      { status: 500 }
    );
  }

  let body: { message: string; history?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build contents from history + new message
  const contents: { role: string; parts: { text: string }[] }[] = [];

  if (body.history) {
    for (const msg of body.history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: body.message }],
  });

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [storeName],
            },
          },
        ],
      },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`)
              );
            }
          }

          // Send done event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return Response.json(
      { error: "AI service unavailable. Please try again." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 2: Test the API route manually**

Start the dev server and test with curl:

```bash
npm run dev &
sleep 3
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What was the highest token usage day?"}'
```

Expected: SSE stream with `data: {"type":"chunk","text":"..."}` events followed by `data: {"type":"done"}`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add streaming chat API route with Gemini File Search"
```

---

### Task 5: Create the ChatBar component

**Files:**
- Create: `src/components/chat-bar.tsx`

- [ ] **Step 1: Create `src/components/chat-bar.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
                          ? "bg-[#a855f7]/15 text-foreground border border-[#a855f7]/20"
                          : "bg-muted/50 text-foreground/90 border border-border/30"
                      }`}
                    >
                      {msg.content || (
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat-bar.tsx
git commit -m "feat: add ChatBar component with streaming AI responses"
```

---

### Task 6: Integrate ChatBar into the layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add ChatBar to layout**

In `src/app/layout.tsx`, add the import and component:

```typescript
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatBar } from "@/components/chat-bar";
```

And inside the `<body>` tag, after `{children}`:

```tsx
<body className="min-h-full flex flex-col">
  {children}
  <ChatBar />
</body>
```

- [ ] **Step 2: Add bottom padding to the main page**

In `src/app/page.tsx`, the `<main>` element needs bottom padding so content isn't hidden behind the chat bar. Find:

```tsx
<main className="min-h-screen py-8 px-4 md:px-8 lg:px-10 max-w-[1400px] mx-auto lg:pr-24 relative z-[1]">
```

Replace with:

```tsx
<main className="min-h-screen py-8 pb-24 px-4 md:px-8 lg:px-10 max-w-[1400px] mx-auto lg:pr-24 relative z-[1]">
```

- [ ] **Step 3: Test the full flow**

```bash
npm run dev
```

1. Open `http://localhost:3000`
2. See the chat bar at the bottom
3. Type "What was the highest token usage day?" and press Enter
4. Verify: response streams in, chat expands, message displays
5. Press Escape to collapse
6. Verify: existing report still renders correctly, no layout issues

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: integrate ChatBar into report layout"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Verify setup script ran successfully**

Check `.env.local` has both values:

```bash
cat .env.local | grep GEMINI
```

Expected: Both `GEMINI_API_KEY` and `GEMINI_FILE_SEARCH_STORE` have values.

- [ ] **Step 2: Test various questions**

Start dev server and test these queries in the chat:

1. "What was the highest token usage day?" — should cite cursor-usage.csv
2. "How many PRs were merged?" — should cite prs.json
3. "Which repos did Sanjay contribute to?" — should cite commits.csv or company-contributions.json
4. "Is Cursor usage justified?" — should reference report-context.md claims
5. "What happened on the peak usage day?" — should cross-reference multiple files

- [ ] **Step 3: Test error handling**

1. Send empty message — should not send
2. Disconnect network mid-stream — should show error in chat
3. Remove GEMINI_API_KEY from .env.local, restart, send message — should show "Server not configured" error

- [ ] **Step 4: Test responsive behavior**

1. Resize browser to mobile width (~375px) — chat bar should be full-width
2. Expand chat — should take appropriate height
3. Messages should be readable on small screens

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during e2e testing"
```
