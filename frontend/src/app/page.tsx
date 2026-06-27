'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [archives, setArchives] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSave = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📦</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              WebArchive Saver
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Permanently save any webpage to the Wayback Machine</p>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-amber-400">{(stats.total_pages_saved / 1000000).toFixed(0)}M</p>
              <p className="text-gray-400 text-sm">Pages Saved</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-orange-400">{(stats.pages_today / 1000).toFixed(0)}K</p>
              <p className="text-gray-400 text-sm">Today</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-yellow-400">{(stats.total_size_gb / 1000).toFixed(0)}TB</p>
              <p className="text-gray-400 text-sm">Total Size</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-red-400">{(stats.domains_archived / 1000000).toFixed(1)}M</p>
              <p className="text-gray-400 text-sm">Domains</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page-to-save"
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSave}
              disabled={!url || loading}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Archiving...
                </>
              ) : '💾 Save Page'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Page Archived!</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">URL</p>
                <p className="font-mono text-amber-400 break-all">{result.url}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Archive Link</p>
                <a href={result.archive_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                  {result.archive_url}
                </a>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Captured At</p>
                <p className="text-white">{new Date(result.captured_at).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Page Size</p>
                <p className="text-white">{(result.page_size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-3xl mb-2">♾️</div>
            <h3 className="font-semibold">Permanent</h3>
            <p className="text-gray-400 text-sm">Saved forever</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-3xl mb-2">📸</div>
            <h3 className="font-semibold">Full Page</h3>
            <p className="text-gray-400 text-sm">Complete snapshot</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="font-semibold">Shareable</h3>
            <p className="text-gray-400 text-sm">Get permanent link</p>
          </div>
        </div>
      </div>
    </main>
  );
}
