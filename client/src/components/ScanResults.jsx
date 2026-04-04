import { useState } from 'react';
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

  const filteredIssues = filter === 'all'
    ? data.issues
    : data.issues.filter((i) => i.severity === filter);

  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [data.severityCounts.CRITICAL, data.severityCounts.HIGH, data.severityCounts.MEDIUM, data.severityCounts.LOW],
      backgroundColor: ['rgba(255,59,48,0.7)', 'rgba(255,149,0,0.7)', 'rgba(255,204,0,0.7)', 'rgba(255,255,255,0.2)'],
      borderWidth: 0,
    }],
  };

  const scannerChartData = {
    labels: ['Secrets', 'Deps', 'PII', 'Code Smells'],
    datasets: [{
      label: 'Issues',
      data: [data.scannerCounts.secrets, data.scannerCounts.dependencies, data.scannerCounts.pii, data.scannerCounts.codeSmells],
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderWidth: 0,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } } },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.3)' }, grid: { display: false } },
      y: { ticks: { color: 'rgba(255,255,255,0.3)', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center card-hover">
          <ScoreCircle score={data.score} verdict={data.verdict} verdictColor={data.verdictColor} />
        </div>
        <div className="glass rounded-2xl p-6 space-y-4 card-hover">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Severity</h3>
          <div className="w-44 mx-auto"><Pie data={severityChartData} options={chartOptions} /></div>
        </div>
        <div className="glass rounded-2xl p-6 space-y-4 card-hover">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Scanners</h3>
          <Bar data={scannerChartData} options={barOptions} />
        </div>
      </div>

      <Badges data={data} />

      {/* Info + Share */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-6 text-sm text-white/40">
          <span><span className="text-white/25">Repo:</span> <span className="text-white font-mono">{data.repoUrl}</span></span>
          <span><span className="text-white/25">Issues:</span> <span className="text-white font-bold">{data.totalIssues}</span></span>
          <span><span className="text-white/25">ID:</span> <span className="text-white/60">{data.scanId}</span></span>
          <button
            onClick={() => { navigator.clipboard.writeText(reportUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`ml-auto glass px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}
          >
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={badgeUrl} alt="badge" className="h-5" />
          <code className="text-xs text-white/25 bg-white/[0.03] px-2 py-1 rounded flex-1 truncate">{badgeMarkdown}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(badgeMarkdown); setBadgeCopied(true); setTimeout(() => setBadgeCopied(false), 2000); }}
            className={`text-xs px-2 py-1 rounded transition-colors ${badgeCopied ? 'text-white' : 'text-white/30 hover:text-white'}`}
          >
            {badgeCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {data.simulation && <SimulationResults simulation={data.simulation} />}

      <CodeHeatmap scanId={data.scanId} />

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-white text-black' : 'glass text-white/40 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${data.totalIssues})` : `${f} (${data.severityCounts[f]})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-white/20">No issues found{filter !== 'all' ? ` with ${filter} severity` : ''}.</div>
        ) : (
          filteredIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)
        )}
      </div>

      <AgentResults
        agents={agents}
        loading={agentsLoading}
        onRun={async () => {
          setAgentsLoading(true);
          try {
            const res = await fetch('/api/agents/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ repoPath: data.repoPath, scanResults: data }),
            });
            const result = await res.json();
            setAgents(result.agents);
          } catch (err) { console.error('Agent analysis failed:', err); }
          setAgentsLoading(false);
        }}
      />

      <ProtectRepo repoUrl={data.repoUrl} />
    </div>
  );
}

export default ScanResults;
