"use client";
import { useState } from 'react';

export default function VibeApp() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlaylist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Errore nella generazione");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto px-6 py-20">
        
        {/* Header Minimal */}
        <header className="mb-12 text-left">
          <h1 className="text-2xl font-light tracking-tighter mb-2">VIBE.</h1>
          <p className="text-gray-500 text-sm italic">Music for your mood.</p>
        </header>

        {/* Input Minimal */}
        <div className="space-y-4 mb-16">
          <input 
            className="w-full bg-transparent border-b border-gray-800 p-2 text-lg focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Come ti senti?"
          />
          <button 
            onClick={generatePlaylist}
            disabled={loading || !text}
            className="text-xs uppercase tracking-widest border border-gray-700 px-6 py-2 hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            {loading ? "Analisi in corso..." : "Genera Playlist"}
          </button>
        </div>

        {/* Risultati */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 border-l border-gray-800 pl-4">
              {result.mood_summary}
            </p>
            
            <div className="space-y-6">
              {result.tracks.map((track: any, i: number) => (
                <div key={i} className="group flex justify-between items-end border-b border-gray-900 pb-4">
                  <div className="pr-4">
                    <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{track.title}</h3>
                    <p className="text-xs text-gray-600 uppercase tracking-tight">{track.artist}</p>
                  </div>
                  <a 
                    href={track.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
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
