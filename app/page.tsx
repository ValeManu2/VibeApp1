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
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif flex flex-col items-center px-6 transition-all duration-700">
      <div className="w-full max-w-lg pt-16">
        
        {!result ? (
          <div className="space-y-12 text-center animate-in fade-in duration-1000">
            {/* LOGO MINIMAL INTEGRATO */}
            <div className="flex justify-center">
              <div className="opacity-80">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="2 2" />
                  <path d="M12 12L12 7" />
                  <path d="M12 12l4 4" />
                  <circle cx="12" cy="12" r="1" fill="black" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-light italic tracking-tight">Cosa hai in mente?</h2>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">VibeApp • Music & Cinema</p>
            </div>

            <input 
              className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-all placeholder:text-black/10"
              value={text} 
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateVibe()} 
              placeholder="Esempio: Una serata piovosa..."
            />

            <button 
              onClick={generateVibe} 
              disabled={loading}
              className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4 hover:bg-black hover:text-white transition-all disabled:opacity-30"
            >
              {loading ? "Analisi..." : "Scopri"}
            </button>
          </div>
        ) : (
          <div className="pb-20 animate-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={() => setResult(null)} 
              className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors"
            >
              ← Indietro
            </button>
            
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-16 text-center italic leading-relaxed">
              — {result.summary} —
            </p>
            
            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic text-center tracking-[0.2em]">Selezione Musicale</h3>
              {result.songs?.map((s: any, i: number) => (
                <div key={i} className="mb-8 text-center group">
                  <h4 className="text-xl font-light group-hover:italic transition-all">{s.t}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{s.a}</p>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-2 gap-8">
              <section className="mb-12">
                <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic text-center tracking-[0.2em]">Cinema</h3>
                {result.movies?.map((m: any, i: number) => (
                  <div key={i} className="mb-6 text-center">
                    <h4 className="text-lg font-light leading-tight">{m.t}</h4>
                  </div>
                ))}
              </section>

              <section>
                <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2 italic text-center tracking-[0.2em]">Serie TV</h3>
                <div className="mb-6 text-center">
                  <h4 className="text-lg font-light leading-tight">{result.series?.[0]?.t}</h4>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
