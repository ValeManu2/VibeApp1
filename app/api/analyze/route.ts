import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chiave API non configurata su Vercel" }, { status: 500 });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analizza il mood: "${userText}". Fornisci 5 canzoni, 2 film, 1 serie tv. Rispondi solo in JSON: {"summary":"...","songs":[{"t":"...","a":"..."}],"movies":[{"t":"..."}],"series":[{"t":"..."}]}` }] }],
          generationConfig: { temperature: 0.8 }
        }),
      }
    );

    const result = await response.json();

    // Se Google risponde con un errore (es. Location non supportata)
    if (result.error) {
      console.error("Errore Google:", result.error.message);
      return NextResponse.json({ error: `IA Error: ${result.error.message}` }, { status: 500 });
    }

    const rawText = result.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format error");
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error("Errore Generale:", error);
    return NextResponse.json({ error: "Connessione fallita. Riprova." }, { status: 500 });
  }
}
