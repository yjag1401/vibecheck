import { useState, useEffect } from 'react';
import { Lock, Package, UserCheck, Code2, Bot, Brain, Loader2 } from 'lucide-react';

const SCANNER_BADGES = {
  'Secrets': { Icon: Lock },
  'Dependencies': { Icon: Package },
  'PII': { Icon: UserCheck },
  'Code Smells': { Icon: Code2 },
  'Simulation': { Icon: Bot },
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
    ]).then(([p, h]) => { setPatterns(p); setHistory(h); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-white/30 mx-auto mb-4 animate-spin" />
        <p className="text-white/30">Loading...</p>
      </div>
    );
  }

  const totalIssues = history.reduce((sum, s) => sum + (s.issue_count || 0), 0);
  const topPatterns = patterns.slice(0, 15);
  const maxFreq = topPatterns[0]?.frequency || 1;

  const scannerGroups = {};
  for (const p of patterns) {
    const type = classifyPattern(p.error_type);
    if (!scannerGroups[type]) scannerGroups[type] = { count: 0, totalFreq: 0 };
    scannerGroups[type].count++;
    scannerGroups[type].totalFreq += p.frequency;
  }

  return (
    <div className="fade-in space-y-8">
      <div className="text-center">
        <Brain className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1} />
        <h2 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h2>
        <p className="text-white/30 mt-2">What AI-generated code gets wrong most often.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Repos Scanned', value: history.length },
          { label: 'Patterns Learned', value: patterns.length },
          { label: 'Total Issues', value: totalIssues.toLocaleString() },
          { label: 'Top Frequency', value: `${maxFreq}x` },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-5 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-white/25 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-4">By Category</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(SCANNER_BADGES).map(([type, badge]) => {
            const data = scannerGroups[type] || { count: 0, totalFreq: 0 };
            return (
              <div key={type} className="text-center">
                <badge.Icon className="w-5 h-5 mx-auto mb-1 text-white/25" strokeWidth={1.5} />
                <div className="text-lg font-bold text-white">{data.totalFreq}</div>
                <div className="text-[10px] text-white/25">{type}</div>
                <div className="text-[10px] text-white/15">{data.count} patterns</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-5">Most Common AI Mistakes</h3>
        <div className="space-y-3">
          {topPatterns.map((p, i) => {
            const width = Math.max((p.frequency / maxFreq) * 100, 6);
            const type = classifyPattern(p.error_type);

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/20 w-5 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white/70 font-medium truncate">
                      {p.error_type.replace('Detected', '').replace('Exposed', '').trim()}
                    </span>
                    <span className="text-[9px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded flex-shrink-0">{type}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-white/30 transition-all duration-700" style={{ width: `${width}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white/50 w-14 text-right">{p.frequency}x</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="glass px-6 py-2 text-white/50 rounded-lg hover:text-white transition-colors">
          Back to Scanner
        </button>
      </div>
    </div>
  );
}

export default KnowledgeBase;
