"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlaylist = async () => {
    setLoading(true);
    try {
      // PUNTA ALLA TUA CARTELLA ANALYZE
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Errore nella generazione");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      <div className="max-w-xl mx-auto px-6 py-20">
        <header className="mb-12">
          <h1 className="text-2xl font-light tracking-tighter mb-2 italic">VIBE.</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest">30 Custom Tracks for your mood</p>
        </header>

        <div className="space-y-4 mb-16">
          <input 
            className="w-full bg-transparent border-b border-gray-800 p-2 text-lg focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descrivi il tuo mood..."
          />
          <button 
            onClick={generatePlaylist}
            disabled={loading || !text}
            className="text-[10px] uppercase tracking-[0.2em] border border-gray-700 px-6 py-2 hover:bg-white hover:text-black transition-all disabled:opacity-30"
          >
            {loading ? "Analizzando..." : "Genera Playlist"}
          </button>
        </div>

        {result && (
          <div className="animate-in fade-in duration-700">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-10 border-l border-gray-800 pl-4">
              {result.mood_summary}
            </p>
            <div className="space-y-4">
              {result.tracks?.map((track: any, i: number) => (
                <div key={i} className="group flex justify-between items-center border-b border-gray-900/50 pb-3 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] text-gray-700">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-sm font-light text-gray-300 group-hover:text-white">{track.title}</h3>
                      <p className="text-[10px] text-gray-600 uppercase">{track.artist}</p>
                    </div>
                  </div>
                  <a 
                    href={track.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white border border-gray-800 px-2 py-1 rounded-sm transition-all"
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
