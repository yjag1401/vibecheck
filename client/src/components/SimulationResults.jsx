import { Compass, Search, Keyboard, MousePointer, AlertTriangle, CheckCircle2, XCircle, Bot, Eye, Terminal, Globe, FileCode, MessageSquare, Layers, X } from 'lucide-react';

const ACTION_MAP = {
  navigate:          { Icon: Globe,          label: 'Navigate' },
  snapshot:          { Icon: Eye,            label: 'Snapshot' },
  click:             { Icon: MousePointer,   label: 'Click' },
  type:              { Icon: Keyboard,       label: 'Type' },
  fill:              { Icon: Keyboard,       label: 'Fill' },
  evaluate:          { Icon: Terminal,        label: 'Evaluate' },
  console_messages:  { Icon: MessageSquare,  label: 'Console' },
  handle_dialog:     { Icon: AlertTriangle,  label: 'Dialog' },
  tabs:              { Icon: Layers,         label: 'Tabs' },
  close:             { Icon: X,              label: 'Close' },
  inspect:           { Icon: Search,         label: 'Inspect' },
  finding:           { Icon: AlertTriangle,  label: 'Finding' },
  done:              { Icon: CheckCircle2,   label: 'Done' },
  error:             { Icon: XCircle,        label: 'Error' },
};

function SimulationResults({ simulation }) {
  if (!simulation) return null;
  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;

  const modeLabel = mode === 'mcp' ? 'MCP (Playwright + Claude Sonnet 4.6)' : mode === 'ai-guided' ? 'AI-Guided (Claude Sonnet 4.6)' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {/* Header */}
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

      {/* Timeline */}
      <div className="relative pl-10 space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/[0.06]" />

        {log.map((entry, i) => {
          const actionKey = entry.action || 'inspect';
          const mapped = ACTION_MAP[actionKey] || { Icon: Search, label: actionKey };
          const IconComponent = mapped.Icon;
          const isFinding = !!entry.finding;
          const isDone = actionKey === 'done';
          const isError = actionKey === 'error';

          return (
            <div key={i} className="relative pb-2">
              {/* Timeline dot */}
              <div className={`absolute -left-10 top-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 ${
                isFinding ? 'bg-[#ff3b30]/20 border border-[#ff3b30]/40' :
                isDone ? 'bg-white/10 border border-white/20' :
                isError ? 'bg-[#ff3b30]/10 border border-[#ff3b30]/20' :
                'bg-white/[0.04] border border-white/[0.08]'
              }`}>
                <IconComponent className={`w-3 h-3 ${
                  isFinding ? 'text-[#ff3b30]' :
                  isDone ? 'text-white/60' :
                  isError ? 'text-[#ff3b30]/60' :
                  'text-white/30'
                }`} strokeWidth={2} />
              </div>

              {/* Content card */}
              <div className={`rounded-lg px-4 py-2.5 ${
                isFinding ? 'glass border-[#ff3b30]/15 bg-[#ff3b30]/[0.03]' :
                isDone ? 'bg-white/[0.02] border border-white/[0.06]' :
                'glass'
              }`}>
                {/* Action label + step number */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    isFinding ? 'text-[#ff3b30]/60' :
                    isDone ? 'text-white/30' :
                    'text-white/20'
                  }`}>
                    {mapped.label}
                  </span>
                  <span className="text-[9px] text-white/10">Step {entry.step}</span>
                </div>

                {/* Detail text */}
                <p className={`text-sm leading-relaxed ${
                  isFinding ? 'text-white/80 font-medium' :
                  isDone ? 'text-white/40' :
                  'text-white/50'
                }`}>
                  {entry.detail}
                </p>

                {/* Finding badge */}
                {entry.finding && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-[#ff3b30] bg-[#ff3b30]/10 px-2.5 py-1 rounded-md">
                      {entry.finding.severity} — {entry.finding.title}
                    </span>
                  </div>
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
