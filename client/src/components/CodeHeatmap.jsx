import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'rgba(255,59,48,0.06)', border: '#ff3b30', text: 'text-[#ff3b30]/70' },
  HIGH: { bg: 'rgba(255,149,0,0.05)', border: '#ff9500', text: 'text-[#ff9500]/70' },
  MEDIUM: { bg: 'rgba(255,204,0,0.04)', border: '#ffcc00', text: 'text-[#ffcc00]/70' },
  LOW: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.2)', text: 'text-white/30' },
};

function FileHeatmap({ file }) {
  const [expanded, setExpanded] = useState(false);
  const lines = file.content.split('\n');
  const lineIssueMap = {};
  for (const issue of file.issues) {
    if (issue.lineNumber) {
      if (!lineIssueMap[issue.lineNumber]) lineIssueMap[issue.lineNumber] = [];
      lineIssueMap[issue.lineNumber].push(issue);
    }
  }

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const worstSeverity = file.issues.reduce((w, i) => (severityOrder[i.severity] < severityOrder[w]) ? i.severity : w, 'LOW');
  const worstColor = SEVERITY_COLORS[worstSeverity];

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: worstColor.border }} />
        <span className="font-mono text-sm text-white/60 flex-1">{file.path}</span>
        <span className="text-xs text-white/25">{file.issues.length} issues</span>
        <span className="text-xs text-white/15">{file.totalLines} lines</span>
        <ChevronDown className={`w-4 h-4 text-white/15 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="border-t border-white/[0.04] overflow-x-auto">
          {file.issues.filter(i => !i.lineNumber).length > 0 && (
            <div className="px-4 py-2 space-y-1 border-b border-white/[0.04] bg-white/[0.01]">
              {file.issues.filter(i => !i.lineNumber).map((iss, j) => {
                const col = SEVERITY_COLORS[iss.severity] || SEVERITY_COLORS.MEDIUM;
                return (
                  <div key={j} className="flex items-center gap-2 text-xs" style={{ color: col.border }}>
                    <span className="font-semibold text-[10px]">{iss.severity}</span>
                    <span className="text-white/40">{iss.title}</span>
                    <span className="text-white/20">— {iss.description}</span>
                  </div>
                );
              })}
            </div>
          )}
          <pre className="text-xs leading-relaxed">
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const issues = lineIssueMap[lineNum];
              const hasIssue = !!issues;
              const severity = hasIssue ? issues.reduce((w, iss) => (severityOrder[iss.severity] < severityOrder[w]) ? iss.severity : w, 'LOW') : null;
              const colors = severity ? SEVERITY_COLORS[severity] : null;

              return (
                <div key={i}>
                  <div className="flex" style={hasIssue ? { backgroundColor: colors.bg } : undefined}>
                    <span className="select-none text-white/15 text-right w-12 pr-3 flex-shrink-0 border-r mr-3"
                      style={hasIssue ? { borderRightColor: colors.border, borderRightWidth: '2px', borderRightStyle: 'solid' } : { borderRightColor: 'rgba(255,255,255,0.04)', borderRightWidth: '1px', borderRightStyle: 'solid' }}
                    >{lineNum}</span>
                    <code className={`flex-1 ${hasIssue ? 'text-white/70' : 'text-white/25'}`}>{line || ' '}</code>
                    {hasIssue && (
                      <span className={`flex-shrink-0 px-2 text-[9px] font-semibold self-center ${colors.text}`}>
                        {issues.map(iss => iss.title).join(', ')}
                      </span>
                    )}
                  </div>
                  {hasIssue && issues.map((iss, j) => (
                    <div key={j} className="flex pl-16 py-0.5 text-[10px]" style={{ backgroundColor: colors.bg }}>
                      <span className="font-semibold mr-2" style={{ color: colors.border, opacity: 0.6 }}>{iss.severity}</span>
                      <span className="text-white/25">{iss.description}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}

function CodeHeatmap({ scanId }) {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  const loadFiles = async () => {
    if (files) { setVisible(!visible); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/scan/${scanId}/files`);
      const data = await res.json();
      setFiles(data.files);
      setVisible(true);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button
          onClick={loadFiles}
          className={`glass px-4 py-2 rounded-lg text-sm font-medium transition-colors ${visible ? 'text-white bg-white/[0.08]' : 'text-white/40 hover:text-white'}`}
        >
          {loading ? 'Loading...' : visible ? 'Hide Heatmap' : 'View Code Heatmap'}
        </button>
        {files && <span className="text-xs text-white/20">{files.length} file{files.length !== 1 ? 's' : ''} with issues</span>}
      </div>

      {error && <p className="text-[#ff3b30]/70 text-sm">{error}</p>}

      {visible && files && (
        <div className="space-y-2 fade-in">
          <div className="flex gap-4 text-[10px] text-white/20">
            {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
              <div key={sev} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: col.border }} />
                <span>{sev}</span>
              </div>
            ))}
          </div>
          {files.map((file, i) => <FileHeatmap key={i} file={file} />)}
        </div>
      )}
    </div>
  );
}

export default CodeHeatmap;
