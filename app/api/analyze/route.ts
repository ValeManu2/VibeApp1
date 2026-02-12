import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave API mancante" }, { status: 500 });

    // Cambiamo il modello in 'gemini-1.5-pro' che è più stabile su tutte le API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analizza questo mood: "${userText}". 
              Suggerisci titoli REALI:
              - 5 Canzoni diverse (Titolo - Artista).
              - 2 Film diversi.
              - 1 Serie TV.
              
              Rispondi SOLO in JSON con questo schema:
              {"summary":"...","songs":[{"t":"Titolo","a":"Artista"}],"movies":[{"t":"Titolo"}],"series":[{"t":"Titolo"}]}`
            }]
          }],
          generationConfig: { 
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048 
          }
        }),
      }
    );

    const result = await response.json();

    // Se dà ancora errore, stampiamo l'errore esatto nel log di Vercel per leggerlo
    if (result.error) {
      console.error("DETTAGLIO ERRORE GOOGLE:", JSON.stringify(result.error));
      return NextResponse.json({ error: `IA Error: ${result.error.message}` }, { status: 500 });
    }

    const rawText = result.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("Format error");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    return NextResponse.json({ error: "Errore di connessione. Riprova tra poco." }, { status: 500 });
  }
}
