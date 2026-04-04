import { Compass, Search, Keyboard, MousePointer, AlertTriangle, SkipForward, CheckCircle2, XCircle, Bot } from 'lucide-react';

const ACTION_ICONS = {
  navigate: Compass, inspect: Search, type: Keyboard, click: MousePointer,
  finding: AlertTriangle, skip: SkipForward, done: CheckCircle2, error: XCircle,
};

function SimulationResults({ simulation }) {
  if (!simulation) return null;
  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;

  const modeLabel = mode === 'ai-guided' ? 'AI-Guided (Claude Sonnet 4.6)' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-white font-semibold">AI Simulation</h3>
            <span className="text-xs text-white/30">{modeLabel}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">{log.length} steps</div>
          <div className={`text-xs ${issueCount > 0 ? 'text-[#ff3b30]' : 'text-white/30'}`}>
            {issueCount > 0 ? `${issueCount} issue${issueCount !== 1 ? 's' : ''} found` : 'No issues'}
          </div>
        </div>
      </div>

      <div className="relative pl-8 space-y-0">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />
        {log.map((entry, i) => {
          const IconComponent = ACTION_ICONS[entry.action] || Search;
          const isFinding = !!entry.finding;

          return (
            <div key={i} className="relative pb-2.5">
              <div className={`absolute -left-8 top-2.5 w-2 h-2 rounded-full z-10 ${isFinding ? 'bg-[#ff3b30]' : 'bg-white/20'}`} />
              <div className={`rounded-lg px-3 py-2 ${isFinding ? 'glass bg-[#ff3b30]/[0.04] border-[#ff3b30]/10' : 'glass'}`}>
                <div className="flex items-start gap-2">
                  <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isFinding ? 'text-[#ff3b30]/60' : 'text-white/25'}`} strokeWidth={1.5} />
                  <p className={`text-sm flex-1 ${isFinding ? 'text-white/70' : 'text-white/40'}`}>{entry.detail}</p>
                  <span className="text-[9px] text-white/15 flex-shrink-0">{entry.step}</span>
                </div>
                {entry.finding && (
                  <span className="inline-block mt-1 ml-5 text-[9px] font-semibold text-[#ff3b30]/70 bg-[#ff3b30]/10 px-2 py-0.5 rounded">
                    {entry.finding.severity} — {entry.finding.title}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SimulationResults;
