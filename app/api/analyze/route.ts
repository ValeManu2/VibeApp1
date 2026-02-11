import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt "Severo": chiede massima pertinenza e varietà
    const prompt = `[INST] Act as a music expert. Input mood: "${userText}". 
    Task: Select 15 SPECIFIC songs that perfectly match this exact vibe (no generic hits).
    Output ONLY JSON: {"mood_summary":"specific vibe description","tracks":[{"title":"...","artist":"..."}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 800, temperature: 0.8, return_full_text: false }
        }),
      }
    );

    const result = await response.json();
    let text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error();
    const data = JSON.parse(jsonMatch[0]);

    // Costruzione link YouTube con ricerca mirata
    data.tracks = data.tracks.map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist + " official audio")}`
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      mood_summary: "Selezione curata per te",
      tracks: [
        { title: "Weightless", artist: "Marconi Union", link: "https://www.youtube.com/results?search_query=Weightless+Marconi+Union" },
        { title: "Gymnopédie No. 1", artist: "Erik Satie", link: "https://www.youtube.com/results?search_query=Satie+Gymnopedie+1" },
        { title: "Everything in Its Right Place", artist: "Radiohead", link: "https://www.youtube.com/results?search_query=Radiohead+Everything+In+Its+Right+Place" }
      ]
    });
  }
}
