import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave API mancante" }, { status: 500 });

    // CAMBIO URL: Usiamo la versione v1 invece della v1beta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analizza questo mood: "${userText}". 
              Dimentica i risultati precedenti. Fornisci ESATTAMENTE:
              - 5 Canzoni reali e diverse (Titolo e Artista).
              - 2 Film reali e diversi.
              - 1 Serie TV reale.
              
              Rispondi SOLO in JSON con questo schema:
              {"summary":"...","songs":[{"t":"Titolo","a":"Artista"}],"movies":[{"t":"Titolo"}],"series":[{"t":"Titolo"}]}`
            }]
          }],
          generationConfig: { 
            temperature: 1.0,
            maxOutputTokens: 1000 
          }
        }),
      }
    );

    const result = await response.json();

    // Se Google restituisce un errore specifico
    if (result.error) {
      return NextResponse.json({ error: `IA Error: ${result.error.message}` }, { status: result.error.code || 500 });
    }

    if (!result.candidates || !result.candidates[0].content.parts[0].text) {
      throw new Error("Risposta vuota dall'IA");
    }

    const rawText = result.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("Formato JSON non trovato");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    console.error("Errore Generale:", error);
    return NextResponse.json({ error: "Errore di connessione con l'IA." }, { status: 500 });
  }
}
