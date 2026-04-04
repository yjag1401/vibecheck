# VibeCheck — Demo Script

**Team:** Pipped Pipers | **Event:** Eclipse 6.0, ACM Thapar
**Format:** Judges visit your workspace. No stage. Conversational, not performative.
**Who talks:** Dev leads. Arun handles technical deep-dives. Others support.

---

## Judging Criteria (from official guidelines)

1. **Innovation & Novelty** — AI simulation + learning loop is unique
2. **Technical Complexity & Feasibility** — 4 scanners + Puppeteer + Claude + SQLite + React
3. **Social Impact** — protecting developers from shipping vulnerable code
4. **User Experience & Design** — Liquid Glass monochrome UI
5. **Presentation & Communication** — smooth, confident, under 5 minutes

---

## When Judges Walk Up

**Dev stands, makes eye contact, speaks confidently.**

### Opening (30 seconds)

> "Hey, we're Pipped Pipers. We built VibeCheck — it's an AI-powered code auditor for vibe-coded apps. Think of it as Lighthouse, but for security."

> "The problem: AI writes 80% of new code today, but 24.7% of it has security flaws. Cursor and Copilot let anyone build an app in minutes — but nobody's checking if that code is safe to ship."

> "VibeCheck checks it. Paste a GitHub URL, we scan it, simulate a real user attacking it, score it 0 to 100, and generate the fix."

### Live Demo — Broken App (2 minutes)

*Dev is already at the laptop. App is pre-loaded.*

> "Let me show you. Here's a real todo app from GitHub."

*Paste Yash's broken repo URL, simulation ON, click Scan*

> "Four scanners run in parallel — secrets, dependencies, PII, code smells. At the same time, our AI simulation actually starts the app in a headless Chrome browser and tries to break it."

*Results load — score, grade, verdict*

> "1 out of 100. F. NO-GO."

*Point to badges*

> "It earned Secret Keeper — hardcoded API keys. Eval Explorer — eval() in production. PII Leaker. Silent Catcher — empty catch blocks hiding bugs."

*Scroll to AI Simulation*

> "This is the part that's different from anything else out there. Claude Sonnet 4.6 — an actual AI — opened this app, looked at the screen, decided to type an XSS payload into the input, submitted it, and—"

*Point to the red finding*

> "—alert() actually fired in the browser. XSS confirmed. Then it navigated to /api/todos, found an exposed endpoint, and tried SQL injection. No human wrote these tests. The AI decided what to attack."

*Click View Code Heatmap*

> "And here's the source code with every issue highlighted line by line. Red is critical — Stripe key on line 9. You can see exactly where the problems are."

### Live Demo — Clean App (30 seconds)

*Click New Scan, scan clean app*

> "Now a well-built app."

*Score: 92, A-, GO*

> "92. A minus. GO. Clean Room, Fort Knox badges. Same attacks — nothing broke."

### AI Agents (30 seconds)

*Click Run AI Agents on broken app results*

> "We don't just find problems — we fix them. Five AI agents analyze the code: Security, UX, Performance, Scalability, Production Readiness. Each one generates a copy-paste prompt you can give to Cursor to fix the issues. AI auditing AI, then AI fixing AI."

### Knowledge Base (30 seconds)

*Click Knowledge Base in header*

> "Every scan makes VibeCheck smarter. We've scanned 34 repos, found over 11,000 issues, and learned 50 patterns. The number one AI mistake? Leaking email addresses — over 4,000 times. This isn't a static tool. It learns."

### GitHub Action (30 seconds)

*Go back to results, click Get GitHub Action*

> "Last thing. After scanning, we generate a GitHub Action config file. Drop it in your repo — every push is automatically audited. Score below 40, CI fails."

*If possible, show Yash's GitHub Actions tab with the red failed run*

> "We already tested it. That push failed because VibeCheck caught the vulnerabilities."

### Close (15 seconds)

> "SonarQube scans code. Snyk scans code. We scan, simulate, learn, and generate the fix. VibeCheck — Lighthouse for vibe-coded apps."

---

## Jury Q&A Cheat Sheet

**Keep every answer under 30 seconds. Short = competent.**

| Question | Who answers | Answer |
|----------|------------|--------|
| How is this different from SonarQube/Snyk? | Dev | "They do static analysis only. We also run the app with an AI agent that clicks, types, and tests like a real user. And we learn from every scan." |
| Does the AI simulation actually work? | Arun | "Yes — Claude Sonnet 4.6 looks at screenshots and decides what to attack. It confirmed XSS by triggering alert() in the browser. Happy to run it again live." |
| What about false positives? | Arun | "Critical findings like leaked API keys are high-confidence regex matches. Simulation findings include the reproduction path so you can verify." |
| Will this scale? | Arun | "Scanners run in parallel, under 5 seconds for most repos. For scale, we'd add a worker queue and hosted browser pool." |
| Why not just use ESLint? | Dev | "ESLint catches style issues. We catch leaked Stripe keys, hallucinated npm packages that don't exist on npm, PII exposure, and runtime crashes." |
| What's the tech stack? | Arun | "React, Node, Express, Puppeteer, Claude API, SQLite, OSV.dev for CVE data, Chart.js." |
| What's the knowledge base? | Dev | "Every scan stores failure patterns. After 34 scans we know the top 50 mistakes AI makes. Future scans use this data." |
| How does the GitHub Action work? | Arun | "It clones our scanner repo, runs the 4 scanners, prints a score. Below 40, CI fails. One YAML file, every commit protected." |
| What's the social impact? | Dev | "AI-generated code is everywhere — startups, students, even enterprises. VibeCheck protects users from shipping code that leaks their data or has security holes." |
| Don't know? | Anyone | "That's a great question — we haven't explored that yet, but our hypothesis is..." Never bluff. |

---

## Team Roles During Judging

| Person | Role |
|--------|------|
| **Dev** | Talks. Drives the demo. Answers non-technical questions. |
| **Arun** | Sits next to Dev. Handles technical deep-dives. Drives the laptop if needed. |
| **Yash** | Stands ready. Confirms demo repos are his. Can talk about the broken apps he built. |
| **Abhijay** | Has backup video ready on his phone/laptop. Jumps in if live demo crashes. |
| **Adaa** | Has pitch deck ready as backup. Can show slides if judges want a high-level overview. |

---

## Demo Setup (Do this by 8:30 AM)

- [ ] Laptop plugged in and charged
- [ ] `ANTHROPIC_API_KEY` set in terminal environment
- [ ] Run `cd ~/acm/vibecheck && ANTHROPIC_API_KEY=sk-ant-... npm run dev`
- [ ] Browser open at `http://localhost:5173` — zoom 150%
- [ ] Two repo URLs ready in a text file to paste:
  - Broken: `https://github.com/yjag1401/broken-todo-app`
  - Clean: `/tmp/clean-vibe-app`
- [ ] Pre-scan both repos once so results are cached and fast
- [ ] Abhijay's backup video ready
- [ ] Adaa's deck on USB
- [ ] Extension cord brought (required per guidelines)
- [ ] Dev has practiced 3+ times

---

## If Things Go Wrong

| Problem | Solution |
|---------|----------|
| Live demo crashes | Abhijay plays backup video. Dev says "Let me show you the recording." |
| Scan takes too long | Talk about the architecture while it loads. "Under the hood, 4 scanners run in parallel..." |
| Simulation fails | Skip it. "The static analysis found 12 issues. Let me show you the code heatmap." |
| WiFi dies | Scan local path `/tmp/test-vibe-app` instead — works offline. |
| Judges ask to see code | Open GitHub: `github.com/Arun07AK/vibecheck`. Show commit history — built today. |
| Don't know the answer | "Great question. We haven't explored that yet, but here's our hypothesis..." |

---

## Key Stats

- 24.7% of AI-generated code has security flaws
- AI code has 1.5–2.7x more vulnerabilities than human code
- 19.7% of AI-suggested dependencies don't exist (slopsquatting)
- 34 repos scanned, 11,540 issues found, 50 patterns learned
- No competitor combines: static scanning + runtime simulation + learning loop + fix prompts + CI integration
