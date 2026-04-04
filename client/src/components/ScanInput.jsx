import { useState, useEffect } from 'react';
import { ScanSearch } from 'lucide-react';

function WinkingBuddy() {
  const [winking, setWinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinking(true);
      setTimeout(() => setWinking(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-5">
      {/* Head */}
      <rect x="15" y="10" width="50" height="45" rx="12" fill="#0E0E14" stroke="#00F0FF" strokeWidth="1.5" />
      {/* Antenna */}
      <line x1="40" y1="10" x2="40" y2="2" stroke="#00F0FF" strokeWidth="1.5" />
      <circle cx="40" cy="2" r="2.5" fill="#00F0FF" className="animate-pulse" />
      {/* Left eye */}
      <circle cx="30" cy="30" r="5" fill="#00F0FF" opacity="0.9">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Right eye — winks */}
      {winking ? (
        <line x1="45" y1="30" x2="55" y2="30" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <circle cx="50" cy="30" r="5" fill="#00F0FF" opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Mouth — small smile */}
      <path d="M 32 42 Q 40 48 48 42" fill="none" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <rect x="25" y="57" width="30" height="15" rx="5" fill="#0E0E14" stroke="#00F0FF" strokeWidth="1" />
      {/* Arms */}
      <line x1="25" y1="62" x2="15" y2="68" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="68;65;68" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="55" y1="62" x2="65" y2="68" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="68;65;68" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </line>
      {/* Screen lines on body */}
      <line x1="30" y1="62" x2="42" y2="62" stroke="#00F0FF" strokeWidth="1" opacity="0.4" />
      <line x1="30" y1="65" x2="38" y2="65" stroke="#00F0FF" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="68" x2="45" y2="68" stroke="#00F0FF" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function ScanInput({ onScan }) {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [enableSimulation, setEnableSimulation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'local' && !localPath.trim()) return;
    onScan({ url: mode === 'url' ? url.trim() : null, localPath: mode === 'local' ? localPath.trim() : null, enableSimulation });
  };

  return (
    <div className="max-w-2xl mx-auto py-16 fade-in">
      <div className="text-center mb-10">
        <WinkingBuddy />
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
          Audit Your<br />
          <span className="text-cyan">Vibe-Coded App</span>
        </h2>
        <p className="text-dim text-sm max-w-md mx-auto">
          Scan for secrets, vulnerabilities, PII leaks, and code smells. Score it 0-100.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-1 flex gap-1">
          <button type="button" onClick={() => setMode('url')}
            className={`flex-1 py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-all ${mode === 'url' ? 'bg-cyan text-bg' : 'text-dim hover:text-white'}`}>
            GitHub URL
          </button>
          <button type="button" onClick={() => setMode('local')}
            className={`flex-1 py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-all ${mode === 'local' ? 'bg-cyan text-bg' : 'text-dim hover:text-white'}`}>
            Local Path
          </button>
        </div>

        <input type="text"
          value={mode === 'url' ? url : localPath}
          onChange={(e) => mode === 'url' ? setUrl(e.target.value) : setLocalPath(e.target.value)}
          placeholder={mode === 'url' ? 'https://github.com/user/repo' : '/path/to/your/project'}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-cyan text-sm font-mono"
        />

        <label className="flex items-center gap-3 text-dim cursor-pointer hover:text-white/60 transition-colors">
          <div className={`w-9 h-5 rounded-full relative transition-colors ${enableSimulation ? 'bg-cyan' : 'bg-[#333]'}`}>
            <div className={`w-3.5 h-3.5 rounded-full absolute top-[3px] transition-transform ${enableSimulation ? 'translate-x-[18px] bg-bg' : 'translate-x-[3px] bg-dim'}`} />
          </div>
          <input type="checkbox" checked={enableSimulation} onChange={(e) => setEnableSimulation(e.target.checked)} className="sr-only" />
          <span className="text-xs">Enable AI Simulation (Playwright MCP + Claude)</span>
        </label>

        <button type="submit" className="w-full py-3 bg-cyan text-bg font-bold text-sm rounded-lg hover:bg-cyan/90 transition-colors uppercase tracking-wider">
          Scan Repository
        </button>
      </form>

      <div className="mt-10 grid grid-cols-4 gap-3 text-center">
        {[{ label: 'Scanners', value: '4' }, { label: 'Secret Patterns', value: '20+' }, { label: 'CVE Database', value: 'OSV.dev' }, { label: 'AI Agents', value: '5' }].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-3">
            <div className="text-lg font-bold text-cyan font-mono">{stat.value}</div>
            <div className="text-[10px] text-dim mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanInput;
