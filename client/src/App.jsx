import { useState, useEffect, useRef } from 'react';
import ScanInput from './components/ScanInput';
import ScanProgress from './components/ScanProgress';
import ScanResults from './components/ScanResults';
import { Loader2, AlertTriangle } from 'lucide-react';
import KnowledgeBase from './components/KnowledgeBase';

function App() {
  const [state, setState] = useState('input');
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);
  const skipHashChange = useRef(false);

  useEffect(() => {
    const loadFromHash = async () => {
      if (skipHashChange.current) { skipHashChange.current = false; return; }
      const match = window.location.hash.match(/^#\/report\/(\d+)$/);
      if (!match) return;
      setState('loading');
      try {
        const res = await fetch(`/api/scan/${match[1]}`);
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setScanData(data);
        setState('results');
      } catch (err) { setError(err.message); setState('error'); }
    };
    loadFromHash();
    window.addEventListener('hashchange', loadFromHash);
    return () => window.removeEventListener('hashchange', loadFromHash);
  }, []);

  const handleScan = async ({ url, localPath, enableSimulation }) => {
    setState('scanning');
    setError(null);
    try {
      const isLocal = !!localPath;
      const endpoint = isLocal ? '/api/scan-local' : '/api/scan';
      const body = isLocal ? { path: localPath, enableSimulation } : { url, enableSimulation };
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setScanData(data);
      setState('results');
      skipHashChange.current = true;
      window.location.hash = `#/report/${data.scanId}`;
    } catch (err) { setError(err.message); setState('error'); }
  };

  const handleReset = () => { setState('input'); setScanData(null); setError(null); window.location.hash = ''; };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <header className="border-b border-border px-6 py-3 sticky top-0 z-50 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleReset}>
            <svg width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0">
              {/* Outer ring */}
              <circle cx="16" cy="16" r="14" fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity="0.3" />
              <circle cx="16" cy="16" r="14" fill="none" stroke="#00F0FF" strokeWidth="1.5"
                strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round"
                className="group-hover:animate-spin" style={{ animationDuration: '3s' }} />
              {/* Inner shield */}
              <path d="M16 6 L26 11 L26 18 C26 23 21 27 16 29 C11 27 6 23 6 18 L6 11 Z"
                fill="rgba(0,240,255,0.08)" stroke="#00F0FF" strokeWidth="1" />
              {/* Check mark */}
              <path d="M11 16 L14.5 19.5 L21 13" fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Corner dots */}
              <circle cx="16" cy="4" r="1" fill="#00F0FF" opacity="0.6" />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight leading-none">
                Vibe<span className="text-cyan">Check</span>
              </span>
              <span className="text-[8px] text-dim uppercase tracking-[0.2em] leading-none mt-0.5">AI Auditor</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setState('kb')} className={`text-xs uppercase tracking-wider transition-colors ${state === 'kb' ? 'text-cyan' : 'text-dim hover:text-white'}`}>
              Knowledge Base
            </button>
            {(state !== 'input') && (
              <button onClick={handleReset} className="text-xs uppercase tracking-wider text-dim hover:text-white transition-colors">New Scan</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {state === 'input' && <ScanInput onScan={handleScan} />}
        {state === 'kb' && <KnowledgeBase onBack={handleReset} />}
        {state === 'loading' && (
          <div className="text-center py-20 fade-in">
            <Loader2 className="w-6 h-6 text-cyan mx-auto mb-4 animate-spin" />
            <p className="text-dim text-sm">Loading report...</p>
          </div>
        )}
        {state === 'scanning' && <ScanProgress />}
        {state === 'results' && scanData && <ScanResults data={scanData} onReset={handleReset} />}
        {state === 'error' && (
          <div className="text-center py-20 fade-in">
            <AlertTriangle className="w-10 h-10 text-critical mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-white mb-2">Scan Failed</h2>
            <p className="text-dim mb-6 text-sm">{error}</p>
            <button onClick={handleReset} className="px-5 py-2 border border-border text-dim rounded-lg hover:text-white hover:border-cyan transition-colors text-sm">Try Again</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
