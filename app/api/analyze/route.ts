import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Tentativo con l'IA
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Mood: "${userText}". Output ONLY JSON: {"tracks":[{"t":"title","a":"artist"}],"media":[{"t":"title","y":"Movie"}]} [/INST]`,
          parameters: { max_new_tokens: 300, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    let data;

    if (response.ok && !result.error) {
      // Se l'IA risponde, puliamo il JSON
      const text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch[0]);
      
      data = {
        mood_summary: "Analisi completata",
        music_tracks: parsed.tracks.map((t: any) => ({ title: t.t, artist: t.a })),
        movies_tv_shows: parsed.media.map((m: any) => ({ title: m.t, type: m.y }))
      };
    } else {
      throw new Error("Fallback");
    }

    // Aggiunta link dinamici (Apple, Amazon, Letterboxd, Tomatoes)
    return NextResponse.json(generateLinks(data, userText));

  } catch (error) {
    // PIANO DI EMERGENZA: Crea link basati sulle tue parole chiave
    const fallbackData = {
      mood_summary: `Ricerca curata per "${userText}"`,
      music_tracks: [
        { title: `Playlist: ${userText}`, artist: "Vari Artisti" }
      ],
      movies_tv_shows: [
        { title: `Contenuti: ${userText}`, type: "Consigliati" }
      ]
    };
    return NextResponse.json(generateLinks(fallbackData, userText));
  }
}

// Funzione per creare i link che hai chiesto
function generateLinks(data: any, query: string) {
  data.music_tracks = data.music_tracks.map((t: any) => ({
    ...t,
    apple: `https://music.apple.com/search?term=${encodeURIComponent(t.title + " " + t.artist)}`,
    amazon: `https://music.amazon.it/search/${encodeURIComponent(t.title + " " + t.artist)}`
  }));
  data.movies_tv_shows = data.movies_tv_shows.map((m: any) => ({
    ...m,
    letterboxd: `https://letterboxd.com/search/${encodeURIComponent(m.title)}/`,
    tomatoes: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(m.title)}`
  }));
  return data;
}
