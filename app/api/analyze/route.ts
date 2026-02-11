import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Usiamo Mistral-Nemo, è molto più rapido per risposte brevi JSON
    const prompt = `[INST] Mood: ${userText}. Give 15 songs. ONLY JSON: {"mood_summary":"...","tracks":[{"title":"...","artist":"..."}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 600, temperature: 0.5, return_full_text: false }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Pulizia e parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error();
    const data = JSON.parse(jsonMatch[0]);

    // Costruzione link YouTube (Fix per non finire sulla Home)
    data.tracks = data.tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    // Piano B con canzoni diverse per capire se l'IA ha fallito
    return NextResponse.json({
      mood_summary: "Generazione veloce attivata",
      tracks: [
        { title: "In the End", artist: "Linkin Park", link: "https://www.youtube.com/results?search_query=In+the+End+Linkin+Park" },
        { title: "Lose Yourself", artist: "Eminem", link: "https://www.youtube.com/results?search_query=Lose+Yourself+Eminem" },
        { title: "Fix You", artist: "Coldplay", link: "https://www.youtube.com/results?search_query=Fix+You+Coldplay" }
      ]
    });
  }
}
