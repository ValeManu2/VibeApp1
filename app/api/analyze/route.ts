import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Usiamo un modello più leggero e veloce per evitare i 10 secondi di Vercel
    const prompt = `[INST] Mood: "${userText}". Generate 15 songs. Output ONLY JSON: {"mood_summary":"...","tracks":[{"title":"Song Name","artist":"Artist Name"}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 1000, temperature: 0.6, return_full_text: false }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Estrazione e pulizia JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format error");
    const data = JSON.parse(jsonMatch[0]);

    // FIX YOUTUBE: Assicuriamoci che i link siano creati bene
    data.tracks = data.tracks.map((t: any) => {
      const query = encodeURIComponent(`${t.title} ${t.artist}`);
      return {
        ...t,
        link: t.title ? `https://www.youtube.com/results?search_query=${query}` : "https://www.youtube.com"
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    // Fallback con link garantiti funzionanti
    return NextResponse.json({
      mood_summary: "Playlist pronta (IA in standby)",
      tracks: [
        { title: "Starboy", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Starboy+The+Weeknd" },
        { title: "Nightcall", artist: "Kavinsky", link: "https://www.youtube.com/results?search_query=Nightcall+Kavinsky" },
        { title: "Blinding Lights", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Blinding+Lights+The+Weeknd" }
      ]
    });
  }
}
