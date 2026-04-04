import { useState } from 'react';
import { Bot } from 'lucide-react';
import ScoreCircle from './ScoreCircle';
import IssueCard from './IssueCard';
import AgentResults from './AgentResults';
import Badges from './Badges';
import CodeHeatmap from './CodeHeatmap';
import SimulationResults from './SimulationResults';
import ProtectRepo from './ProtectRepo';

function SeverityDonut({ counts }) {
  const items = [
    { label: 'Critical', count: counts.CRITICAL, color: '#FF4ECD' },
    { label: 'High', count: counts.HIGH, color: '#FFB84D' },
    { label: 'Medium', count: counts.MEDIUM, color: '#2BB6FF' },
    { label: 'Low', count: counts.LOW, color: '#555' },
  ];
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  const r = 60, sw = 14, c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#1a1a24" strokeWidth={sw} />
        {items.map((item, i) => {
          const dash = (item.count / total) * c;
          const gap = c - dash;
          const o = offset;
          offset += dash;
          if (item.count === 0) return null;
          return (
            <circle key={i} cx="80" cy="80" r={r} fill="none"
              stroke={item.color} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${dash - 2} ${gap + 2}`} strokeDashoffset={-o}
              className="-rotate-90 origin-center"
              style={{ filter: `drop-shadow(0 0 6px ${item.color}40)`, transition: 'stroke-dasharray 0.8s ease' }} />
          );
        })}
        <text x="80" y="75" textAnchor="middle" className="fill-white text-2xl font-black font-mono">{total}</text>
        <text x="80" y="95" textAnchor="middle" className="fill-[#888] text-[10px] uppercase tracking-widest">Issues</text>
      </svg>
      <div className="grid grid-cols-4 gap-2 mt-4 w-full">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-1.5 justify-center">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
            <span className="text-[9px] text-dim font-mono truncate">{item.label}</span>
            <span className="text-[10px] font-bold font-mono" style={{ color: item.color }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScannerBars({ counts }) {
  const items = [
    { label: 'Secrets', count: counts.secrets, color: '#FF4ECD' },
    { label: 'Deps', count: counts.dependencies, color: '#7B61FF' },
    { label: 'PII', count: counts.pii, color: '#FFB84D' },
    { label: 'Code Smells', count: counts.codeSmells, color: '#00F0FF' },
  ];
  const max = Math.max(...items.map(i => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.label} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-dim font-mono uppercase tracking-wider">{item.label}</span>
            <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.count}</span>
          </div>
          <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.count / max) * 100, item.count > 0 ? 8 : 0)}%`,
                background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                boxShadow: `0 0 10px ${item.color}40`,
              }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScanResults({ data, onReset }) {
  const [filter, setFilter] = useState('all');
  const [agents, setAgents] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);

  const reportUrl = `${window.location.origin}/#/report/${data.scanId}`;
  const badgeUrl = `${window.location.origin}/api/badge/${data.scanId}`;
  const badgeMarkdown = `[![VibeCheck](${badgeUrl})](${reportUrl})`;

  const staticIssues = data.issues.filter(i => i.scanner !== 'simulation');
  const filteredIssues = filter === 'all' ? staticIssues : staticIssues.filter(i => i.severity === filter);
  const sc = { CRITICAL: staticIssues.filter(i => i.severity === 'CRITICAL').length, HIGH: staticIssues.filter(i => i.severity === 'HIGH').length, MEDIUM: staticIssues.filter(i => i.severity === 'MEDIUM').length, LOW: staticIssues.filter(i => i.severity === 'LOW').length };

  return (
    <div className="fade-in space-y-5">
      {/* Score + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center card-hover">
          <ScoreCircle score={data.score} verdict={data.verdict} verdictColor={data.verdictColor} />
        </div>
        <div className="glass rounded-2xl p-6 card-hover">
          <h3 className="text-[10px] font-mono font-semibold text-dim uppercase tracking-widest mb-4">Severity Breakdown</h3>
          <SeverityDonut counts={data.severityCounts} />
        </div>
        <div className="glass rounded-2xl p-6 card-hover">
          <h3 className="text-[10px] font-mono font-semibold text-dim uppercase tracking-widest mb-4">Scanner Results</h3>
          <ScannerBars counts={data.scannerCounts} />
        </div>
      </div>

      <Badges data={data} />

      {/* Info + Share */}
      <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-5 text-xs text-dim">
          <span><span className="text-[#555]">Repo:</span> <span className="text-white font-mono">{data.repoUrl}</span></span>
          <span><span className="text-[#555]">Issues:</span> <span className="text-white font-bold">{data.totalIssues}</span></span>
          <span><span className="text-[#555]">ID:</span> <span className="text-dim">{data.scanId}</span></span>
          <button onClick={() => { navigator.clipboard.writeText(reportUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`ml-auto px-3 py-1 border border-border rounded text-[10px] font-medium transition-colors ${copied ? 'text-cyan border-cyan' : 'text-dim hover:text-white hover:border-cyan'}`}>
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={badgeUrl} alt="badge" className="h-5" />
          <code className="text-[10px] text-[#555] bg-terminal px-2 py-1 rounded flex-1 truncate font-mono">{badgeMarkdown}</code>
          <button onClick={() => { navigator.clipboard.writeText(badgeMarkdown); setBadgeCopied(true); setTimeout(() => setBadgeCopied(false), 2000); }}
            className={`text-[10px] px-2 py-1 rounded transition-colors ${badgeCopied ? 'text-cyan' : 'text-dim hover:text-white'}`}>
            {badgeCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* AI Simulation */}
      {data.simulation ? (
        <SimulationResults simulation={data.simulation} />
      ) : (
        data.issues.some(i => i.scanner === 'simulation') && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-cyan" strokeWidth={1.5} />
              <div>
                <h3 className="text-white font-semibold text-sm">AI Simulation</h3>
                <span className="text-xs text-dim">Simulation ran but detailed log not available for saved reports</span>
              </div>
            </div>
          </div>
        )
      )}

      <CodeHeatmap scanId={data.scanId} />

      {/* Static Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Issues Found</h2>
          <span className="text-sm font-mono text-dim">{filteredIssues.length} of {staticIssues.length}</span>
        </div>
        <div className="flex gap-2">
          {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filter === f ? 'bg-cyan/20 text-cyan border border-cyan/40' : 'text-dim hover:text-white hover:bg-white/5 border border-transparent'
              }`}>
              {f === 'all' ? `All (${staticIssues.length})` : `${f} (${sc[f]})`}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl"><p className="text-dim">No issues match this filter.</p></div>
          ) : filteredIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
        </div>
      </div>

      <AgentResults agents={agents} loading={agentsLoading}
        onRun={async () => {
          setAgentsLoading(true);
          try { const res = await fetch('/api/agents/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repoPath: data.repoPath, scanResults: data }) });
            const result = await res.json(); setAgents(result.agents);
          } catch (err) { console.error('Agent analysis failed:', err); }
          setAgentsLoading(false);
        }}
      />

      <ProtectRepo repoUrl={data.repoUrl} />
    </div>
  );
}

export default ScanResults;
