import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Definiamo userText qui fuori così è leggibile ovunque (sia nel try che nel catch)
  let userText = "";
  
  try {
    const body = await req.json();
    userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Mood: "${userText}". Output ONLY JSON: {"tracks":[{"t":"title","a":"artist"}],"media":[{"t":"title","y":"Movie"}]} [/INST]`,
          parameters: { max_new_tokens: 400, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    let music = [];
    let cinema = [];

    if (response.ok && !result.error) {
      const text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        music = parsed.tracks || [];
        cinema = parsed.media || [];
      } else {
        throw new Error("No JSON found");
      }
    } else {
      throw new Error("IA offline");
    }

    return NextResponse.json(generateLinks(music, cinema, userText));

  } catch (e) {
    // Ora userText è disponibile qui e TypeScript non darà più errore
    const fallbackMusic = [{ t: `Playlist ${userText}`, a: "Ricerca" }];
    const fallbackCinema = [{ t: `Contenuti ${userText}`, y: "Consigliati" }];
    
    return NextResponse.json(generateLinks(fallbackMusic, fallbackCinema, userText));
  }
}

// Funzione di supporto per generare i link Apple, Amazon e Letterboxd
function generateLinks(music: any[], cinema: any[], query: string) {
  return {
    mood_summary: `Vibe: ${query}`,
    music_tracks: music.map((t: any) => ({
      title: t.t || t.title,
      artist: t.a || t.artist,
      apple: `https://music.apple.com/search?term=${encodeURIComponent((t.t || t.title) + " " + (t.a || t.artist))}`,
      amazon: `https://music.amazon.it/search/${encodeURIComponent((t.t || t.title) + " " + (t.a || t.artist))}`
    })),
    movies_tv_shows: cinema.map((m: any) => ({
      title: m.t || m.title,
      type: m.y || m.type,
      letterboxd: `https://letterboxd.com/search/${encodeURIComponent(m.t || m.title)}/`,
      tomatoes: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(m.t || m.title)}`
    }))
  };
}
