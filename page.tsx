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
    <main className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Vibe Playlist 🎵</h1>
        <p className="text-gray-400 text-center mb-8">Scrivi come ti senti e ti darò 30 canzoni ad hoc.</p>

        <div className="flex gap-2 mb-8">
          <input 
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Esempio: Una carica per vincere la partita di calcio..."
          />
          <button 
            onClick={generatePlaylist}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? "Generazione..." : "Genera"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">{result.mood_summary}</h2>
            <div className="space-y-3 mt-6">
              {result.tracks.map((track: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  <div>
                    <p className="font-medium">{i + 1}. {track.title}</p>
                    <p className="text-sm text-gray-400">{track.artist}</p>
                  </div>
                  <a 
                    href={track.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider"
                  >
                    Ascolta
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