# VibeCheck — 5 Minute Demo Script

**Team:** Pipped Pipers | **Event:** Eclipse 6.0, ACM Thapar | **Presenter:** Dev

---

## [0:00] THE HOOK

> "AI writes 80% of new code today. Cursor, Copilot, ChatGPT — anyone can build an app in minutes. But 24.7% of AI-generated code has security flaws. 19.7% of AI-suggested packages don't even exist on npm. Who's checking if this code is actually safe?"

## [0:20] INTRODUCE THE PRODUCT

> "This is VibeCheck. Lighthouse for vibe-coded apps. Paste a GitHub URL, and we scan, simulate, learn, and fix."

*Show the scan input page — clean black glass UI*

## [0:30] LIVE SCAN — BROKEN REPO

*Paste Yash's broken repo URL, enable simulation, click Scan*

> "Let's scan a real vibe-coded todo app from GitHub."

*Wait for scan — show the progress animation*

> "Four scanners run in parallel — secrets, dependencies, PII, and code smells. Meanwhile, our AI simulation boots the app in a headless browser and tries to break it."

## [1:00] THE SCORE REVEAL

*Score counts up, grade pops in*

> "1 out of 100. F. NO-GO. This app should never ship."

*Point to achievement badges*

> "Secret Keeper — hardcoded API keys. Eval Explorer — eval() in production. PII Leaker, Silent Catcher, XSS Risk."

## [1:30] AI SIMULATION TIMELINE

*Scroll to AI Simulation section*

> "Here's what makes us different from SonarQube or Snyk. We don't just read the code — we RUN the app. Claude Sonnet 4.6 opened the app, typed an XSS payload into the input, submitted it, and this happened —"

*Point to the red finding*

> "— alert() actually fired. XSS confirmed. Then it navigated to /api/todos, found an exposed REST endpoint, and tested SQL injection. No human wrote these test cases. The AI decided what to attack."

## [2:00] CODE HEATMAP

*Click View Code Heatmap*

> "And here's the source code with line-by-line highlighting. Red lines are critical — that's your Stripe key on line 9. Orange — eval() on line 108. You can see exactly where every issue lives."

## [2:30] LIVE SCAN — CLEAN REPO

*Click New Scan, scan the clean app*

> "Now let's scan a well-built app."

*Score reveals: 92, A-, GO*

> "92 out of 100. A minus. GO. Clean Room badge, Fort Knox badge — zero secrets leaked, zero critical issues. The simulation ran the same attacks — nothing broke."

*Pause for contrast to sink in*

## [3:00] AI AGENTS

*Go back to broken app results, click Run AI Agents*

> "But we don't just find problems — we fix them. Five specialized AI agents analyze the codebase: Security, UX, Performance, Scalability, and Production Readiness."

*Show one expanded agent card*

> "Each agent generates a copy-paste prompt. You take this, paste it into Cursor or Copilot, and your AI fixes its own mistakes. AI auditing AI."

## [3:30] KNOWLEDGE BASE

*Click Knowledge Base in header*

> "Every scan makes VibeCheck smarter. We've scanned 34 repos and found 11,540 issues. The number one mistake? AI-generated code leaks email addresses — 4,335 times. Console.log in production — 1,196 times. Empty catch blocks — 110 times."

> "This isn't a static tool. It learns."

## [4:00] PROTECT THIS REPO

*Go back to results, scroll to Protect This Repo, click Get GitHub Action*

> "One more thing. After scanning, you get a GitHub Action. Drop this one file in your repo —"

*Show the YAML*

> "— and every commit is automatically audited. If the score drops below 40, CI fails. We already tested this on a real repo."

*Show Yash's GitHub Actions tab if possible — the red failed run*

> "That push failed because VibeCheck caught 8 vulnerabilities."

## [4:30] THE CLOSE

> "Snyk scans code. SonarQube scans code. We scan AND simulate AND learn AND generate the fix."

> **"VibeCheck. Lighthouse for vibe-coded apps."**

---

## Jury Q&A Cheat Sheet

| Question | Answer |
|----------|--------|
| How is this different from SonarQube? | They do static analysis. We also run the app with an AI agent that clicks, types, and tests like a real user. And we learn from every scan. |
| Does the AI simulation actually work? | Yes — Claude Sonnet 4.6 looks at screenshots, decides what to attack. It confirmed XSS by triggering alert() in the browser. We can demo it live. |
| What about false positives? | Each issue has a severity and confidence level. Critical findings like leaked API keys are regex matches with high confidence. Simulation findings include the full reproduction path. |
| Will this scale? | Scanners run in parallel, complete in under 5 seconds. For scale, we'd add a worker queue and hosted browser pool. |
| Why not just use ESLint? | ESLint catches style issues. We catch leaked Stripe keys, hallucinated npm packages, PII exposure, and runtime crashes. |
| What's the tech stack? | React, Node.js, Express, Puppeteer, Claude API, SQLite, OSV.dev for CVE data. Chart.js for visualization. |
| Can it handle large repos? | We process files in parallel and skip node_modules, dist, build folders. Most repos scan in under 10 seconds. |
| What's the knowledge base? | Every scan stores failure patterns with frequency. After 34 scans we know the top 50 mistakes AI makes. Future scans check this first. |
| How does the GitHub Action work? | It clones our scanner repo, runs 4 scanners against the code, prints score. Below 40 = CI fails. One YAML file, every commit protected. |
| Don't know the answer? | "That's a great question — we haven't explored that yet, but our hypothesis is..." Never bluff. Judges respect honesty. |

---

## Demo Rules

1. **Practice 3 times** before tomorrow
2. **Pre-load both repo URLs** in a text file — paste, don't type
3. **Browser zoom 150%** for projector readability
4. **If live demo crashes** — "Let me switch to our recorded demo" — play backup video
5. **Never say** "it was working 5 minutes ago"
6. **Keep answers under 30 seconds** — short answers signal competence
7. **Arun handles** technical deep-dive questions
8. **Start with the demo**, not slides — show the working product first

---

## Pre-Demo Checklist

- [ ] App running on laptop (`npm run dev`)
- [ ] ANTHROPIC_API_KEY set in server environment
- [ ] Browser open with VibeCheck loaded
- [ ] Demo repo URLs copied and ready to paste
- [ ] Browser zoom increased for projector
- [ ] Backup demo video recorded by Abhijay
- [ ] Pitch deck on USB as backup
- [ ] Laptop fully charged + charger accessible
- [ ] Dev has done 3+ dry runs
- [ ] Team knows who answers what type of question

---

## Key Stats for Pitch

- 24.7% of AI-generated code has security flaws
- AI code has 1.5–2.7x more vulnerabilities than human code
- 19.7% of AI-suggested dependencies don't exist (slopsquatting)
- 34 repos scanned, 11,540 issues found, 50 patterns learned
- No competitor combines: static scanning + runtime simulation + learning loop + fix prompts + CI integration
