import { Lock, Skull, Flame, Syringe, FileWarning, EyeOff, Drama, Sparkles, Shield, Gem } from 'lucide-react';

const BADGE_RULES = [
  { id: 'secret-keeper', name: 'Secret Keeper', Icon: Lock, description: 'Hardcoded secrets found', check: (d) => d.scannerCounts.secrets > 0 },
  { id: 'eval-explorer', name: 'Eval Explorer', Icon: Skull, description: 'eval() detected', check: (d) => d.issues.some(i => i.title === 'eval() Usage') },
  { id: 'dependency-hell', name: 'Dependency Hell', Icon: Flame, description: 'Vulnerable dependencies', check: (d) => d.scannerCounts.dependencies > 0 },
  { id: 'sql-survivor', name: 'SQL Injection', Icon: Syringe, description: 'SQL injection risk', check: (d) => d.issues.some(i => i.title === 'SQL Injection Risk') },
  { id: 'pii-leaker', name: 'PII Leaker', Icon: FileWarning, description: 'Personal data exposed', check: (d) => d.scannerCounts.pii > 0 },
  { id: 'silent-catcher', name: 'Silent Catcher', Icon: EyeOff, description: 'Empty catch blocks', check: (d) => d.issues.some(i => i.title === 'Empty Catch Block') },
  { id: 'xss-artist', name: 'XSS Risk', Icon: Drama, description: 'innerHTML without sanitization', check: (d) => d.issues.some(i => i.title.includes('innerHTML') || i.title.includes('document.write')) },
  { id: 'clean-room', name: 'Clean Room', Icon: Sparkles, description: 'Zero critical or high issues', check: (d) => d.severityCounts.CRITICAL === 0 && d.severityCounts.HIGH === 0 },
  { id: 'fortress', name: 'Fort Knox', Icon: Shield, description: 'No secrets leaked', check: (d) => d.scannerCounts.secrets === 0 },
  { id: 'perfect-score', name: 'Flawless', Icon: Gem, description: 'Score 95+ production-ready', check: (d) => d.score >= 95 },
];

function Badges({ data }) {
  const earned = BADGE_RULES.filter(b => b.check(data));
  if (earned.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Badges</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {earned.map((badge) => (
          <div key={badge.id} className="glass rounded-xl p-3 text-center transition-transform hover:scale-[1.02]">
            <badge.Icon className="w-5 h-5 mx-auto mb-1.5 text-white/50" strokeWidth={1.5} />
            <div className="text-xs font-semibold text-white/80">{badge.name}</div>
            <div className="text-[10px] text-white/25 mt-0.5">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges;
