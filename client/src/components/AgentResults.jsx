import { useState } from 'react';
import { Bot, Loader2, ChevronDown } from 'lucide-react';

function AgentCard({ agent }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const promptMatch = agent.analysis.match(/```\n?([\s\S]*?)```/);
  const copyPrompt = promptMatch ? promptMatch[1].trim() : '';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (copyPrompt) {
      navigator.clipboard.writeText(copyPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden transition-all cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="px-5 py-4 flex items-center gap-3">
        <Bot className="w-4 h-4 text-white/25" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="text-white/80 font-medium text-sm">{agent.name}</h3>
          <span className="text-[10px] text-white/20">{agent.mode === 'ai' ? 'AI Analysis' : 'Template'}</span>
        </div>
        {copyPrompt && (
          <button
            onClick={handleCopy}
            className={`glass px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${copied ? 'text-white' : 'text-white/40 hover:text-white'}`}
          >
            {copied ? 'Copied' : 'Copy Fix'}
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
          <div className="text-sm text-white/40 leading-relaxed whitespace-pre-wrap">{agent.analysis}</div>
          {copyPrompt && (
            <div className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Fix Prompt</span>
                <button onClick={handleCopy} className="text-[11px] text-white/30 hover:text-white transition-colors">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-white/40 whitespace-pre-wrap font-mono">{copyPrompt}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentResults({ agents, loading, onRun }) {
  if (!agents && !loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Bot className="w-8 h-8 text-white/25 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-white mb-2">AI Agent Analysis</h3>
        <p className="text-white/30 mb-6 text-sm">5 specialized agents generate copy-paste fix prompts.</p>
        <button onClick={onRun} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors">
          Run AI Agents
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Loader2 className="w-8 h-8 text-white/30 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing...</h3>
        <p className="text-white/30 text-sm">5 AI agents reviewing your codebase</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">AI Agent Analysis</h3>
      {agents.map((agent, i) => <AgentCard key={i} agent={agent} />)}
    </div>
  );
}

export default AgentResults;
