import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ScoreCircle from './ScoreCircle';
import IssueCard from './IssueCard';
import AgentResults from './AgentResults';
import Badges from './Badges';
import CodeHeatmap from './CodeHeatmap';
import SimulationResults from './SimulationResults';
import ProtectRepo from './ProtectRepo';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{ data: [data.severityCounts.CRITICAL, data.severityCounts.HIGH, data.severityCounts.MEDIUM, data.severityCounts.LOW],
      backgroundColor: ['#FF3B30', '#FF9500', '#FFD60A', '#555'], borderWidth: 0 }],
  };
  const scannerChartData = {
    labels: ['Secrets', 'Deps', 'PII', 'Smells'],
    datasets: [{ label: 'Issues', data: [data.scannerCounts.secrets, data.scannerCounts.dependencies, data.scannerCounts.pii, data.scannerCounts.codeSmells],
      backgroundColor: '#00F0FF', borderWidth: 0, borderRadius: 3 }],
  };
  const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#888', font: { size: 10 } } } } };
  const barOpts = { ...chartOpts, scales: { x: { ticks: { color: '#888', font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: '#888', stepSize: 1 }, grid: { color: '#333' } } } };

  return (
    <div className="fade-in space-y-5">
      {/* Score + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center card-hover">
          <ScoreCircle score={data.score} verdict={data.verdict} verdictColor={data.verdictColor} />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 card-hover">
          <h3 className="text-[10px] font-semibold text-dim uppercase tracking-widest mb-3">Severity</h3>
          <div className="w-40 mx-auto"><Pie data={severityChartData} options={chartOpts} /></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 card-hover">
          <h3 className="text-[10px] font-semibold text-dim uppercase tracking-widest mb-3">Scanners</h3>
          <Bar data={scannerChartData} options={barOpts} />
        </div>
      </div>

      {/* Severity counts row — Figma style */}
      <div className="grid grid-cols-4 gap-2">
        {[['CRITICAL', sc.CRITICAL, 'border-critical/40 text-critical'], ['HIGH', sc.HIGH, 'border-high/40 text-high'], ['MEDIUM', sc.MEDIUM, 'border-medium/40 text-medium'], ['LOW', sc.LOW, 'border-dim/40 text-dim']].map(([label, count, cls]) => (
          <div key={label} className={`bg-surface border ${cls} rounded-lg p-3 text-center`}>
            <div className="text-2xl font-black font-mono">{count}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">{label}</div>
          </div>
        ))}
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
