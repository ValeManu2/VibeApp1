"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateVibe = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif flex flex-col items-center px-6">
      <div className="w-full max-w-lg pt-20">
        {!result ? (
          <div className="space-y-12 text-center">
            <h2 className="text-4xl font-light italic tracking-tight">Cosa hai in mente?</h2>
            <input 
              className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-all"
              value={text} 
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateVibe()} 
              placeholder="..."
            />
            <button 
              onClick={generateVibe} 
              disabled={loading}
              className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4 hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              {loading ? "Analisi in corso..." : "Analizza Vibe"}
            </button>
          </div>
        ) : (
          <div className="pb-20 animate-in fade-in duration-1000">
            <button onClick={() => setResult(null)} className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20 hover:opacity-50">
              ← Nuova Frase
            </button>
            
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-16 text-center italic leading-relaxed">
              — {result.summary} —
            </p>
            
            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic">5 Canzoni (Apple Music)</h3>
              {result.songs?.map((s: any, i: number) => (
                <div key={i} className="mb-6">
                  <h4 className="text-xl font-light">{s.t}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{s.a}</p>
                </div>
              ))}
            </section>

            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic">2 Film (Letterboxd)</h3>
              {result.movies?.map((m: any, i: number) => (
                <div key={i} className="mb-6">
                  <h4 className="text-xl font-light">{m.t}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Film</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic">1 Serie TV</h3>
              <div className="mb-6">
                <h4 className="text-xl font-light">{result.series?.[0]?.t}</h4>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Serie TV</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
