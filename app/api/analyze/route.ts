import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let userText = "";
  try {
    const body = await req.json();
    userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt focalizzato sull'analisi semantica e la pertinenza reale
    const prompt = `[INST] Mood: "${userText}". 
    1. Analyze the sentence to find the deepest emotional meaning.
    2. Identify 5 songs (Apple Music style) and 3 movies/series (Letterboxd style) that match this specific vibe.
    3. Use real, existing titles only.
    Output ONLY JSON: {"mood_summary":"detailed analysis","music_tracks":[{"title":"...","artist":"..."}],"movies_tv_shows":[{"title":"...","type":"..."}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 600, temperature: 0.7, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok && !result.error) {
      const text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return NextResponse.json(data);
      }
    }
    throw new Error("Analisi fallita");

  } catch (e) {
    return NextResponse.json({
      mood_summary: "Analisi testuale semplice",
      music_tracks: [{ title: userText, artist: "Keyword Search" }],
      movies_tv_shows: [{ title: userText, type: "Keyword Search" }]
    });
  }
}
