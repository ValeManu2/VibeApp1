"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlaylist = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Errore di connessione");
    }
    setLoading(false);
  };

  return (
    // Colore Bianco Panna Sporco (faf9f6)
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-serif">
      <div className="max-w-xl mx-auto px-6 min-h-screen flex flex-col justify-center">
        
        {/* Titolo Minimal in alto */}
        <div className="absolute top-10 left-10">
          <h1 className="text-xl tracking-tighter opacity-30">VIBE.</h1>
        </div>

        {/* Centro Pagina */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-light tracking-tight text-center">Come stai?</h2>
            <input 
              className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="..."
              onKeyDown={(e) => e.key === 'Enter' && generatePlaylist()}
            />
          </div>

          <div className="flex justify-center">
            <button 
              onClick={generatePlaylist}
              disabled={loading || !text}
              className="text-[10px] uppercase tracking-[0.3em] border border-black/20 px-10 py-3 hover:bg-black hover:text-white transition-all disabled:opacity-20"
            >
              {loading ? "Analisi..." : "Scopri la tua musica"}
            </button>
          </div>
        </div>

        {/* Risultati (appaiono sotto quando pronti) */}
        {result && result.tracks && (
          <div className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-10 text-center italic">
              — {result.mood_summary} —
            </p>
            <div className="space-y-8 mb-20">
              {result.tracks.map((track: any, i: number) => (
                <div key={i} className="flex justify-between items-end border-b border-black/5 pb-4 group">
                  <div className="flex gap-6 items-baseline">
                    <span className="text-[9px] opacity-20">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-light group-hover:italic transition-all">{track.title}</h3>
                      <p className="text-[10px] uppercase tracking-tighter opacity-50">{track.artist}</p>
                    </div>
                  </div>
                  <a 
                    href={track.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity underline decoration-1 underline-offset-4"
                  >
                    Play
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
