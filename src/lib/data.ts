import fs from "fs";
import path from "path";

export interface CursorEvent {
  date: string;
  user: string;
  kind: string;
  model: string;
  maxMode: string;
  inputWithCache: number;
  inputWithoutCache: number;
  cacheRead: number;
  outputTokens: number;
  totalTokens: number;
  cost: string;
}

export interface Commit {
  date: string;
  time: string;
  repo: string;
  repoType: string;
  sha: string;
  message: string;
}

export interface PR {
  title: string;
  repository: { nameWithOwner: string };
  state: string;
  createdAt: string;
  closedAt: string | null;
  url: string;
}

function parseCursorCSV(csvText: string): CursorEvent[] {
  const lines = csvText.trim().split("\n");
  const events: CursorEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    // Parse CSV with quoted fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of row) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);

    if (fields.length >= 11) {
      events.push({
        date: fields[0],
        user: fields[1],
        kind: fields[2],
        model: fields[3],
        maxMode: fields[4],
        inputWithCache: parseInt(fields[5]) || 0,
        inputWithoutCache: parseInt(fields[6]) || 0,
        cacheRead: parseInt(fields[7]) || 0,
        outputTokens: parseInt(fields[8]) || 0,
        totalTokens: parseInt(fields[9]) || 0,
        cost: fields[10],
      });
    }
  }
  return events;
}

function parseCommitsCSV(csvText: string): Commit[] {
  const lines = csvText.trim().split("\n");
  const commits: Commit[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);
    if (fields.length >= 6) {
      commits.push({
        date: fields[0],
        time: fields[1],
        repo: fields[2],
        repoType: fields[3],
        sha: fields[4],
        message: fields[5],
      });
    }
  }
  return commits;
}

export interface CompanyContributions {
  username: string;
  displayName: string;
  orgName: string;
  totalOrgRepos: number;
  reposContributed: number;
  primaryRepos: {
    name: string;
    url: string;
    description: string;
    contributors: {
      login: string;
      displayName: string;
      commits: number;
      additions: number;
      deletions: number;
      isSelf: boolean;
    }[];
    totalCommits: number;
  }[];
  otherRepos: { name: string; commits: number; url: string }[];
}

export function loadData() {
  const dataDir = path.join(process.cwd(), "public", "data");

  const companyContribJSON = fs.readFileSync(path.join(dataDir, "company-contributions.json"), "utf-8");
  const companyContributions: CompanyContributions = JSON.parse(companyContribJSON);

  const cursorCSV = fs.readFileSync(
    path.join(dataDir, "cursor-usage.csv"),
    "utf-8"
  );
  const commitsCSV = fs.readFileSync(
    path.join(dataDir, "commits.csv"),
    "utf-8"
  );
  const prsJSON = fs.readFileSync(path.join(dataDir, "prs.json"), "utf-8");

  const cursorEvents = parseCursorCSV(cursorCSV);
  const commits = parseCommitsCSV(commitsCSV);
  const prs: PR[] = JSON.parse(prsJSON);

  // --- Cursor analysis ---
  const dailyUsage: Record<
    string,
    { tokens: number; cost: number; requests: number; freeRequests: number }
  > = {};
  let totalCost = 0;
  let totalTokens = 0;
  let freeRequests = 0;
  let paidRequests = 0;

  const modelUsage: Record<string, { count: number; tokens: number }> = {};

  for (const event of cursorEvents) {
    const day = event.date.slice(0, 10);
    if (!dailyUsage[day]) {
      dailyUsage[day] = { tokens: 0, cost: 0, requests: 0, freeRequests: 0 };
    }
    dailyUsage[day].tokens += event.totalTokens;
    dailyUsage[day].requests += 1;
    totalTokens += event.totalTokens;

    const costNum = parseFloat(event.cost) || 0;
    dailyUsage[day].cost += costNum;
    totalCost += costNum;

    if (event.kind === "Free") {
      freeRequests++;
      dailyUsage[day].freeRequests++;
    } else if (event.kind === "On-Demand") {
      paidRequests++;
    }

    const model = event.model;
    if (!modelUsage[model]) modelUsage[model] = { count: 0, tokens: 0 };
    modelUsage[model].count++;
    modelUsage[model].tokens += event.totalTokens;
  }

  // Hourly cursor usage (IST = UTC+5:30)
  const cursorHourly: Record<number, number> = {};
  for (const event of cursorEvents) {
    const utcDate = new Date(event.date);
    const istHour = (utcDate.getUTCHours() + 5 + Math.floor((utcDate.getUTCMinutes() + 30) / 60)) % 24;
    cursorHourly[istHour] = (cursorHourly[istHour] || 0) + 1;
  }

  // Highest usage day
  const sortedDays = Object.entries(dailyUsage).sort(
    (a, b) => b[1].tokens - a[1].tokens
  );
  const highestDay = sortedDays[0];

  // --- Commit analysis ---
  const companyCommits = commits.filter((c) => c.repoType === "Company");
  const personalCommits = commits.filter((c) => c.repoType === "Personal");

  // Commit hours (already IST in the data)
  const commitHourly: Record<number, { company: number; personal: number }> =
    {};
  for (const c of commits) {
    const hour = parseInt(c.time.slice(0, 2));
    if (!commitHourly[hour])
      commitHourly[hour] = { company: 0, personal: 0 };
    if (c.repoType === "Company") commitHourly[hour].company++;
    else commitHourly[hour].personal++;
  }

  // Repo breakdown
  const repoBreakdown: Record<
    string,
    { count: number; type: string; prs: number }
  > = {};
  for (const c of commits) {
    if (!repoBreakdown[c.repo])
      repoBreakdown[c.repo] = { count: 0, type: c.repoType, prs: 0 };
    repoBreakdown[c.repo].count++;
  }
  for (const pr of prs) {
    const repo = pr.repository.nameWithOwner;
    if (repoBreakdown[repo]) repoBreakdown[repo].prs++;
  }

  // PR stats
  const companyPRs = prs.filter((p) =>
    p.repository.nameWithOwner.includes("Evolphin-Software")
  );
  const mergedPRs = prs.filter((p) => p.state === "MERGED");

  // Daily commit data for chart
  const dailyCommits: Record<
    string,
    { company: number; personal: number }
  > = {};
  for (const c of commits) {
    if (!dailyCommits[c.date])
      dailyCommits[c.date] = { company: 0, personal: 0 };
    if (c.repoType === "Company") dailyCommits[c.date].company++;
    else dailyCommits[c.date].personal++;
  }

  // Peak day data extraction
  const peakDate = highestDay ? highestDay[0] : null;

  const peakDayCommits = peakDate
    ? commits.filter((c) => c.date === peakDate)
    : [];

  const peakDayCursorEvents = peakDate
    ? cursorEvents
        .filter((e) => e.date.startsWith(peakDate))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const peakDayPRs = peakDate
    ? prs.filter((p) => p.createdAt.startsWith(peakDate))
    : [];

  const peakDayFeatures = peakDayCommits
    .map((c) => c.message)
    .filter((m) => m.startsWith("feat") || m.startsWith("fix") || m.startsWith("refactor"))
    .slice(0, 5);

  const peakDayModelBreakdown: Record<string, { count: number; tokens: number }> = {};
  for (const e of peakDayCursorEvents) {
    if (!peakDayModelBreakdown[e.model]) peakDayModelBreakdown[e.model] = { count: 0, tokens: 0 };
    peakDayModelBreakdown[e.model].count++;
    peakDayModelBreakdown[e.model].tokens += e.totalTokens;
  }

  return {
    companyContributions,
    cursor: {
      events: cursorEvents,
      dailyUsage,
      totalCost,
      totalTokens,
      totalRequests: cursorEvents.length,
      freeRequests,
      paidRequests,
      modelUsage,
      highestDay: highestDay
        ? { date: highestDay[0], ...highestDay[1] }
        : null,
      hourly: cursorHourly,
      sortedDays: sortedDays.slice(0, 10).map(([date, data]) => ({
        date,
        ...data,
      })),
    },
    commits: {
      total: commits.length,
      company: companyCommits.length,
      personal: personalCommits.length,
      hourly: commitHourly,
      daily: dailyCommits,
      repoBreakdown,
      list: commits,
    },
    prs: {
      total: prs.length,
      company: companyPRs.length,
      merged: mergedPRs.length,
      list: prs,
    },
    peakDay: {
      date: peakDate,
      commits: peakDayCommits,
      cursorEvents: peakDayCursorEvents,
      prs: peakDayPRs,
      features: peakDayFeatures,
      modelBreakdown: peakDayModelBreakdown,
    },
  };
}
