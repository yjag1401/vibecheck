const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer');

let Anthropic;
try { Anthropic = require('@anthropic-ai/sdk'); } catch { Anthropic = null; }

let MCPClient, StdioClientTransport;
try {
  const mcp = require('@modelcontextprotocol/sdk/client/index.js');
  MCPClient = mcp.Client;
  const transport = require('@modelcontextprotocol/sdk/client/stdio.js');
  StdioClientTransport = transport.StdioClientTransport;
} catch { MCPClient = null; }

// --- App startup helpers (unchanged) ---

function detectStartCommand(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.main && fs.existsSync(path.join(repoPath, pkg.main)))
        return { cmd: 'node', args: [pkg.main], cwd: repoPath };
      for (const f of ['server.js', 'index.js', 'app.js', 'src/index.js', 'src/server.js']) {
        if (fs.existsSync(path.join(repoPath, f)))
          return { cmd: 'node', args: [f], cwd: repoPath };
      }
      if (pkg.scripts?.start) return { cmd: 'npm', args: ['start'], cwd: repoPath };
      if (pkg.scripts?.dev) return { cmd: 'npm', args: ['run', 'dev'], cwd: repoPath };
    } catch {}
  }
  if (fs.existsSync(path.join(repoPath, 'app.py')))
    return { cmd: 'python3', args: ['app.py'], cwd: repoPath };
  return null;
}

function installDeps(repoPath) {
  if (fs.existsSync(path.join(repoPath, 'package.json')) && !fs.existsSync(path.join(repoPath, 'node_modules'))) {
    try { execSync('npm install --production --no-audit --no-fund', { cwd: repoPath, timeout: 30000, stdio: 'pipe' }); } catch {}
  }
}

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => { res.resume(); resolve(); });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`App did not respond on port ${port} within ${timeoutMs}ms`));
        else setTimeout(check, 500);
      });
      req.setTimeout(2000, () => req.destroy());
    };
    check();
  });
}

function startApp(repoPath) {
  return new Promise(async (resolve, reject) => {
    const startInfo = detectStartCommand(repoPath);
    if (!startInfo) return reject(new Error('Cannot detect how to start the app'));
    installDeps(repoPath);
    const port = 4000 + Math.floor(Math.random() * 1000);
    const env = { ...process.env, PORT: String(port) };
    const proc = spawn(startInfo.cmd, startInfo.args, { cwd: startInfo.cwd, env, stdio: 'pipe' });
    let errOutput = '';
    proc.stderr.on('data', (d) => { errOutput += d.toString(); });
    proc.stdout.on('data', () => {});
    proc.on('error', (err) => reject(err));
    proc.on('exit', (code) => {
      if (code !== null && code !== 0) reject(new Error(`App exited with code ${code}: ${errOutput.slice(0, 200)}`));
    });
    try { await waitForPort(port, 15000); resolve({ proc, port }); }
    catch (err) { proc.kill('SIGTERM'); reject(err); }
  });
}

// --- Puppeteer Scripted Simulation (fallback, unchanged) ---

async function runScriptedSimulation(page, baseUrl) {
  const log = [];
  log.push({ step: 1, action: 'navigate', detail: 'Opened the app homepage', finding: null });

  const inputs = await page.$$('input, textarea, select');
  const buttons = await page.$$('button, input[type="submit"]');
  const links = await page.$$('a[href]');
  log.push({ step: 2, action: 'inspect', detail: `Found ${inputs.length} input fields, ${buttons.length} buttons, ${links.length} links`, finding: null });

  const xssPayload = '<script>alert("xss")</script>';
  const firstInput = await page.$('input[type="text"], input:not([type]), textarea');
  if (firstInput) {
    await firstInput.type(xssPayload);
    log.push({ step: 3, action: 'type', detail: `Typed XSS payload into input field: ${xssPayload}`, finding: null });
    const submitBtn = await page.$('button[type="submit"], button, input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click().catch(() => {});
      await new Promise(r => setTimeout(r, 1500));
      log.push({ step: 4, action: 'click', detail: 'Clicked submit button', finding: null });
    }
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    if (bodyHtml.includes(xssPayload)) {
      log.push({ step: 5, action: 'finding', detail: 'XSS payload reflected unescaped in DOM — XSS confirmed', finding: { severity: 'CRITICAL', title: 'XSS Vulnerability — Reflected Script Injection' } });
    }
  }

  const sqlPayload = "' OR 1=1 --";
  const sqlInput = await page.$('input[type="text"], input:not([type])');
  if (sqlInput) {
    await sqlInput.click({ clickCount: 3 }).catch(() => {});
    await sqlInput.type(sqlPayload);
    const submitBtn = await page.$('button[type="submit"], button');
    if (submitBtn) { await submitBtn.click().catch(() => {}); await new Promise(r => setTimeout(r, 1000)); }
    log.push({ step: 6, action: 'type', detail: `Typed SQL injection payload: ${sqlPayload}`, finding: null });
  }

  const allButtons = await page.$$('button, a');
  let clickCount = 0;
  for (const btn of allButtons.slice(0, 5)) {
    try { await btn.click(); clickCount++; await new Promise(r => setTimeout(r, 500)); } catch {}
  }
  if (clickCount > 0) log.push({ step: 7, action: 'click', detail: `Clicked ${clickCount} interactive elements looking for crashes`, finding: null });

  for (const route of ['/api', '/api/users', '/api/admin']) {
    try {
      const resp = await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: 5000 });
      if (resp?.status() >= 500) {
        log.push({ step: log.length + 1, action: 'finding', detail: `Server error (HTTP ${resp.status()}) at ${route}`, finding: { severity: 'HIGH', title: `Server Error ${resp.status()} at ${route}` } });
      }
    } catch {}
  }

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
  return log;
}

// --- Playwright MCP Simulation (new) ---

function convertMCPToolsToAnthropic(mcpTools) {
  return mcpTools.map(tool => ({
    name: tool.name,
    description: tool.description || '',
    input_schema: tool.inputSchema || { type: 'object', properties: {} },
  }));
}

async function runMCPSimulation(baseUrl) {
  const anthropic = new Anthropic();
  const log = [];
  let mcpClient = null;
  let transport = null;

  try {
    // Spawn Playwright MCP server
    transport = new StdioClientTransport({
      command: 'npx',
      args: ['@playwright/mcp@latest', '--headless'],
    });

    mcpClient = new MCPClient({ name: 'vibecheck', version: '1.0.0' });
    await mcpClient.connect(transport);

    // Get available browser tools
    const { tools: mcpTools } = await mcpClient.listTools();
    const anthropicTools = convertMCPToolsToAnthropic(mcpTools);

    log.push({ step: 1, action: 'navigate', detail: `MCP connected — ${mcpTools.length} browser tools available`, finding: null });

    // System prompt for Claude
    const systemPrompt = `You are a security penetration tester auditing a web application at ${baseUrl}.
You have Playwright browser tools via MCP. Use them systematically to find vulnerabilities:

TESTING PLAN:
1. browser_navigate to "${baseUrl}" to open the app
2. browser_snapshot to see the page structure (accessibility tree)
3. Find input fields and test XSS:
   - browser_fill with value: <script>alert('XSS')</script>
   - browser_click the submit/add button
   - browser_snapshot to check if payload was reflected
4. Test SQL injection:
   - browser_fill input with: ' OR 1=1 --
   - Submit and check response
5. browser_console_messages to check for runtime JavaScript errors
6. browser_navigate to ${baseUrl}/api or ${baseUrl}/api/todos to check for exposed endpoints

After each action, use browser_snapshot to observe the result.
Be aggressive. Try different payloads. Report every vulnerability you find.
When done testing, respond with a text summary of your findings (no tool call).`;

    let messages = [{ role: 'user', content: systemPrompt }];
    let stepNum = 2;

    // Agentic loop — max 15 turns
    for (let turn = 0; turn < 15; turn++) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        tools: anthropicTools,
        messages,
      });

      messages.push({ role: 'assistant', content: response.content });

      // If Claude is done (end_turn = no more tool calls)
      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find(b => b.type === 'text');
        if (textBlock) {
          // Parse findings from Claude's summary
          const summary = textBlock.text;
          log.push({ step: stepNum, action: 'done', detail: summary.slice(0, 300), finding: null });

          // Check for XSS/vulnerability mentions in summary
          if (summary.toLowerCase().includes('xss') && (summary.toLowerCase().includes('confirmed') || summary.toLowerCase().includes('vulnerable') || summary.toLowerCase().includes('reflected'))) {
            log.push({ step: stepNum, action: 'finding', detail: 'AI confirmed XSS vulnerability during testing', finding: { severity: 'CRITICAL', title: 'XSS Vulnerability Confirmed by AI' } });
          }
          if (summary.toLowerCase().includes('sql injection') && (summary.toLowerCase().includes('confirmed') || summary.toLowerCase().includes('vulnerable'))) {
            log.push({ step: stepNum, action: 'finding', detail: 'AI confirmed SQL injection vulnerability', finding: { severity: 'CRITICAL', title: 'SQL Injection Confirmed by AI' } });
          }
        }
        break;
      }

      // Handle tool calls
      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const toolName = block.name;
          const toolInput = block.input || {};

          // Log the action
          let detail = toolName;
          if (toolName === 'browser_navigate') detail = `Navigate to ${toolInput.url || ''}`;
          else if (toolName === 'browser_fill') detail = `Fill "${(toolInput.value || '').slice(0, 60)}" into ${toolInput.element || 'field'}`;
          else if (toolName === 'browser_click') detail = `Click ${toolInput.element || toolInput.ref || 'element'}`;
          else if (toolName === 'browser_snapshot') detail = 'Snapshot — reading page structure';
          else if (toolName === 'browser_console_messages') detail = 'Reading console messages';
          else detail = `${toolName}(${JSON.stringify(toolInput).slice(0, 80)})`;

          log.push({ step: stepNum++, action: toolName.replace('browser_', ''), detail, finding: null });

          // Execute tool via MCP
          try {
            const result = await mcpClient.callTool({ name: toolName, arguments: toolInput });
            const resultText = (result.content || []).map(c => c.text || '').join('\n').slice(0, 2000);

            // Check for console errors in results
            if (toolName === 'browser_console_messages' && resultText.includes('error')) {
              log.push({ step: stepNum, action: 'finding', detail: `Console errors detected: ${resultText.slice(0, 200)}`,
                finding: { severity: 'HIGH', title: 'Runtime Console Errors' } });
            }

            // Check for alert dialogs (XSS confirmation)
            if (resultText.includes('alert') || resultText.includes('dialog')) {
              log.push({ step: stepNum, action: 'finding', detail: 'Browser dialog/alert triggered — possible XSS confirmation',
                finding: { severity: 'CRITICAL', title: 'XSS Confirmed — Dialog Triggered' } });
            }

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: resultText || 'OK',
            });
          } catch (err) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: `Error: ${err.message}`,
              is_error: true,
            });
          }
        }
      }

      if (toolResults.length > 0) {
        messages.push({ role: 'user', content: toolResults });
      }
    }

    return log;
  } finally {
    if (mcpClient) try { await mcpClient.close(); } catch {}
  }
}

// --- Main simulate function ---

async function simulate(repoPath) {
  const issues = [];
  const log = [];
  let proc = null;

  try {
    // Start the target app
    const app = await startApp(repoPath);
    proc = app.proc;
    const baseUrl = `http://localhost:${app.port}`;

    // Try MCP simulation first (Playwright + Claude tool use)
    const canMCP = process.env.ANTHROPIC_API_KEY && Anthropic && MCPClient && StdioClientTransport;

    if (canMCP) {
      try {
        const mcpLog = await runMCPSimulation(baseUrl);
        log.push(...mcpLog);

        // Extract findings from log
        for (const entry of mcpLog) {
          if (entry.finding) {
            issues.push({
              scanner: 'simulation', severity: entry.finding.severity, title: entry.finding.title,
              description: entry.detail, filePath: null, lineNumber: null, codeSnippet: null,
              fixSuggestion: 'Fix the vulnerability found during AI-powered runtime simulation.',
            });
          }
        }

        if (issues.length === 0) {
          log.push({ step: log.length + 1, action: 'done', detail: 'MCP simulation complete — no vulnerabilities detected. App appears stable.', finding: null });
          issues.push({ scanner: 'simulation', severity: 'LOW', title: 'Simulation Complete — App Stable',
            description: `MCP simulation completed ${log.length} steps with no issues.`,
            filePath: null, lineNumber: null, codeSnippet: null,
            fixSuggestion: 'No action needed.',
          });
        }

        return { issues, log, mode: 'mcp' };
      } catch (mcpErr) {
        // MCP failed — fall back to Puppeteer scripted
        log.push({ step: 1, action: 'error', detail: `MCP failed (${mcpErr.message}) — falling back to scripted simulation`, finding: null });
      }
    }

    // Fallback: Puppeteer scripted simulation
    const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      const consoleErrorSet = new Set();

      page.on('dialog', async (dialog) => {
        log.push({ step: log.length + 1, action: 'finding', detail: `JavaScript alert() triggered: "${dialog.message()}" — XSS payload executed`,
          finding: { severity: 'CRITICAL', title: 'XSS Confirmed — alert() Executed' } });
        await dialog.dismiss();
      });
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrorSet.add(msg.text()); });
      page.on('pageerror', (err) => consoleErrorSet.add(err.message));

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const simLog = await runScriptedSimulation(page, baseUrl);
      log.push(...simLog);

      for (const entry of simLog) {
        if (entry.finding) {
          issues.push({ scanner: 'simulation', severity: entry.finding.severity, title: entry.finding.title,
            description: entry.detail, filePath: null, lineNumber: null, codeSnippet: null,
            fixSuggestion: 'Fix the vulnerability found during runtime simulation.' });
        }
      }

      for (const err of consoleErrorSet) {
        if (err.includes('favicon.ico') || err.includes('manifest.json')) continue;
        if (err.includes('Failed to load resource') && err.includes('404')) continue;
        issues.push({ scanner: 'simulation', severity: 'HIGH', title: 'Runtime Error Caught',
          description: `Console error during simulation: ${err}`,
          filePath: null, lineNumber: null, codeSnippet: err.substring(0, 200),
          fixSuggestion: 'Investigate and fix the runtime error.' });
      }

      if (issues.length === 0) {
        log.push({ step: log.length + 1, action: 'done', detail: 'Scripted simulation complete — no issues found.', finding: null });
        issues.push({ scanner: 'simulation', severity: 'LOW', title: 'Simulation Complete — App Stable',
          description: `Scripted simulation completed ${log.length} steps with no issues.`,
          filePath: null, lineNumber: null, codeSnippet: null, fixSuggestion: 'No action needed.' });
      } else {
        log.push({ step: log.length + 1, action: 'done', detail: `Simulation complete — found ${issues.length} issue(s).`, finding: null });
      }

      return { issues, log, mode: 'scripted' };
    } finally {
      await browser.close().catch(() => {});
    }
  } catch (err) {
    return {
      issues: [{ scanner: 'simulation', severity: 'MEDIUM', title: 'Simulation Could Not Run',
        description: `Failed to simulate: ${err.message}`, filePath: null, lineNumber: null,
        codeSnippet: null, fixSuggestion: 'Ensure the app can be started.' }],
      log: [{ step: 1, action: 'error', detail: `Simulation failed: ${err.message}`, finding: null }],
      mode: 'failed',
    };
  } finally {
    if (proc) { proc.kill('SIGTERM'); setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} }, 2000); }
  }
}

module.exports = { simulate };
