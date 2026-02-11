"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateVibe = async () => {
    setLoading(true);
    setResult(null); // Pulisce i risultati precedenti
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Errore di connessione con l'AI. Riprova!");
      console.error(e);
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setText("");
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif flex flex-col items-center">
      <div className="w-full max-w-lg px-6 flex flex-col min-h-screen">
        
        {/* Logo / Header */}
        <div className="pt-12 mb-auto">
          <h1 className="text-xl tracking-widest opacity-20 text-center uppercase">Vibe.</h1>
        </div>

        {/* Stato Iniziale: Domanda Centrale */}
        {!result && (
          <div className="mb-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-4 text-center">
              <h2 className="text-4xl font-light tracking-tight">Come stai?</h2>
              <input 
                className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-all placeholder:text-gray-200"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateVibe()}
                placeholder="..."
                autoFocus
              />
            </div>
            <div className="flex justify-center">
              <button 
                onClick={generateVibe}
                disabled={loading || !text}
                className="text-[10px] uppercase tracking-[0.4em] border border-black/20 px-12 py-4 hover:bg-black hover:text-white transition-all disabled:opacity-20"
              >
                {loading ? "Analisi..." : "Scopri"}
              </button>
            </div>
          </div>
        )}

        {/* Stato Risultati: Playlist & Film/Serie TV */}
        {result && (
          <div className="pb-20 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-between items-center mb-16">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest italic">
                — {result.mood_summary} —
              </p>
              <button 
                onClick={reset}
                className="text-[9px] uppercase tracking-widest border-b border-black/20 hover:border-black transition-all pb-1"
              >
                ← Nuova Ricerca
              </button>
            </div>

            {/* Sezione Musica */}
            {result.music_tracks && result.music_tracks.length > 0 && (
              <div className="mb-16">
                <h3 className="text-xs uppercase tracking-widest opacity-50 mb-6 border-b pb-2">Musica</h3>
                <div className="space-y-8">
                  {result.music_tracks.map((track: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-black/5 pb-4 group">
                      <div className="pr-4">
                        <h4 className="text-lg font-light leading-tight group-hover:italic transition-all">{track.title}</h4>
                        <p className="text-[10px] uppercase opacity-40 tracking-tighter">{track.artist}</p>
                      </div>
                      <a 
                        href={track.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-[#faf9f6] transition-all"
                      >
                        Play
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sezione Film & Serie TV */}
            {result.movies_tv_shows && result.movies_tv_shows.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest opacity-50 mb-6 border-b pb-2">Film & Serie TV</h3>
                <div className="space-y-8">
                  {result.movies_tv_shows.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-black/5 pb-4 group">
                      <div className="pr-4">
                        <h4 className="text-lg font-light leading-tight group-hover:italic transition-all">{item.title}</h4>
                        <p className="text-[10px] uppercase opacity-40 tracking-tighter">{item.type}</p>
                      </div>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-[#faf9f6] transition-all"
                      >
                        Info
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto py-8 text-center opacity-10 text-[8px] uppercase tracking-[0.5em]">
          AI Vibe Curator
        </div>
      </div>
    </main>
  );
}
