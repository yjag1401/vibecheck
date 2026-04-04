import { useState, useEffect, useRef } from 'react';
import ScanInput from './components/ScanInput';
import ScanProgress from './components/ScanProgress';
import ScanResults from './components/ScanResults';
import { Loader2, AlertTriangle } from 'lucide-react';
import KnowledgeBase from './components/KnowledgeBase';

function App() {
  const [state, setState] = useState('input'); // input | scanning | results | error | loading
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);
  const skipHashChange = useRef(false);

  // Load report from hash on startup (e.g. #/report/7)
  useEffect(() => {
    const loadFromHash = async () => {
      // Skip if we just set the hash ourselves after a live scan
      if (skipHashChange.current) {
        skipHashChange.current = false;
        return;
      }
      const match = window.location.hash.match(/^#\/report\/(\d+)$/);
      if (!match) return;
      setState('loading');
      try {
        const res = await fetch(`/api/scan/${match[1]}`);
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setScanData(data);
        setState('results');
      } catch (err) {
        setError(err.message);
        setState('error');
      }
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
      const body = isLocal
        ? { path: localPath, enableSimulation }
        : { url, enableSimulation };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      setScanData(data);
      setState('results');
      skipHashChange.current = true;
      window.location.hash = `#/report/${data.scanId}`;
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  const handleReset = () => {
    setState('input');
    setScanData(null);
    setError(null);
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleReset}
          >
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#050505] font-black text-sm">
              VC
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">VibeCheck</h1>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">AI Code Auditor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setState('kb')}
              className={`text-sm transition-colors ${state === 'kb' ? 'text-white' : 'text-white/40 hover:text-white'}`}
            >
              Knowledge Base
            </button>
            {state !== 'input' && state !== 'kb' && (
              <button
                onClick={handleReset}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                New Scan
              </button>
            )}
            {state === 'kb' && (
              <button
                onClick={handleReset}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                New Scan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {state === 'input' && <ScanInput onScan={handleScan} />}
        {state === 'kb' && <KnowledgeBase onBack={handleReset} />}
        {state === 'loading' && (
          <div className="text-center py-20 fade-in">
            <Loader2 className="w-8 h-8 text-white/50 mx-auto mb-4 animate-spin" />
            <p className="text-white/40">Loading report...</p>
          </div>
        )}
        {state === 'scanning' && <ScanProgress />}
        {state === 'results' && scanData && (
          <ScanResults data={scanData} onReset={handleReset} />
        )}
        {state === 'error' && (
          <div className="text-center py-20 fade-in">
            <AlertTriangle className="w-12 h-12 text-white/60 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-white mb-2">Scan Failed</h2>
            <p className="text-white/40 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="glass px-6 py-2 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
