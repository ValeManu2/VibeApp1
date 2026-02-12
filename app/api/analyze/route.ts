import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    const prompt = `[INST] Mood: "${userText}". 
    1. Extract 5 specific songs (Title - Artist).
    2. Extract 3 movies/series.
    Output ONLY JSON: {"mood_summary":"...","music_tracks":[{"title":"...","artist":"..."}],"movies_tv_shows":[{"title":"...","type":"..."}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 500, wait_for_model: true } }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    const data = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    // LINK A PIATTAFORME SPECIFICHE
    data.music_tracks = data.music_tracks.map((t: any) => ({
      ...t,
      // Cerca la canzone direttamente su Apple Music
      apple_link: `https://music.apple.com/search?term=${encodeURIComponent(t.title + " " + t.artist)}`,
      // Cerca la canzone su Amazon Music
      amazon_link: `https://music.amazon.it/search/${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    data.movies_tv_shows = data.movies_tv_shows.map((m: any) => ({
      ...m,
      // Cerca il film su Letterboxd
      letterboxd_link: `https://letterboxd.com/search/${encodeURIComponent(m.title)}/`,
      // Cerca su Rotten Tomatoes
      tomatoes_link: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(m.title)}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ mood_summary: "Errore", music_tracks: [], movies_tv_shows: [] });
  }
}
