import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ mood_summary: "Configurazione API mancante", music_tracks: [], movies_tv_shows: [] }, { status: 500 });
    }

    // NUOVO PROMPT: Chiede sia canzoni che film/serie TV
    const prompt = `[INST] Act as an expert curator for mood-based media.
    User mood: "${userText}".
    Task: Generate 5 highly relevant music tracks and 3 highly relevant movies/TV shows that perfectly match this exact mood. Prioritize quality and pertinence over popularity.
    Output ONLY a single JSON object with the following structure:
    {
      "mood_summary": "A concise description of the mood.",
      "music_tracks": [
        {"title": "Song Title 1", "artist": "Artist 1"},
        // ... up to 5 tracks
      ],
      "movies_tv_shows": [
        {"title": "Movie/Show Title 1", "type": "Movie"|"TV Show"},
        // ... up to 3 movies/shows
      ]
    }
    DO NOT include any other text or explanation outside the JSON. [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 800, temperature: 0.8, return_full_text: false, do_sample: true }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Estrazione e pulizia del JSON dalla risposta dell'IA
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("IA non ha restituito JSON valido.");
    
    const data = JSON.parse(jsonMatch[0]);

    // Aggiunta link YouTube per le tracce musicali
    data.music_tracks = (data.music_tracks || []).map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist + " official audio")}`
    }));

    // Aggiunta link Google Search per film/serie TV
    data.movies_tv_shows = (data.movies_tv_shows || []).map((m: any) => ({
      ...m,
      link: `https://www.google.com/search?q=${encodeURIComponent(m.title + " " + m.type + " streaming")}`
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Errore API:", error);
    // Risposta di emergenza più ricca
    return NextResponse.json({
      mood_summary: "Modalità di emergenza: Ecco alcune idee per iniziare!",
      music_tracks: [
        { title: "Lost in the Fire", artist: "Gesaffelstein & The Weeknd", link: "https://www.youtube.com/results?search_query=Lost+in+the+Fire+official+audio" },
        { title: "Blinding Lights", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Blinding+Lights+official+audio" },
        { title: "Nightcall", artist: "Kavinsky", link: "https://www.youtube.com/results?search_query=Nightcall+official+audio" }
      ],
      movies_tv_shows: [
        { title: "Drive", type: "Film", link: "https://www.google.com/search?q=Drive+film+streaming" },
        { title: "Mr. Robot", type: "Serie TV", link: "https://www.google.com/search?q=Mr.+Robot+serie+tv+streaming" }
      ]
    }, { status: 500 });
  }
}
