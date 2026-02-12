import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("Manca la chiave GEMINI_API_KEY su Vercel");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analizza questa frase: "${userText}". 
              Estrai i concetti chiave (es. sport, calcio, motivazione).
              Trova 5 canzoni reali perfette per questo mood e 3 film/serie reali.
              NON ripetere le parole dell'utente come titoli.
              Rispondi SOLO in JSON:
              {"summary":"Analisi del mood","music":[{"t":"Titolo Canzone","a":"Artista"}],"cinema":[{"t":"Titolo Film","y":"Film o Serie TV"}]}`
            }]
          }]
        }),
      }
    );

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    const data = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);

    return NextResponse.json({
      mood_summary: data.summary,
      music_tracks: data.music.map((m: any) => ({ title: m.t, artist: m.a })),
      movies_tv_shows: data.cinema.map((c: any) => ({ title: c.t, type: c.y }))
    });

  } catch (error) {
    return NextResponse.json({ error: "Errore tecnico di connessione" }, { status: 500 });
  }
}
