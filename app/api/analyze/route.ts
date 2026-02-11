import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Usiamo Llama-3-8B: molto più veloce per evitare i timeout di Vercel
    const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>Mood: "${userText}". Generate 15 songs. Output ONLY JSON: {"mood_summary":"...","tracks":[{"title":"Song","artist":"Artist"}]}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 800, temperature: 0.6, stop: ["<|eot_id|>"] }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    // Estraiamo solo il JSON
    const jsonMatch = text.split("<|start_header_id|>assistant<|end_header_id|>")[1]?.match(/\{[\s\S]*\}/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format error");
    
    const data = JSON.parse(jsonMatch[0]);

    // Costruzione link YouTube precisa
    data.tracks = data.tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    // Se fallisce ancora, cambiamo almeno le canzoni di riserva per testare
    return NextResponse.json({
      mood_summary: "Playlist generata (Modalità veloce)",
      tracks: [
        { title: "One More Time", artist: "Daft Punk", link: "https://www.youtube.com/results?search_query=One+More+Time+Daft+Punk" },
        { title: "Bohemian Rhapsody", artist: "Queen", link: "https://www.youtube.com/results?search_query=Bohemian+Rhapsody+Queen" },
        { title: "Smalltown Boy", artist: "Bronski Beat", link: "https://www.youtube.com/results?search_query=Smalltown+Boy+Bronski+Beat" }
      ]
    });
  }
}
