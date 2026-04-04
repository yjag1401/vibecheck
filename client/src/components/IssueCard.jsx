import { useState } from 'react';
import { ChevronRight, XCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const SEV = {
  CRITICAL: { color: '#FF4ECD', bg: 'rgba(255, 78, 205, 0.1)', border: 'rgba(255, 78, 205, 0.3)', Icon: XCircle, label: 'Critical' },
  HIGH: { color: '#FFB84D', bg: 'rgba(255, 184, 77, 0.1)', border: 'rgba(255, 184, 77, 0.3)', Icon: AlertTriangle, label: 'High' },
  MEDIUM: { color: '#2BB6FF', bg: 'rgba(43, 182, 255, 0.1)', border: 'rgba(43, 182, 255, 0.3)', Icon: Info, label: 'Medium' },
  LOW: { color: '#888', bg: 'rgba(136, 136, 136, 0.1)', border: 'rgba(136, 136, 136, 0.3)', Icon: AlertOctagon, label: 'Low' },
};

const LABELS = { secrets: 'Secrets', dependencies: 'Dependencies', pii: 'PII', 'code-smells': 'Code Smells', simulation: 'Simulation' };

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEV[issue.severity] || SEV.MEDIUM;

  return (
    <div
      className="glass p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
      style={{ borderLeftWidth: '3px', borderLeftColor: s.color }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono"
              style={{ background: s.bg, color: s.color }}>
              <s.Icon className="w-3 h-3" />
              {s.label}
            </span>
            <span className="text-[10px] font-mono text-dim">{LABELS[issue.scanner] || issue.scanner}</span>
          </div>
          <h4 className="text-white font-medium mb-1">{issue.title}</h4>
          {issue.filePath && (
            <p className="text-xs font-mono text-dim mb-1">
              {issue.filePath}{issue.lineNumber ? `:${issue.lineNumber}` : ''}
            </p>
          )}
        </div>
        <button className="flex items-center gap-1 text-xs text-cyan hover:text-white transition-colors px-2 py-1"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          View fix
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-dim">{issue.description}</p>
          {issue.codeSnippet && (
            <pre className="bg-[#07070A] rounded-lg p-3 text-[10px] text-dim overflow-x-auto font-mono border border-[rgba(244,246,255,0.06)]">{issue.codeSnippet}</pre>
          )}
          {issue.fixSuggestion && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(14, 14, 20, 0.8)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <p className="text-[10px] font-mono uppercase tracking-wider text-cyan mb-2">Suggested Fix</p>
              <p className="text-sm text-white/80">{issue.fixSuggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;
