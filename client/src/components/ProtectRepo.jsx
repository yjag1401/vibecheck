import { useState } from 'react';

function generateYAML(repoUrl) {
  const repoName = repoUrl.replace(/.*\//, '').replace('.git', '') || 'my-app';
  return `# VibeCheck — AI Code Auditor
# Automatically scans your code for security vulnerabilities,
# leaked secrets, PII exposure, and code smells on every push.
#
# Drop this file in: .github/workflows/vibecheck.yml

name: VibeCheck Audit

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  vibecheck:
    name: Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install VibeCheck
        run: |
          git clone https://github.com/Arun07AK/vibecheck.git /tmp/vibecheck
          cd /tmp/vibecheck/server && npm install --production

      - name: Run VibeCheck Scan
        run: |
          cd /tmp/vibecheck/server && node -e "
            const { initDB } = require('./db/database');
            const db = initDB();
            const secretScanner = require('./scanners/secretScanner');
            const depScanner = require('./scanners/depScanner');
            const piiScanner = require('./scanners/piiScanner');
            const codeSmellScanner = require('./scanners/codeSmellScanner');

            (async () => {
              const repoPath = process.env.GITHUB_WORKSPACE;
              const [secrets, deps, pii, smells] = await Promise.all([
                secretScanner.scan(repoPath),
                depScanner.scan(repoPath),
                piiScanner.scan(repoPath),
                codeSmellScanner.scan(repoPath),
              ]);
              const issues = [...secrets, ...deps, ...pii, ...smells];
              let score = 100;
              for (const i of issues) {
                if (i.severity === 'CRITICAL') score -= 15;
                else if (i.severity === 'HIGH') score -= 8;
                else if (i.severity === 'MEDIUM') score -= 3;
                else score -= 1;
              }
              score = Math.max(0, score);
              const verdict = score >= 70 ? 'GO' : score >= 40 ? 'WARNING' : 'NO-GO';

              console.log('\\n===== VibeCheck Report =====');
              console.log('Score: ' + score + '/100 — ' + verdict);
              console.log('Issues: ' + issues.length);
              console.log('  CRITICAL: ' + issues.filter(i => i.severity === 'CRITICAL').length);
              console.log('  HIGH: ' + issues.filter(i => i.severity === 'HIGH').length);
              console.log('  MEDIUM: ' + issues.filter(i => i.severity === 'MEDIUM').length);
              console.log('  LOW: ' + issues.filter(i => i.severity === 'LOW').length);
              console.log('============================\\n');

              if (issues.length > 0) {
                for (const i of issues) {
                  console.log('[' + i.severity + '] ' + i.title + ' — ' + (i.filePath || 'N/A') + ':' + (i.lineNumber || '?'));
                }
              }

              if (score < 40) {
                console.log('\\n❌ VibeCheck FAILED — score below 40');
                process.exit(1);
              } else {
                console.log('\\n✅ VibeCheck PASSED');
              }
            })();
          "

      - name: Upload Results
        if: always()
        run: echo "VibeCheck scan complete. Check logs above for details."`;
}

function ProtectRepo({ repoUrl }) {
  const [showYAML, setShowYAML] = useState(false);
  const [copied, setCopied] = useState(false);

  const yaml = generateYAML(repoUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibecheck.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🛡️</span>
        <div className="flex-1">
          <h3 className="text-white font-bold">Protect This Repo</h3>
          <p className="text-xs text-slate-400">Add a GitHub Action that runs VibeCheck on every push — automatic security auditing</p>
        </div>
        <button
          onClick={() => setShowYAML(!showYAML)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showYAML ? 'bg-teal/20 text-teal' : 'bg-teal text-bg hover:bg-teal/90'
          }`}
        >
          {showYAML ? 'Hide' : 'Get GitHub Action'}
        </button>
      </div>

      {showYAML && (
        <div className="space-y-3 fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex-1">
              Save as <code className="text-teal bg-slate-800 px-1.5 py-0.5 rounded">.github/workflows/vibecheck.yml</code> in your repo
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {copied ? 'Copied!' : 'Copy YAML'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Download
            </button>
          </div>
          <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto max-h-80 overflow-y-auto font-mono leading-relaxed">
            {yaml}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProtectRepo;
