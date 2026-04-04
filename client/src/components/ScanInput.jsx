import { useState } from 'react';
import { ScanSearch } from 'lucide-react';

function ScanInput({ onScan }) {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [enableSimulation, setEnableSimulation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'local' && !localPath.trim()) return;
    onScan({
      url: mode === 'url' ? url.trim() : null,
      localPath: mode === 'local' ? localPath.trim() : null,
      enableSimulation,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-20 fade-in">
      <div className="text-center mb-12">
        <ScanSearch className="w-12 h-12 text-white/30 mx-auto mb-5" strokeWidth={1} />
        <h2 className="text-5xl font-black text-white mb-4 tracking-tight leading-tight">
          Audit Your<br />Vibe-Coded App
        </h2>
        <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
          Scan for secrets, vulnerabilities, PII leaks, and code smells. Score it 0–100.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass rounded-xl p-1 flex gap-1">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'url' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            GitHub URL
          </button>
          <button
            type="button"
            onClick={() => setMode('local')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'local' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Local Path
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={mode === 'url' ? url : localPath}
            onChange={(e) => mode === 'url' ? setUrl(e.target.value) : setLocalPath(e.target.value)}
            placeholder={mode === 'url' ? 'https://github.com/user/repo' : '/path/to/your/project'}
            className="w-full glass rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/20 text-lg bg-transparent"
          />
        </div>

        <label className="flex items-center gap-3 text-white/40 cursor-pointer hover:text-white/60 transition-colors">
          <div className={`w-10 h-6 rounded-full relative transition-colors ${enableSimulation ? 'bg-white' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full absolute top-1 transition-transform ${enableSimulation ? 'translate-x-5 bg-black' : 'translate-x-1 bg-white/40'}`} />
          </div>
          <input type="checkbox" checked={enableSimulation} onChange={(e) => setEnableSimulation(e.target.checked)} className="sr-only" />
          <span className="text-sm">Enable AI Simulation (Puppeteer + Claude)</span>
        </label>

        <button
          type="submit"
          className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-white/90 transition-colors"
        >
          Scan Repository
        </button>
      </form>

      <div className="mt-14 grid grid-cols-4 gap-3 text-center">
        {[
          { label: 'Scanners', value: '4' },
          { label: 'Secret Patterns', value: '20+' },
          { label: 'CVE Database', value: 'OSV.dev' },
          { label: 'AI Agents', value: '5' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-[11px] text-white/30 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanInput;
