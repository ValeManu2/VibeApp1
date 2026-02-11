import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt ottimizzato per 30 canzoni e formato JSON puro
    const promptIstruzioni = `[INST] Agisci come un DJ esperto. Analizza l'umore di: "${userText}". 
    Genera una playlist di esattamente 15 canzoni famose e varie che corrispondano a questo mood.
    Rispondi ESCLUSIVAMENTE in formato JSON con questa struttura:
    {
      "valence": 0.5,
      "energy": 0.5,
      "mood_summary": "descrizione del mood",
      "tracks": [{"title": "Titolo Canzone", "artist": "Nome Artista"}]
    }
    Non aggiungere chiacchiere, solo il JSON. [/INST]`;

    const aiResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { 
          Authorization: `Bearer ${apiKey}`, 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptIstruzioni,
          parameters: { max_new_tokens: 3000, temperature: 0.7 }
        }),
      }
    );

    const result = await aiResponse.json();
    
    // Estraiamo il JSON dalla risposta dell'IA
    let generatedText = result[0].generated_text.split('[/INST]')[1].trim();
    const data = JSON.parse(generatedText);

    // Trasformiamo ogni traccia aggiungendo il link di ricerca YouTube
    data.tracks = data.tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Errore Generazione:", error);
    // Fallback dinamico in caso di errore API
    return NextResponse.json({
      mood_summary: "Playlist di emergenza (L'IA è occupata)",
      tracks: [
        { title: "Starboy", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Starboy+The+Weeknd" },
        { title: "Blinding Lights", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Blinding+Lights+The+Weeknd" }
      ]
    });
  }
}

