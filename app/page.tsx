"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateVibe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) { alert("Errore di analisi"); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif flex flex-col items-center px-6">
      <div className="w-full max-w-lg pt-20">
        {!result ? (
          <div className="space-y-12 text-center">
            <h2 className="text-4xl font-light italic tracking-tight">Come ti senti?</h2>
            <input 
              className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-all"
              value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateVibe()} placeholder="..."
            />
            <button onClick={generateVibe} className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4 hover:bg-black hover:text-white transition-all">
              {loading ? "Sto analizzando..." : "Analizza Vibe"}
            </button>
          </div>
        ) : (
          <div className="pb-20 animate-in fade-in duration-1000">
            <button onClick={() => setResult(null)} className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20">← Nuova frase</button>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-16 text-center italic leading-relaxed">
              — {result.mood_summary} —
            </p>
            
            <section className="mb-16">
              <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 mb-8 border-b pb-2">Music Selection</h3>
              {result.music_tracks?.map((t: any, i: number) => (
                <div key={i} className="mb-8 group">
                  <h4 className="text-xl font-light group-hover:italic transition-all">{t.title}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{t.artist}</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 mb-8 border-b pb-2">Cinema & Series</h3>
              {result.movies_tv_shows?.map((m: any, i: number) => (
                <div key={i} className="mb-8 group">
                  <h4 className="text-xl font-light group-hover:italic transition-all">{m.title}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{m.type}</p>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
