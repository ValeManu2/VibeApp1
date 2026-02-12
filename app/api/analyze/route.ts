import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt che forza l'IA a essere sintetica per non andare in timeout
    const prompt = `[INST] Mood: "${userText}". Provide 5 songs and 3 movies. Output ONLY JSON: {"mood_summary":"...","music_tracks":[{"title":"...","artist":"..."}],"movies_tv_shows":[{"title":"...","type":"..."}]} [/INST]`;

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
    
    // Gestione errori di Hugging Face
    if (!response.ok) throw new Error("API Limit");

    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON Error");
    
    const data = JSON.parse(jsonMatch[0]);

    // Generazione link piattaforme richieste
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

    return NextResponse.json(data);

  } catch (error) {
    // SE C'È ERRORE: Spezziamo la frase e creiamo link di ricerca diretti
    const keywords = userText.split(' ').slice(0, 3).join(' ');
    return NextResponse.json({
      mood_summary: "Ricerca generata per: " + userText,
      music_tracks: [{
        title: `Playlist per "${userText}"`,
        artist: "Apple Music",
        apple: `https://music.apple.com/search?term=${encodeURIComponent(userText + " playlist")}`,
        amazon: `https://music.amazon.it/search/${encodeURIComponent(userText + " playlist")}`
      }],
      movies_tv_shows: [{
        title: `Film consigliati per "${userText}"`,
        type: "Ricerca",
        letterboxd: `https://letterboxd.com/search/${encodeURIComponent(userText)}/`,
        tomatoes: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(userText)}`
      }]
    });
  }
}
