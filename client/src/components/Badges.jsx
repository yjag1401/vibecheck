const BADGE_RULES = [
  {
    id: 'secret-keeper',
    name: 'Secret Keeper',
    icon: '🤫',
    description: 'Hardcoded secrets found in source code',
    check: (data) => data.scannerCounts.secrets > 0,
    color: 'from-red-500/20 to-red-900/20 border-red-500/30',
  },
  {
    id: 'eval-explorer',
    name: 'Eval Explorer',
    icon: '💀',
    description: 'eval() detected — the nuclear option of JavaScript',
    check: (data) => data.issues.some(i => i.title === 'eval() Usage'),
    color: 'from-red-500/20 to-orange-900/20 border-red-500/30',
  },
  {
    id: 'dependency-hell',
    name: 'Dependency Hell',
    icon: '🔥',
    description: 'Vulnerable or hallucinated dependencies found',
    check: (data) => data.scannerCounts.dependencies > 0,
    color: 'from-orange-500/20 to-red-900/20 border-orange-500/30',
  },
  {
    id: 'sql-survivor',
    name: 'SQL Injection Survivor',
    icon: '💉',
    description: 'SQL injection risk detected',
    check: (data) => data.issues.some(i => i.title === 'SQL Injection Risk'),
    color: 'from-purple-500/20 to-red-900/20 border-purple-500/30',
  },
  {
    id: 'pii-leaker',
    name: 'PII Leaker',
    icon: '📋',
    description: 'Personal data exposed in source code',
    check: (data) => data.scannerCounts.pii > 0,
    color: 'from-yellow-500/20 to-orange-900/20 border-yellow-500/30',
  },
  {
    id: 'silent-catcher',
    name: 'Silent Catcher',
    icon: '🙈',
    description: 'Empty catch blocks swallowing errors',
    check: (data) => data.issues.some(i => i.title === 'Empty Catch Block'),
    color: 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30',
  },
  {
    id: 'xss-artist',
    name: 'XSS Artist',
    icon: '🎭',
    description: 'innerHTML or document.write without sanitization',
    check: (data) => data.issues.some(i => i.title.includes('innerHTML') || i.title.includes('document.write')),
    color: 'from-pink-500/20 to-purple-900/20 border-pink-500/30',
  },
  {
    id: 'clean-room',
    name: 'Clean Room',
    icon: '✨',
    description: 'Zero critical or high severity issues — impressive!',
    check: (data) => data.severityCounts.CRITICAL === 0 && data.severityCounts.HIGH === 0,
    color: 'from-green-500/20 to-teal-900/20 border-green-500/30',
  },
  {
    id: 'fortress',
    name: 'Fort Knox',
    icon: '🏰',
    description: 'No secrets leaked — your vault is sealed',
    check: (data) => data.scannerCounts.secrets === 0,
    color: 'from-green-500/20 to-emerald-900/20 border-green-500/30',
  },
  {
    id: 'perfect-score',
    name: 'Flawless',
    icon: '💎',
    description: 'Score 95+ — this code is production-ready',
    check: (data) => data.score >= 95,
    color: 'from-cyan-500/20 to-blue-900/20 border-cyan-500/30',
  },
];

function Badges({ data }) {
  const earned = BADGE_RULES.filter(b => b.check(data));

  if (earned.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Achievement Badges</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {earned.map((badge) => (
          <div
            key={badge.id}
            className={`bg-gradient-to-br ${badge.color} border rounded-xl p-3 text-center transition-transform hover:scale-105`}
          >
            <div className="text-3xl mb-1">{badge.icon}</div>
            <div className="text-xs font-bold text-white">{badge.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges;
