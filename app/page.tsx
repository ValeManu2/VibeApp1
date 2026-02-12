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
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif flex flex-col items-center px-6">
      <div className="w-full max-w-lg pt-20">
        {!result ? (
          <div className="space-y-12 text-center">
            <h2 className="text-4xl font-light italic">Come stai?</h2>
            <input 
              className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black"
              value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateVibe()} placeholder="..."
            />
            <button onClick={generateVibe} className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4">
              {loading ? "Analisi..." : "Scopri"}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 pb-20">
            <button onClick={() => setResult(null)} className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20">← Nuova Ricerca</button>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-12 italic text-center">— {result.mood_summary} —</p>
            
            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-40 mb-6 border-b pb-2">Music</h3>
              {result.music_tracks?.map((t: any, i: number) => (
                <div key={i} className="mb-6 border-b border-black/5 pb-4">
                  <h4 className="text-lg font-light">{t.title}</h4>
                  <p className="text-[10px] opacity-50 uppercase mb-3">{t.artist}</p>
                  <div className="flex gap-2">
                    <a href={t.apple} target="_blank" className="text-[8px] border border-black/20 px-2 py-1">Apple Music</a>
                    <a href={t.amazon} target="_blank" className="text-[8px] border border-black/20 px-2 py-1">Amazon Music</a>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-[10px] uppercase opacity-40 mb-6 border-b pb-2">Cinema</h3>
              {result.movies_tv_shows?.map((m: any, i: number) => (
                <div key={i} className="mb-6 border-b border-black/5 pb-4">
                  <h4 className="text-lg font-light">{m.title}</h4>
                  <p className="text-[10px] opacity-50 uppercase mb-3">{m.type}</p>
                  <div className="flex gap-2">
                    <a href={m.letterboxd} target="_blank" className="text-[8px] border border-black/20 px-2 py-1">Letterboxd</a>
                    <a href={m.tomatoes} target="_blank" className="text-[8px] border border-black/20 px-2 py-1">Tomatoes</a>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
