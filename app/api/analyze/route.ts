import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Configura GEMINI_API_KEY" }, { status: 500 });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analizza questo mood: "${userText}". 
              Dimentica i risultati precedenti. Fornisci esattamente:
              1. 5 Canzoni reali (Apple Music) diverse tra loro.
              2. 2 Film reali (Letterboxd).
              3. 1 Serie TV reale.
              
              Rispondi SOLO in JSON con questa struttura:
              {"summary":"...","songs":[{"t":"Titolo","a":"Artista"}],"movies":[{"t":"Titolo"}],"series":[{"t":"Titolo"}]}`
            }]
          }],
          generationConfig: { temperature: 1.0 } // Massima varietà
        }),
      }
    );

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    const data = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Errore di analisi" }, { status: 500 });
  }
}
