import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ScoreCircle from './ScoreCircle';
import IssueCard from './IssueCard';
import AgentResults from './AgentResults';
import Badges from './Badges';
import CodeHeatmap from './CodeHeatmap';
import ProtectRepo from './ProtectRepo';
import SimulationResults from './SimulationResults';

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
      data: [
        data.severityCounts.CRITICAL,
        data.severityCounts.HIGH,
        data.severityCounts.MEDIUM,
        data.severityCounts.LOW,
      ],
      backgroundColor: [
        'rgba(248, 113, 113, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(96, 165, 250, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const scannerChartData = {
    labels: ['Secrets', 'Dependencies', 'PII', 'Code Smells'],
    datasets: [{
      label: 'Issues Found',
      data: [
        data.scannerCounts.secrets,
        data.scannerCounts.dependencies,
        data.scannerCounts.pii,
        data.scannerCounts.codeSmells,
      ],
      backgroundColor: [
        'rgba(45, 212, 191, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(251, 146, 60, 0.8)',
      ],
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
    },
  };

  return (
    <div className="fade-in space-y-8">
      {/* Score + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-8 flex flex-col items-center justify-center">
          <ScoreCircle
            score={data.score}
            verdict={data.verdict}
            verdictColor={data.verdictColor}
          />
        </div>

        <div className="bg-surface rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Severity Breakdown</h3>
          <div className="w-48 mx-auto">
            <Pie data={severityChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Scanner Breakdown</h3>
          <Bar data={scannerChartData} options={barOptions} />
        </div>
      </div>

      {/* Achievement Badges */}
      <Badges data={data} />

      {/* Scan info + Share */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span>
            <span className="text-slate-500">Repo:</span>{' '}
            <span className="text-white font-mono">{data.repoUrl}</span>
          </span>
          <span>
            <span className="text-slate-500">Issues:</span>{' '}
            <span className="text-white font-bold">{data.totalIssues}</span>
          </span>
          <span>
            <span className="text-slate-500">Scan ID:</span>{' '}
            <span className="text-teal">{data.scanId}</span>
          </span>
          <button
            onClick={() => { navigator.clipboard.writeText(reportUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-teal/20 text-teal hover:bg-teal/30'}`}
          >
            {copied ? 'Copied!' : 'Share Report'}
          </button>
        </div>
        {/* Badge embed */}
        <div className="flex items-center gap-3">
          <img src={badgeUrl} alt="VibeCheck badge" className="h-5" />
          <code className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded flex-1 truncate">{badgeMarkdown}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(badgeMarkdown); setBadgeCopied(true); setTimeout(() => setBadgeCopied(false), 2000); }}
            className={`text-xs px-2 py-1 rounded transition-colors ${badgeCopied ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
          >
            {badgeCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* AI Simulation Timeline */}
      {data.simulation && <SimulationResults simulation={data.simulation} />}

      {/* Code Heatmap */}
      <CodeHeatmap scanId={data.scanId} />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-teal/20 text-teal'
                : 'bg-surface text-slate-400 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${data.totalIssues})` : `${f} (${data.severityCounts[f]})`}
          </button>
        ))}
      </div>

      {/* Issues */}
      <div className="space-y-2">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No issues found{filter !== 'all' ? ` with ${filter} severity` : ''}.
          </div>
        ) : (
          filteredIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)
        )}
      </div>

      {/* AI Agents */}
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
          } catch (err) {
            console.error('Agent analysis failed:', err);
          }
          setAgentsLoading(false);
        }}
      />

      {/* Protect This Repo */}
      <ProtectRepo repoUrl={data.repoUrl} />
    </div>
  );
}

export default ScanResults;
