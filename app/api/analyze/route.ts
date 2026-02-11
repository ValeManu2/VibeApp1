import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt super strutturato per evitare errori
    const prompt = `<start_of_turn>user
    Mood dell'utente: "${userText}".
    Trova 5 canzoni e 3 film/serie TV che abbiano ESATTAMENTE questa atmosfera. 
    Rispondi SOLO con un oggetto JSON:
    {
      "mood_summary": "descrizione breve",
      "music_tracks": [{"title": "titolo", "artist": "artista"}],
      "movies_tv_shows": [{"title": "titolo", "type": "Film o Serie TV"}]
    }<start_of_turn>model`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/gemma-2-9b-it",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 500, temperature: 0.7 }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Pulizia JSON per evitare che appaiano sempre le stesse canzoni
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("IA lenta");
    const data = JSON.parse(jsonMatch[0]);

    // Link YouTube per musica
    data.music_tracks = data.music_tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    // Link Google per Film/Serie
    data.movies_tv_shows = data.movies_tv_shows.map((m: any) => ({
      ...m,
      link: `https://www.google.com/search?q=${encodeURIComponent(m.title + " " + m.type + " dove vederlo")}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    // Piano B più pertinente (se l'IA fallisce)
    return NextResponse.json({
      mood_summary: "Selezione rapida per: " + userText,
      music_tracks: [{ title: "After Hours", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=After+Hours+The+Weeknd" }],
      movies_tv_shows: [{ title: "Blade Runner 2049", type: "Film", link: "https://www.google.com/search?q=Blade+Runner+2049" }]
    });
  }
}
