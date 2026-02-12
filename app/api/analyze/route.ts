import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Configura GEMINI_API_KEY su Vercel" }, { status: 500 });
    }

    // Chiamata a Gemini 1.5 Flash: veloce e intelligente
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Agisci come un curatore esperto di musica (Apple Music) e cinema (Letterboxd). 
              Analizza profondamente questa situazione: "${userText}".
              
              REGOLE:
              1. Identifica il mood (es. adrenalina per sport, calma per relax).
              2. Trova 5 canzoni e 3 film/serie REALI e SPECIFICI.
              3. NON ripetere mai la frase dell'utente nei titoli.
              4. Sii creativo: non dare sempre gli stessi risultati.
              
              Rispondi SOLO con questo schema JSON:
              {"mood_analysis":"...","music":[{"t":"Titolo","a":"Artista"}],"cinema":[{"t":"Titolo","y":"Tipo"}]}`
            }]
          }],
          generationConfig: {
            temperature: 0.9, // Forza la varietà dei risultati
            maxOutputTokens: 800,
          }
        }),
      }
    );

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0].content.parts[0].text) {
      throw new Error("Risposta IA non valida");
    }

    const rawText = result.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("JSON non trovato");
    const data = JSON.parse(jsonMatch[0]);

    // Generazione risultati puliti per l'interfaccia
    return NextResponse.json({
      summary: data.mood_analysis,
      tracks: data.music.map((m: any) => ({
        title: m.t,
        artist: m.a
      })),
      media: data.cinema.map((c: any) => ({
        title: c.t,
        type: c.y
      }))
    });

  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ error: "L'IA è occupata, riprova tra un istante." }, { status: 500 });
  }
}
