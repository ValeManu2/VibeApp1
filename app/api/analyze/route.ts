import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("Chiave API mancante");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Dimentica ogni suggerimento precedente. Analizza questa specifica richiesta: "${userText}". 
              1. Identifica il mood unico (pressione, gioia, relax, sport, studio, ecc.).
              2. Trova 5 canzoni e 3 film reali che siano perfetti ESCLUSIVAMENTE per questa situazione.
              3. Non ripetere MAI le parole dell'utente nei titoli.
              
              Rispondi SOLO in JSON:
              {"summary":"Analisi personalizzata per: ${userText}","music":[{"t":"Titolo","a":"Artista"}],"cinema":[{"t":"Titolo","y":"Tipo"}]}`
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
    // Fallback dinamico: se l'IA fallisce, creiamo comunque una ricerca basata sulla TUA frase
    return NextResponse.json({
      mood_summary: "Ricerca istantanea",
      music_tracks: [{ title: `Canzoni per: ${userText}`, artist: "Mood Selection" }],
      movies_tv_shows: [{ title: `Film per: ${userText}`, type: "Vibe Selection" }]
    });
  }
}
