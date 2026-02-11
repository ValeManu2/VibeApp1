import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ mood_summary: "Configurazione mancante", tracks: [] }, { status: 500 });
    }

    const prompt = `[INST] Mood: "${userText}". Genera playlist di 30 canzoni. Rispondi SOLO JSON: {"mood_summary":"...","tracks":[{"title":"...","artist":"..."}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 2500, temperature: 0.7 }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Estrae il JSON pulito
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format error");
    const data = JSON.parse(jsonMatch[0]);

    // Aggiunge i link
    data.tracks = data.tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      mood_summary: "L'IA sta riflettendo troppo. Riprova.",
      tracks: [{ title: "Starboy", artist: "The Weeknd", link: "https://www.youtube.com" }]
    });
  }
}
