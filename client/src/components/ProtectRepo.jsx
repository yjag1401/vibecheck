import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

function generateYAML(repoUrl) {
  return `# VibeCheck — AI Code Auditor
# Scans for security vulnerabilities, leaked secrets, PII, and code smells.
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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install VibeCheck
        run: |
          git clone https://github.com/Arun07AK/vibecheck.git /tmp/vibecheck
          cd /tmp/vibecheck/server && npm install --production
      - name: Run Scan
        run: |
          cd /tmp/vibecheck/server && node -e "
            const { initDB } = require('./db/database');
            const db = initDB();
            const s1 = require('./scanners/secretScanner');
            const s2 = require('./scanners/depScanner');
            const s3 = require('./scanners/piiScanner');
            const s4 = require('./scanners/codeSmellScanner');
            (async () => {
              const p = process.env.GITHUB_WORKSPACE;
              const issues = [].concat(...await Promise.all([s1.scan(p),s2.scan(p),s3.scan(p),s4.scan(p)]));
              let score = 100;
              issues.forEach(i => { score -= i.severity==='CRITICAL'?15:i.severity==='HIGH'?8:i.severity==='MEDIUM'?3:1; });
              score = Math.max(0, score);
              console.log('VibeCheck: ' + score + '/100 — ' + (score>=70?'GO':score>=40?'WARNING':'NO-GO'));
              console.log(issues.length + ' issues found');
              issues.forEach(i => console.log('[' + i.severity + '] ' + i.title + ' — ' + (i.filePath||'N/A')));
              if (score < 40) { console.log('FAILED'); process.exit(1); }
            })();
          "`;
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
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-white/30" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="text-white font-semibold">Protect This Repo</h3>
          <p className="text-xs text-white/25">GitHub Action that runs VibeCheck on every push</p>
        </div>
        <button
          onClick={() => setShowYAML(!showYAML)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showYAML ? 'glass text-white' : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {showYAML ? 'Hide' : 'Get GitHub Action'}
        </button>
      </div>

      {showYAML && (
        <div className="space-y-3 fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/25 flex-1">
              Save as <code className="text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded">.github/workflows/vibecheck.yml</code>
            </span>
            <button onClick={handleCopy}
              className={`glass px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'text-white' : 'text-white/40 hover:text-white'}`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="glass px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white transition-colors">
              Download
            </button>
          </div>
          <pre className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 text-xs text-white/35 overflow-x-auto max-h-72 overflow-y-auto font-mono leading-relaxed">
            {yaml}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProtectRepo;
