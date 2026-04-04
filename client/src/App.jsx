import { useState, useEffect } from 'react';
import ScanInput from './components/ScanInput';
import ScanProgress from './components/ScanProgress';
import ScanResults from './components/ScanResults';

function App() {
  const [state, setState] = useState('input'); // input | scanning | results | error | loading
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);

  // Load report from hash on startup (e.g. #/report/7)
  useEffect(() => {
    const loadFromHash = async () => {
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
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center text-teal font-bold text-lg">
              VC
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VibeCheck</h1>
              <p className="text-xs text-slate-400">AI Code Auditor</p>
            </div>
          </div>
          {state !== 'input' && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              New Scan
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {state === 'input' && <ScanInput onScan={handleScan} />}
        {state === 'loading' && (
          <div className="text-center py-20 fade-in">
            <div className="inline-block animate-spin text-4xl mb-4">&#9881;</div>
            <p className="text-slate-400">Loading report...</p>
          </div>
        )}
        {state === 'scanning' && <ScanProgress />}
        {state === 'results' && scanData && (
          <ScanResults data={scanData} onReset={handleReset} />
        )}
        {state === 'error' && (
          <div className="text-center py-20 fade-in">
            <div className="text-6xl mb-4">&#x26A0;</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Scan Failed</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-teal/20 text-teal rounded-lg hover:bg-teal/30 transition-colors"
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
