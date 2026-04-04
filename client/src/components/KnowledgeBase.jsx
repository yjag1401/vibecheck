import { useState, useEffect } from 'react';

const SCANNER_BADGES = {
  'Secrets': { color: 'bg-red-500/20 text-red-400', icon: '🔑' },
  'Dependencies': { color: 'bg-purple-500/20 text-purple-400', icon: '📦' },
  'PII': { color: 'bg-yellow-500/20 text-yellow-400', icon: '👤' },
  'Code Smells': { color: 'bg-orange-500/20 text-orange-400', icon: '🔍' },
  'Simulation': { color: 'bg-blue-500/20 text-blue-400', icon: '🤖' },
};

function classifyPattern(name) {
  if (name.includes('Vulnerable Dependency') || name.includes('Hallucinated')) return 'Dependencies';
  if (name.includes('Email') || name.includes('Phone') || name.includes('Aadhaar') || name.includes('SSN') || name.includes('Credit Card') || name.includes('Console Logging Sensitive') || name.includes('PII')) return 'PII';
  if (name.includes('Key') || name.includes('Secret') || name.includes('Password') || name.includes('Token') || name.includes('Database URL') || name.includes('IP Address') || name.includes('JWT')) return 'Secrets';
  if (name.includes('Simulation') || name.includes('Runtime') || name.includes('XSS Confirmed')) return 'Simulation';
  return 'Code Smells';
}

function KnowledgeBase({ onBack }) {
  const [patterns, setPatterns] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/patterns').then(r => r.json()),
      fetch('/api/history').then(r => r.json()),
    ]).then(([p, h]) => {
      setPatterns(p);
      setHistory(h);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-4xl mb-4">&#9881;</div>
        <p className="text-slate-400">Loading knowledge base...</p>
      </div>
    );
  }

  const totalIssues = history.reduce((sum, s) => sum + (s.issue_count || 0), 0);
  const topPatterns = patterns.slice(0, 15);
  const maxFreq = topPatterns[0]?.frequency || 1;

  // Group by scanner type
  const scannerGroups = {};
  for (const p of patterns) {
    const type = classifyPattern(p.error_type);
    if (!scannerGroups[type]) scannerGroups[type] = { count: 0, totalFreq: 0 };
    scannerGroups[type].count++;
    scannerGroups[type].totalFreq += p.frequency;
  }

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">🧠</div>
        <h2 className="text-3xl font-bold text-white">Knowledge Base</h2>
        <p className="text-slate-400 mt-2">VibeCheck learns from every scan. Here's what AI-generated code gets wrong most often.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Repos Scanned', value: history.length, color: 'text-teal' },
          { label: 'Patterns Learned', value: patterns.length, color: 'text-purple-400' },
          { label: 'Total Issues Found', value: totalIssues.toLocaleString(), color: 'text-yellow-400' },
          { label: 'Top Mistake Frequency', value: `${maxFreq}x`, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-xl p-5 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scanner type breakdown */}
      <div className="bg-surface rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Issues by Category</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(SCANNER_BADGES).map(([type, badge]) => {
            const data = scannerGroups[type] || { count: 0, totalFreq: 0 };
            return (
              <div key={type} className="text-center">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-lg font-bold text-white">{data.totalFreq}</div>
                <div className="text-[10px] text-slate-400">{type}</div>
                <div className="text-[10px] text-slate-500">{data.count} patterns</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-surface rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Most Common AI Mistakes
        </h3>
        <div className="space-y-2">
          {topPatterns.map((p, i) => {
            const width = Math.max((p.frequency / maxFreq) * 100, 8);
            const type = classifyPattern(p.error_type);
            const badge = SCANNER_BADGES[type] || SCANNER_BADGES['Code Smells'];

            return (
              <div key={i} className="flex items-center gap-3">
                {/* Rank */}
                <span className="text-sm font-bold text-slate-500 w-6 text-right">
                  {i + 1}.
                </span>

                {/* Bar + label */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white font-medium truncate">
                      {p.error_type.replace('Detected', '').replace('Exposed', '').trim()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.color} flex-shrink-0`}>
                      {type}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-cyan-400 transition-all duration-700"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>

                {/* Count */}
                <span className="text-sm font-bold text-teal w-14 text-right">
                  {p.frequency}x
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-teal/20 text-teal rounded-lg hover:bg-teal/30 transition-colors"
        >
          Back to Scanner
        </button>
      </div>
    </div>
  );
}

export default KnowledgeBase;
