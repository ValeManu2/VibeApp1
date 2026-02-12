import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let userText = "";
  try {
    const body = await req.json();
    userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Prompt potenziato: chiediamo all'IA di fare il lavoro di "scouting"
    const prompt = `[INST] Mood: "${userText}". 
    Extract the 5 most relevant REAL songs from Apple Music and 3 REAL movies from Letterboxd.
    Do NOT repeat the user sentence. Use only actual titles.
    Output ONLY JSON: {"tracks":[{"t":"Song Title","a":"Artist"}],"media":[{"t":"Movie Title","y":"Movie"}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 400, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok && !result.error) {
      const text = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Restituiamo solo i titoli puliti
        return NextResponse.json({
          mood_summary: "Analisi Vibe",
          music_tracks: parsed.tracks.map((t: any) => ({ title: t.t, artist: t.a })),
          movies_tv_shows: parsed.media.map((m: any) => ({ title: m.t, type: m.y }))
        });
      }
    }
    throw new Error("Timeout");

  } catch (e) {
    // FALLBACK INTELLIGENTE: Se l'IA fallisce, non usiamo la frase intera!
    // Prendiamo solo le parole più importanti (es. "motivazione", "calcio")
    const keywords = userText.split(' ').filter(word => word.length > 5).slice(0, 2).join(' ');
    return NextResponse.json({
      mood_summary: "Ricerca per concetti chiave",
      music_tracks: [{ title: keywords || userText, artist: "Scelta suggerita" }],
      movies_tv_shows: [{ title: keywords || userText, type: "Film correlato" }]
    });
  }
}
