import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let userText = "";
  try {
    const body = await req.json();
    userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt raffinato: chiediamo all'IA di attingere dai database reali
    const prompt = `[INST] Mood: "${userText}". 
    Act as a curator for Apple Music and Letterboxd. 
    Select 5 real songs and 3 real movies/series that fit this vibe perfectly.
    Output ONLY JSON: {"tracks":[{"t":"Song Title","a":"Artist"}],"media":[{"t":"Movie Title","y":"Movie/Series"}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 500, wait_for_model: true }
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
      }
    }

    // Se l'IA fallisce, usiamo direttamente il mood come termine di ricerca PULITO
    if (music.length === 0) music = [{ t: userText, a: "" }];
    if (cinema.length === 0) cinema = [{ t: userText, y: "" }];

    return NextResponse.json(generateLinks(music, cinema, userText));

  } catch (e) {
    return NextResponse.json(generateLinks([{ t: userText, a: "" }], [{ t: userText, y: "" }], userText));
  }
}

function generateLinks(music: any[], cinema: any[], query: string) {
  return {
    mood_summary: `Vibe: ${query}`,
    music_tracks: music.map((t: any) => ({
      title: t.t,
      artist: t.a,
      // FIX: Ricerca pulita senza parole aggiuntive che rompono i risultati
      apple: `https://music.apple.com/search?term=${encodeURIComponent(t.t + " " + t.a)}`,
      amazon: `https://music.amazon.it/search/${encodeURIComponent(t.t + " " + t.a)}`
    })),
    movies_tv_shows: cinema.map((m: any) => ({
      title: m.t,
      type: m.y,
      // FIX: Ricerca diretta su Letterboxd
      letterboxd: `https://letterboxd.com/search/${encodeURIComponent(m.t)}/`,
      tomatoes: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(m.t)}`
    }))
  };
}
