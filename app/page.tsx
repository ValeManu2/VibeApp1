"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlaylist = async () => {
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
      alert("Errore");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <h2 className="text-4xl font-light mb-8 text-center tracking-tight">Come stai?</h2>
        
        <input 
          className="w-full bg-transparent border-b border-black/10 p-4 text-2xl text-center focus:outline-none focus:border-black transition-all mb-8"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generatePlaylist()}
          placeholder="..."
        />

        <div className="flex justify-center mb-16">
          <button 
            onClick={generatePlaylist}
            disabled={loading || !text}
            className="text-[10px] uppercase tracking-[0.3em] border border-black/20 px-8 py-3 hover:bg-black hover:text-[#faf9f6] transition-all disabled:opacity-20"
          >
            {loading ? "Analisi..." : "Scopri la tua musica"}
          </button>
        </div>

        {result && (
          <div className="space-y-6 pb-20 animate-in fade-in duration-1000">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-10">
              — {result.mood_summary} —
            </p>
            {result.tracks?.map((track: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-black/5 pb-4 group">
                <div>
                  <h3 className="text-lg font-light">{track.title}</h3>
                  <p className="text-[10px] uppercase opacity-40">{track.artist}</p>
                </div>
                <a 
                  href={track.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                >
                  Play
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
