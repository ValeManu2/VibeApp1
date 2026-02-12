import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("Manca la chiave Gemini su Vercel");

    // Chiamata a Google Gemini (molto più veloce di Hugging Face)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Agisci come un esperto curatore. Analizza questo mood: "${userText}". 
              Trova 5 canzoni reali (per Apple Music) e 3 film/serie reali (per Letterboxd).
              IMPORTANTE: Non ripetere la frase dell'utente. Usa solo titoli veri esistenti.
              Rispondi esclusivamente con questo formato JSON:
              {"summary":"una breve analisi del mood","music":[{"t":"Titolo Canzone","a":"Artista"}],"cinema":[{"t":"Titolo Film","y":"Film o Serie TV"}]}`
            }]
          }]
        }),
      }
    );

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("L'IA ha risposto in modo strano");
    const data = JSON.parse(jsonMatch[0]);

    // Pulizia e creazione link (senza parole di disturbo come "ricerca" o "playlist")
    return NextResponse.json({
      mood_summary: data.summary,
      music_tracks: data.music.map((m: any) => ({
        title: m.t,
        artist: m.a,
        apple: `https://music.apple.com/search?term=${encodeURIComponent(m.t + " " + m.a)}`,
        amazon: `https://music.amazon.it/search/${encodeURIComponent(m.t + " " + m.a)}`
      })),
      movies_tv_shows: data.cinema.map((c: any) => ({
        title: c.t,
        type: c.y,
        letterboxd: `https://letterboxd.com/search/${encodeURIComponent(c.t)}/`,
        tomatoes: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(c.t)}`
      }))
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore tecnico. Controlla GEMINI_API_KEY" }, { status: 500 });
  }
}
