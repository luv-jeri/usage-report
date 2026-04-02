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

### Billing / Peak Day Section
Shows the peak token usage day with: date, token count, cost, and request count (including how many were free). The narrative explains that the highest token consumption day was driven largely by Max Mode usage with claude-4.6-opus-high-thinking (large context windows for complex code generation) and automated agent_review requests (PR reviews).

### Daily Token Usage Chart
Displays the top 10 highest token usage days as a bar chart.

### Overall Stats
- Total Requests: split into free and paid (on-demand)
- Total Cost: on-demand charges only
- Total Commits: split by company and personal repositories
- Pull Requests: total count, merged count — all in company repos

### Working Hours Section
Shows Cursor usage and commit activity overlaid by hour of day (IST timezone). The narrative acknowledges working primarily in an afternoon-to-late-night window (14:00–01:00 IST), notes this is unconventional and being improved, but emphasizes that Cursor usage and commit activity happen during the same hours — the tool usage directly produces work output.

### Models Used
Bar chart showing which AI models were used and their token consumption.

### Commit Distribution
Pie/donut chart showing commits per repository.

### Company vs Personal Split
Shows the ratio of company to personal commits, the company commit percentage, and the number of repositories contributed to.

### Pull Requests & Commits Details
Tabbed view with full lists of PRs and commits. The narrative highlights that every pull request was in a company repository, covering features (upload flow, download, share asset, search, runtime config), bug fixes, refactors, and UI improvements.

### PR Status Chart
Visual breakdown of PR states: Merged, Open, Closed.

### Repo Breakdown
List of all repositories with commit counts and PR counts, labeled as Company or Personal.

### Company Contributions Section
Detailed contributor analysis for Evolphin-Software organization repos:
- Number of org repos contributed to (out of total)
- Total lines of code added across primary repos
- Rank among contributors (by lines of code)
- Per-repo contributor charts showing additions/deletions by team member

## Data Files

### cursor-usage.csv
Each row is a Cursor AI request event with columns:
- date (UTC timestamp)
- user (email)
- kind (Free or On-Demand)
- model (AI model name, e.g., claude-4.6-opus-high-thinking, gpt-4)
- maxMode (whether Max Mode was enabled)
- inputWithCache (input tokens with cache)
- inputWithoutCache (input tokens without cache)
- cacheRead (cache read tokens)
- outputTokens (output tokens generated)
- totalTokens (total token count)
- cost (dollar amount, $0.00 for free requests)

### commits.csv
Each row is a git commit with columns:
- date (YYYY-MM-DD)
- time (HH:MM IST)
- repo (full repository name, e.g., Evolphin-Software/evolphin-x)
- repoType (Company or Personal)
- sha (commit hash)
- message (commit message)

### prs.json
Array of pull request objects with fields:
- title (PR title)
- repository.nameWithOwner (e.g., Evolphin-Software/evolphin-x)
- state (MERGED, OPEN, or CLOSED)
- createdAt (ISO date)
- closedAt (ISO date or null)
- url (GitHub PR URL)

### company-contributions.json
Contributor statistics for Evolphin-Software repos:
- username, displayName, orgName
- totalOrgRepos, reposContributed
- primaryRepos: array of repos with contributor breakdown (login, displayName, commits, additions, deletions, isSelf)
- otherRepos: array of {name, commits, url}

### summary.json
Aggregated summary with total_commits and per-repo breakdown (count and type).

## Key Claims in the Report
1. Cursor usage is transparent and justified by work output
2. The highest token usage day correlates with significant feature delivery
3. Company work happens during business hours (afternoon-to-late-night IST window); personal projects are off-hours
4. Free-tier requests make up a significant portion of usage (cost-efficient)
5. Work output (commits, PRs, lines of code) demonstrates productive use of AI tooling
6. Every pull request was in a company repository
7. Sanjay is the #1 contributor by lines of code in primary Evolphin repos
