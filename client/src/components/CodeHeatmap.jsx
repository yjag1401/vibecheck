import { useState, useEffect } from 'react';

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: 'text-red-400' },
  HIGH: { bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316', text: 'text-orange-400' },
  MEDIUM: { bg: 'rgba(234, 179, 8, 0.10)', border: '#eab308', text: 'text-yellow-400' },
  LOW: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', text: 'text-blue-400' },
};

function FileHeatmap({ file }) {
  const [expanded, setExpanded] = useState(false);
  const lines = file.content.split('\n');

  // Build a map of line number -> issues
  const lineIssueMap = {};
  for (const issue of file.issues) {
    if (issue.lineNumber) {
      if (!lineIssueMap[issue.lineNumber]) lineIssueMap[issue.lineNumber] = [];
      lineIssueMap[issue.lineNumber].push(issue);
    }
  }

  // Find the worst severity for the file
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const worstSeverity = file.issues.reduce((worst, i) => {
    return (severityOrder[i.severity] < severityOrder[worst]) ? i.severity : worst;
  }, 'LOW');

  const worstColor = SEVERITY_COLORS[worstSeverity];

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-slate-700/50">
      {/* File header */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: worstColor.border }}
        />
        <span className="font-mono text-sm text-teal flex-1">{file.path}</span>
        <span className="text-xs text-slate-400">
          {file.issues.length} issue{file.issues.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-slate-500">{file.totalLines} lines</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Code view */}
      {expanded && (
        <div className="border-t border-slate-700/50 overflow-x-auto">
          {/* Issues without line numbers (e.g. dependency CVEs) */}
          {file.issues.filter(i => !i.lineNumber).length > 0 && (
            <div className="px-4 py-2 space-y-1 border-b border-slate-700/30 bg-slate-800/50">
              {file.issues.filter(i => !i.lineNumber).map((iss, j) => {
                const col = SEVERITY_COLORS[iss.severity] || SEVERITY_COLORS.MEDIUM;
                return (
                  <div key={j} className="flex items-center gap-2 text-xs" style={{ color: col.border }}>
                    <span className="font-bold">{iss.severity}</span>
                    <span className="text-slate-300">{iss.title}</span>
                    <span className="text-slate-500">— {iss.description}</span>
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
              const severity = hasIssue
                ? issues.reduce((w, iss) => (severityOrder[iss.severity] < severityOrder[w]) ? iss.severity : w, 'LOW')
                : null;
              const colors = severity ? SEVERITY_COLORS[severity] : null;

              return (
                <div key={i}>
                  <div
                    className={`flex ${hasIssue ? 'relative' : ''}`}
                    style={hasIssue ? { backgroundColor: colors.bg } : undefined}
                  >
                    {/* Line number */}
                    <span className="select-none text-slate-600 text-right w-12 pr-3 flex-shrink-0 border-r border-slate-700/30 mr-3"
                      style={hasIssue ? { borderRightColor: colors.border, borderRightWidth: '3px' } : undefined}
                    >
                      {lineNum}
                    </span>
                    {/* Code */}
                    <code className={`flex-1 ${hasIssue ? 'text-white' : 'text-slate-400'}`}>
                      {line || ' '}
                    </code>
                    {/* Issue indicator */}
                    {hasIssue && (
                      <span className={`flex-shrink-0 px-2 text-[10px] font-bold ${colors.text} self-center`}>
                        {issues.map(iss => iss.title).join(', ')}
                      </span>
                    )}
                  </div>
                  {/* Issue detail tooltip below the line */}
                  {hasIssue && issues.map((iss, j) => (
                    <div
                      key={j}
                      className="flex pl-16 py-1 text-[11px]"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <span className={`font-bold ${colors.text} mr-2`}>
                        {iss.severity}
                      </span>
                      <span className="text-slate-400">{iss.description}</span>
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
    if (files) {
      setVisible(!visible);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/scan/${scanId}/files`);
      const data = await res.json();
      setFiles(data.files);
      setVisible(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={loadFiles}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            visible
              ? 'bg-teal/20 text-teal'
              : 'bg-surface text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          {loading ? 'Loading...' : visible ? 'Hide Code Heatmap' : 'View Code Heatmap'}
        </button>
        {files && (
          <span className="text-xs text-slate-500">
            {files.length} file{files.length !== 1 ? 's' : ''} with issues
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {visible && files && (
        <div className="space-y-3 fade-in">
          {/* Legend */}
          <div className="flex gap-4 text-xs text-slate-400">
            {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
              <div key={sev} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: col.border }} />
                <span>{sev}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
              <span>Clean</span>
            </div>
          </div>

          {files.map((file, i) => (
            <FileHeatmap key={i} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CodeHeatmap;
