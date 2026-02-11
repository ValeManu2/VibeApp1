'use client';
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Errore tecnico. Riprova.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#fdfcf0] text-stone-800 flex flex-col items-center p-8 font-serif">
      <div className="max-w-xl w-full mt-20">
        {!result ? (
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-light">Cosa senti?</h1>
            <textarea
              className="w-full bg-transparent border-b border-stone-200 py-4 outline-none text-2xl text-center resize-none"
              placeholder="scrivi una frase..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={analyze}
              className="px-8 py-3 rounded-full border border-stone-800 hover:bg-stone-800 hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              {loading ? 'ANALISI IN CORSO...' : 'CREA PLAYLIST'}
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center">
              <h2 className="text-2xl italic mb-6">"{result.mood_summary}"</h2>
              <div className="flex justify-around border-y border-stone-200 py-6">
                <div>
                  <p className="text-4xl font-light">{Math.round(result.energy * 100)}%</p>
                  <p className="text-[10px] uppercase text-stone-400">Energia</p>
                </div>
                <div>
                  <p className="text-4xl font-light">{Math.round(result.valence * 100)}%</p>
                  <p className="text-[10px] uppercase text-stone-400">Positività</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-center text-stone-400">Selezione Brani</p>
              {result.tracks?.map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-stone-100 hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-medium text-lg">{t.title}</h3>
                    <p className="text-sm text-stone-500">{t.artist}</p>
                  </div>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + ' ' + t.artist)}`}
                    target="_blank" 
                    className="text-xl opacity-30 hover:opacity-100 transition-opacity"
                  >
                    ▶
                  </a>
                </div>
              ))}
            </div>
            <button onClick={() => setResult(null)} className="w-full text-[10px] uppercase tracking-widest text-stone-300 py-10">Ricomincia</button>
          </div>
        )}
      </div>
    </main>
  );
}