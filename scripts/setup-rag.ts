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
  const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const existingStore = envContent.match(/GEMINI_FILE_SEARCH_STORE=(.+)/)?.[1]?.trim();

  if (existingStore && !FORCE) {
    console.log(`File Search Store already configured: ${existingStore}`);
    console.log("Run with --force to recreate.");
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  console.log("Creating File Search Store...");
  const store = await ai.fileSearchStores.create({
    config: { displayName: "usage-report-rag" },
  });
  const storeName = store.name!;
  console.log(`Store created: ${storeName}`);

  for (const fileInfo of FILES_TO_UPLOAD) {
    const filePath = path.join(DATA_DIR, fileInfo.path);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} not found, skipping.`);
      continue;
    }
    console.log(`Uploading ${fileInfo.path}...`);

    const uploaded = await ai.files.upload({
      file: filePath,
      config: { displayName: fileInfo.displayName },
    });

    const operation = await ai.fileSearchStores.importFile({
      fileSearchStoreName: storeName,
      fileName: uploaded.name!,
    });

    await waitForOperation(ai, operation);
    console.log(`  Done: ${fileInfo.path}`);
  }

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
