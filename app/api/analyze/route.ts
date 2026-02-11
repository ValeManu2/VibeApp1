import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ mood_summary: "Errore: Chiave API mancante su Vercel", tracks: [] }, { status: 500 });
    }

    const promptIstruzioni = `[INST] Analizza il mood: "${userText}". Genera una playlist di 15 canzoni. Rispondi SOLO con un oggetto JSON valido. Struttura: {"mood_summary": "string", "tracks": [{"title": "string", "artist": "string"}]}. Non aggiungere altro testo. [/INST]`;

    const aiResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: promptIstruzioni,
          parameters: { max_new_tokens: 1500, temperature: 0.7, return_full_text: false }
        }),
      }
    );

    const result = await aiResponse.json();
    
    // Gestione risposta Hugging Face (a volte è un array, a volte un oggetto)
    let generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Pulizia: estraiamo solo quello che sta tra le parentesi graffe { }
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("L'IA non ha restituito un JSON valido");
    
    const data = JSON.parse(jsonMatch[0]);

    // Aggiunta link YouTube
    data.tracks = (data.tracks || []).map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Errore dettagliato:", error);
    return NextResponse.json({
      mood_summary: "Servizio momentaneamente occupato. Riprova tra un istante.",
      tracks: [
        { title: "Starboy", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Starboy+The+Weeknd" },
        { title: "Nightcall", artist: "Kavinsky", link: "https://www.youtube.com/results?search_query=Nightcall+Kavinsky" }
      ]
    });
  }
}
