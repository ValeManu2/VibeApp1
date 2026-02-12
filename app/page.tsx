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
          'Cache-Control': 'no-cache' // Evita di mostrare vecchi risultati memorizzati
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      alert(e.message || "Errore di connessione");
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
              placeholder="Scrivi il tuo mood..."
            />
            <button 
              onClick={generateVibe} 
              disabled={loading}
              className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4 hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              {loading ? "Sto cercando..." : "Analizza Vibe"}
            </button>
          </div>
        ) : (
          <div className="pb-20 animate-in fade-in duration-1000">
            <button onClick={() => setResult(null)} className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20 hover:opacity-50">
              ← Cambia Mood
            </button>
            
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-16 text-center italic leading-relaxed px-4">
              — {result.summary} —
            </p>
            
            <section className="mb-16">
              <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 mb-8 border-b pb-2 italic">Dalla libreria Apple Music</h3>
              {result.tracks?.map((t: any, i: number) => (
                <div key={i} className="mb-8 group">
                  <h4 className="text-xl font-light group-hover:italic transition-all">{t.title}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{t.artist}</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 mb-8 border-b pb-2 italic">Dal catalogo Letterboxd</h3>
              {result.media?.map((m: any, i: number) => (
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
