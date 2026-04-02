import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI assistant for Sanjay Kumar's Cursor Usage & Work Activity Report.
You help leadership understand the data. Answer professionally and clearly.
Cite specific numbers, dates, and file sources from the data.
If you don't know something or the data doesn't contain the answer, say so honestly.
Do not make up data. Keep answers concise but complete.`;

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE;

  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured. Add it to your environment variables." },
      { status: 500 }
    );
  }

  if (!storeName) {
    return Response.json(
      { error: "GEMINI_FILE_SEARCH_STORE is not configured. Run the setup script or add the env variable." },
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
  // Filter out error messages from history to avoid confusing the model
  const contents: { role: string; parts: { text: string }[] }[] = [];

  if (body.history) {
    for (const msg of body.history) {
      // Skip error messages that were displayed in the UI
      if (msg.content.startsWith("Error:")) continue;
      if (!msg.content.trim()) continue;

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

  // Try with retry logic and model fallback
  let lastError: unknown = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for model ${model}...`);
          await sleep(RETRY_DELAY_MS * attempt);
        }

        const response = await ai.models.generateContentStream({
          model,
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

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
              );
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : "Stream error";
              console.error(`Stream error (${model}, attempt ${attempt}):`, errorMsg);
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
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`Gemini API error (${model}, attempt ${attempt}):`, errMsg);

        // If it's a 4xx error (bad request, auth, etc.), don't retry — fix needed
        if (errMsg.includes("400") || errMsg.includes("401") || errMsg.includes("403")) {
          return Response.json(
            { error: `API error: ${errMsg.slice(0, 200)}` },
            { status: 502 }
          );
        }
      }
    }
    console.log(`All retries exhausted for model ${model}, trying next model...`);
  }

  // All models and retries exhausted
  const finalMsg = lastError instanceof Error ? lastError.message : "Unknown error";
  console.error("All models and retries failed. Last error:", finalMsg);

  return Response.json(
    {
      error: `AI service temporarily unavailable after multiple attempts. Last error: ${finalMsg.slice(0, 150)}. Please try again in a moment.`,
    },
    { status: 502 }
  );
}
