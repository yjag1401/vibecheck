import { Compass, Search, Keyboard, MousePointer, AlertTriangle, CheckCircle2, XCircle, Bot, Eye, Terminal, Globe, MessageSquare, Layers, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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
  finding:           { Icon: ShieldAlert,    label: 'Finding' },
  done:              { Icon: CheckCircle2,   label: 'Done' },
  error:             { Icon: XCircle,        label: 'Error' },
};

function SimulationResults({ simulation }) {
  if (!simulation) return null;
  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;
  const [showActions, setShowActions] = useState(true);

  const modeLabel = mode === 'mcp' ? 'MCP (Playwright + Claude Sonnet 4.6)' : mode === 'ai-guided' ? 'AI-Guided (Claude Sonnet 4.6)' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';

  const findings = log.filter(e => e.finding);
  const actions = log.filter(e => !e.finding && e.action !== 'done');
  const doneEntry = log.find(e => e.action === 'done');

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Simulation</h3>
              <span className="text-xs text-white/30">{modeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{actions.length}</div>
              <div className="text-[10px] text-white/25">Actions</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${findings.length > 0 ? 'text-[#ff3b30]' : 'text-white/30'}`}>{findings.length}</div>
              <div className="text-[10px] text-white/25">Breakpoints</div>
            </div>
          </div>
        </div>

        {/* How it works — one line explainer */}
        <div className="bg-white/[0.02] rounded-lg px-4 py-2.5 text-xs text-white/30 leading-relaxed">
          Claude Sonnet 4.6 launched a real browser, navigated the app, typed attack payloads, clicked buttons, and checked for crashes — acting as a malicious user, not a code analyzer.
        </div>
      </div>

      {/* ═══ BREAKPOINTS FOUND ═══ */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#ff3b30]/50 uppercase tracking-widest px-1 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Breakpoints Found
        </h4>

        {findings.length > 0 ? (
          findings.map((entry, i) => {
            const mapped = ACTION_MAP[entry.action] || ACTION_MAP.finding;
            const IconComponent = mapped.Icon;
            return (
              <div key={i} className="glass rounded-xl px-5 py-4 border-l-2 border-l-[#ff3b30]/50 bg-[#ff3b30]/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4 text-[#ff3b30]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded">
                        {entry.finding.severity}
                      </span>
                      <span className="text-sm font-semibold text-white/90">{entry.finding.title}</span>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{entry.detail}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass rounded-xl px-5 py-4 border-l-2 border-l-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white/30" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-white/50">No breakpoints found</p>
                <p className="text-xs text-white/25">App remained stable through all attack simulations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ AI ACTIONS — Step by step ═══ */}
      <div className="space-y-2">
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-2 text-xs font-semibold text-white/25 uppercase tracking-widest px-1 hover:text-white/40 transition-colors"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>What the AI Did ({actions.length} steps)</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showActions ? 'rotate-180' : ''}`} />
        </button>

        {showActions && (
          <div className="relative pl-10 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-3 bottom-3 w-px bg-white/[0.06]" />

            {actions.map((entry, i) => {
              const actionKey = entry.action || 'inspect';
              const mapped = ACTION_MAP[actionKey] || { Icon: Search, label: actionKey };
              const IconComponent = mapped.Icon;

              // Categorize the action for better readability
              const isInteraction = ['click', 'type', 'fill', 'handle_dialog'].includes(actionKey);
              const isObservation = ['snapshot', 'console_messages', 'evaluate', 'inspect'].includes(actionKey);
              const isNavigation = ['navigate'].includes(actionKey);

              return (
                <div key={i} className="relative pb-1.5">
                  {/* Timeline dot */}
                  <div className={`absolute -left-10 top-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 ${
                    isInteraction ? 'bg-white/[0.08] border border-white/[0.15]' :
                    isNavigation ? 'bg-white/[0.06] border border-white/[0.10]' :
                    'bg-white/[0.03] border border-white/[0.06]'
                  }`}>
                    <IconComponent className={`w-3 h-3 ${
                      isInteraction ? 'text-white/50' :
                      isNavigation ? 'text-white/40' :
                      'text-white/20'
                    }`} strokeWidth={2} />
                  </div>

                  {/* Step content */}
                  <div className={`rounded-lg px-4 py-2 ${
                    isInteraction ? 'glass' : 'bg-transparent'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-semibold uppercase tracking-wider w-16 flex-shrink-0 ${
                        isInteraction ? 'text-white/30' :
                        isNavigation ? 'text-white/25' :
                        'text-white/15'
                      }`}>
                        {mapped.label}
                      </span>
                      <p className={`text-sm flex-1 ${
                        isInteraction ? 'text-white/60' :
                        'text-white/35'
                      }`}>
                        {entry.detail}
                      </p>
                      <span className="text-[8px] text-white/10 flex-shrink-0">{entry.step}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Done entry */}
            {doneEntry && (
              <div className="relative pb-1.5">
                <div className="absolute -left-10 top-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 bg-white/[0.06] border border-white/[0.10]">
                  <CheckCircle2 className="w-3 h-3 text-white/40" strokeWidth={2} />
                </div>
                <div className="rounded-lg px-4 py-2 bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm text-white/40">{doneEntry.detail}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationResults;
