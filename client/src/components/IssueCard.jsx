import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SEVERITY_STYLES = {
  CRITICAL: { badge: 'bg-[#ff3b30]/15 text-[#ff3b30]', border: 'border-l-[#ff3b30]/40' },
  HIGH: { badge: 'bg-[#ff9500]/15 text-[#ff9500]', border: 'border-l-[#ff9500]/40' },
  MEDIUM: { badge: 'bg-[#ffcc00]/15 text-[#ffcc00]', border: 'border-l-[#ffcc00]/40' },
  LOW: { badge: 'bg-white/5 text-white/40', border: 'border-l-white/10' },
};

const SCANNER_LABELS = {
  secrets: 'Secrets',
  dependencies: 'Dependencies',
  pii: 'PII',
  'code-smells': 'Code Smells',
  simulation: 'Simulation',
};

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.MEDIUM;

  return (
    <div
      className={`glass rounded-xl overflow-hidden transition-all cursor-pointer border-l-2 ${style.border}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.badge}`}>
          {issue.severity}
        </span>
        <span className="text-sm font-medium text-white flex-1">{issue.title}</span>
        <span className="text-[10px] text-white/20 bg-white/[0.03] px-2 py-1 rounded">
          {SCANNER_LABELS[issue.scanner] || issue.scanner}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
          <p className="text-sm text-white/50">{issue.description}</p>

          {issue.filePath && (
            <div className="text-xs text-white/30">
              <span className="text-white/20">File:</span>{' '}
              <span className="text-white/60 font-mono">{issue.filePath}</span>
              {issue.lineNumber && <span className="text-white/20"> : line {issue.lineNumber}</span>}
            </div>
          )}

          {issue.codeSnippet && (
            <pre className="bg-white/[0.02] rounded-lg p-3 text-xs text-white/50 overflow-x-auto font-mono border border-white/[0.04]">
              {issue.codeSnippet}
            </pre>
          )}

          {issue.fixSuggestion && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
              <div className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">Fix</div>
              <p className="text-sm text-white/50">{issue.fixSuggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;
