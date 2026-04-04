import { useState } from 'react';
import { Bot, Loader2, ChevronDown } from 'lucide-react';
import AgentAnimation from './AgentAnimation';

function AgentCard({ agent }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const promptMatch = agent.analysis.match(/```\n?([\s\S]*?)```/);
  const copyPrompt = promptMatch ? promptMatch[1].trim() : '';

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden cursor-pointer hover:border-cyan/30 transition-colors" onClick={() => setExpanded(!expanded)}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Bot className="w-4 h-4 text-cyan" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="text-white text-sm font-medium">{agent.name}</h3>
          <span className="text-[9px] text-dim">{agent.mode === 'ai' ? 'AI Analysis' : 'Template'}</span>
        </div>
        {copyPrompt && (
          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(copyPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`px-2.5 py-1 border rounded text-[9px] font-semibold uppercase tracking-wider transition-colors ${copied ? 'border-cyan text-cyan' : 'border-border text-dim hover:text-white hover:border-cyan'}`}>
            {copied ? 'Copied' : 'Copy Fix'}
          </button>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-dim transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <div className="text-xs text-dim leading-relaxed whitespace-pre-wrap">{agent.analysis}</div>
          {copyPrompt && (
            <div className="mt-3 bg-terminal border border-border rounded-lg p-3">
              <div className="text-[9px] font-semibold text-cyan mb-2 uppercase tracking-wider">Fix Prompt</div>
              <pre className="text-[10px] text-dim whitespace-pre-wrap font-mono">{copyPrompt}</pre>
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
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <Bot className="w-8 h-8 text-cyan mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-white mb-2">Multi-Agent Swarm Analysis</h3>
        <p className="text-dim mb-5 text-xs">5 specialized agents generate copy-paste fix prompts.</p>
        <button onClick={onRun} className="px-5 py-2.5 bg-cyan text-bg font-bold text-xs rounded-lg hover:bg-cyan/90 transition-colors uppercase tracking-wider">
          Run AI Agents
        </button>
      </div>
    );
  }
  if (loading) {
    return <AgentAnimation />;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold text-dim uppercase tracking-widest">Multi-Agent Swarm Analysis</h3>
      <div className="grid grid-cols-1 gap-1.5">
        {agents.map((agent, i) => <AgentCard key={i} agent={agent} />)}
      </div>
    </div>
  );
}

export default AgentResults;
