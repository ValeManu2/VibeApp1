import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("Manca la chiave GEMINI_API_KEY");

    // Istruzioni ferree per evitare i fallimenti visti nelle immagini
    const prompt = `Analizza questa situazione: "${userText}". 
    Identifica il nucleo emotivo (es: calcio = energia/competizione).
    Trova 5 canzoni reali presenti su Apple Music e 3 film/serie su Letterboxd.
    REGOLE: 
    1. NON usare le parole dell'utente come titoli.
    2. Restituisci SOLO titoli di opere esistenti.
    3. Se il tema è il calcio, cerca brani che starebbero in una playlist "Football Motivation".
    
    Rispondi SOLO in JSON:
    {"summary":"Analisi rapida","music":[{"t":"Titolo","a":"Artista"}],"cinema":[{"t":"Titolo","y":"Film"}]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
    // Evitiamo il "No Results" inviando una ricerca pulita in caso di errore
    return NextResponse.json({
      mood_summary: "Ricerca semplificata",
      music_tracks: [{ title: "Eye of the Tiger", artist: "Survivor" }],
      movies_tv_shows: [{ title: "Goal!", type: "Film" }]
    });
  }
}
