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
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-cyan rounded-md flex items-center justify-center text-bg font-black text-xs">VC</div>
            <span className="text-sm font-bold text-cyan tracking-wide">VibeCheck</span>
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
