const express = require('express');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const secretScanner = require('../scanners/secretScanner');
const depScanner = require('../scanners/depScanner');
const piiScanner = require('../scanners/piiScanner');
const codeSmellScanner = require('../scanners/codeSmellScanner');
const { simulate } = require('../simulation/aiAgent');
const { runAgents } = require('../agents/runAgents');

function calculateScore(issues) {
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'CRITICAL': score -= 15; break;
      case 'HIGH':     score -= 8;  break;
      case 'MEDIUM':   score -= 3;  break;
      case 'LOW':      score -= 1;  break;
    }
  }
  return Math.max(0, score);
}

function getVerdict(score) {
  if (score >= 70) return 'GO';
  if (score >= 40) return 'WARNING';
  return 'NO-GO';
}

function getVerdictColor(verdict) {
  if (verdict === 'GO') return 'green';
  if (verdict === 'WARNING') return 'yellow';
  return 'red';
}

async function runScanners(repoPath) {
  const [secrets, deps, pii, codeSmells] = await Promise.all([
    secretScanner.scan(repoPath),
    depScanner.scan(repoPath),
    piiScanner.scan(repoPath),
    codeSmellScanner.scan(repoPath),
  ]);
  return [...secrets, ...deps, ...pii, ...codeSmells];
}

function saveScan(db, repoUrl, score, verdict, issues) {
  const insertScan = db.prepare(
    'INSERT INTO scans (repo_url, score, verdict, issue_count) VALUES (?, ?, ?, ?)'
  );
  const insertIssue = db.prepare(
    'INSERT INTO issues (scan_id, scanner, severity, title, description, file_path, line_number, code_snippet, fix_suggestion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const upsertPattern = db.prepare(`
    INSERT INTO patterns (error_type, code_snippet, file_pattern, fix_suggestion)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(error_type) DO UPDATE SET frequency = frequency + 1
  `);

  const transaction = db.transaction(() => {
    const { lastInsertRowid: scanId } = insertScan.run(repoUrl, score, verdict, issues.length);
    for (const issue of issues) {
      insertIssue.run(
        scanId, issue.scanner, issue.severity, issue.title,
        issue.description, issue.filePath, issue.lineNumber,
        issue.codeSnippet, issue.fixSuggestion
      );
      upsertPattern.run(issue.title, issue.codeSnippet, issue.filePath, issue.fixSuggestion);
    }
    return scanId;
  });

  return transaction();
}

function cleanup(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (e) {
    // ignore cleanup errors
  }
}

module.exports = function (db) {
  const router = express.Router();

  // Scan GitHub repo
  router.post('/scan', async (req, res) => {
    const { url, enableSimulation } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const cloneDir = path.join('/tmp', `vibecheck-${uuidv4()}`);
    try {
      const git = simpleGit();
      await git.clone(url, cloneDir, ['--depth', '1']);

      let issues = await runScanners(cloneDir);

      // Run simulation if enabled
      let simulationData = null;
      if (enableSimulation) {
        try {
          const simResult = await simulate(cloneDir);
          issues = [...issues, ...(simResult.issues || [])];
          simulationData = { log: simResult.log || [], mode: simResult.mode || 'scripted', issueCount: (simResult.issues || []).length };
        } catch (err) {
          simulationData = { log: [{ step: 1, action: 'error', detail: err.message }], mode: 'failed', issueCount: 0 };
        }
      }

      const score = calculateScore(issues);
      const verdict = getVerdict(score);
      const scanId = saveScan(db, url, score, verdict, issues);

      // Delay cleanup so heatmap can read files (clean after 5 min)
      setTimeout(() => cleanup(cloneDir), 5 * 60 * 1000);

      res.json({
        scanId,
        repoUrl: url,
        repoPath: cloneDir,
        score,
        verdict,
        verdictColor: getVerdictColor(verdict),
        totalIssues: issues.length,
        issues,
        severityCounts: {
          CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
          HIGH: issues.filter(i => i.severity === 'HIGH').length,
          MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
          LOW: issues.filter(i => i.severity === 'LOW').length,
        },
        scannerCounts: {
          secrets: issues.filter(i => i.scanner === 'secrets').length,
          dependencies: issues.filter(i => i.scanner === 'dependencies').length,
          pii: issues.filter(i => i.scanner === 'pii').length,
          codeSmells: issues.filter(i => i.scanner === 'code-smells').length,
          simulation: issues.filter(i => i.scanner === 'simulation').length,
        },
        simulation: simulationData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      cleanup(cloneDir);
      res.status(500).json({ error: `Scan failed: ${err.message}` });
    }
  });

  // Scan local path
  router.post('/scan-local', async (req, res) => {
    const { path: localPath, enableSimulation } = req.body;
    if (!localPath) return res.status(400).json({ error: 'Path is required' });
    if (!fs.existsSync(localPath)) return res.status(400).json({ error: 'Path does not exist' });

    try {
      let issues = await runScanners(localPath);

      // Run simulation if enabled
      let simulationData = null;
      if (enableSimulation) {
        try {
          const simResult = await simulate(localPath);
          issues = [...issues, ...(simResult.issues || [])];
          simulationData = { log: simResult.log || [], mode: simResult.mode || 'scripted', issueCount: (simResult.issues || []).length };
        } catch (err) {
          simulationData = { log: [{ step: 1, action: 'error', detail: err.message }], mode: 'failed', issueCount: 0 };
        }
      }

      const score = calculateScore(issues);
      const verdict = getVerdict(score);
      const scanId = saveScan(db, localPath, score, verdict, issues);

      res.json({
        scanId,
        repoUrl: localPath,
        repoPath: localPath,
        score,
        verdict,
        verdictColor: getVerdictColor(verdict),
        totalIssues: issues.length,
        issues,
        severityCounts: {
          CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
          HIGH: issues.filter(i => i.severity === 'HIGH').length,
          MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
          LOW: issues.filter(i => i.severity === 'LOW').length,
        },
        scannerCounts: {
          secrets: issues.filter(i => i.scanner === 'secrets').length,
          dependencies: issues.filter(i => i.scanner === 'dependencies').length,
          pii: issues.filter(i => i.scanner === 'pii').length,
          codeSmells: issues.filter(i => i.scanner === 'code-smells').length,
          simulation: issues.filter(i => i.scanner === 'simulation').length,
        },
        simulation: simulationData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: `Scan failed: ${err.message}` });
    }
  });

  // Run AI agents analysis
  router.post('/agents/analyze', async (req, res) => {
    const { repoPath, scanResults } = req.body;
    if (!repoPath) return res.status(400).json({ error: 'repoPath is required' });

    try {
      const agents = await runAgents(repoPath, scanResults || { issues: [] });
      res.json({ agents });
    } catch (err) {
      res.status(500).json({ error: `Agent analysis failed: ${err.message}` });
    }
  });

  // Get scan by ID (for shareable reports)
  router.get('/scan/:scanId', (req, res) => {
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.scanId);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    const issues = db.prepare('SELECT * FROM issues WHERE scan_id = ?').all(scan.id);
    res.json({
      scanId: scan.id,
      repoUrl: scan.repo_url,
      repoPath: scan.repo_url,
      score: scan.score,
      verdict: scan.verdict,
      verdictColor: getVerdictColor(scan.verdict),
      totalIssues: scan.issue_count,
      issues: issues.map(i => ({
        scanner: i.scanner,
        severity: i.severity,
        title: i.title,
        description: i.description,
        filePath: i.file_path,
        lineNumber: i.line_number,
        codeSnippet: i.code_snippet,
        fixSuggestion: i.fix_suggestion,
      })),
      severityCounts: {
        CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
        HIGH: issues.filter(i => i.severity === 'HIGH').length,
        MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
        LOW: issues.filter(i => i.severity === 'LOW').length,
      },
      scannerCounts: {
        secrets: issues.filter(i => i.scanner === 'secrets').length,
        dependencies: issues.filter(i => i.scanner === 'dependencies').length,
        pii: issues.filter(i => i.scanner === 'pii').length,
        codeSmells: issues.filter(i => i.scanner === 'code-smells').length,
        simulation: issues.filter(i => i.scanner === 'simulation').length,
      },
      timestamp: scan.created_at,
    });
  });

  // Get source files with issue annotations for heatmap
  router.get('/scan/:scanId/files', (req, res) => {
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.scanId);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    const repoPath = scan.repo_url;
    const issues = db.prepare('SELECT * FROM issues WHERE scan_id = ?').all(scan.id);

    // Group issues by file
    const issuesByFile = {};
    for (const issue of issues) {
      if (!issue.file_path) continue;
      if (!issuesByFile[issue.file_path]) issuesByFile[issue.file_path] = [];
      issuesByFile[issue.file_path].push({
        lineNumber: issue.line_number,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        scanner: issue.scanner,
      });
    }

    // Read file contents
    const files = [];
    for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
      const fullPath = path.join(repoPath, filePath);
      let content = '';
      try {
        content = fs.readFileSync(fullPath, 'utf-8');
      } catch {
        content = '// File not accessible';
      }
      files.push({
        path: filePath,
        content,
        issues: fileIssues,
        totalLines: content.split('\n').length,
      });
    }

    // Sort by number of issues (most problematic first)
    files.sort((a, b) => b.issues.length - a.issues.length);
    res.json({ files });
  });

  // Scan history
  router.get('/history', (req, res) => {
    const scans = db.prepare('SELECT * FROM scans ORDER BY created_at DESC LIMIT 50').all();
    res.json(scans);
  });

  // Knowledge base patterns
  router.get('/patterns', (req, res) => {
    const patterns = db.prepare('SELECT * FROM patterns ORDER BY frequency DESC LIMIT 50').all();
    res.json(patterns);
  });

  return router;
};
