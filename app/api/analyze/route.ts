import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Configura GROQ_API_KEY su Vercel" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Sei un esperto curatore. Rispondi solo in JSON."
          },
          {
            role: "user",
            content: `Analizza: "${userText}". 
            Fornisci ESATTAMENTE:
            - 5 canzoni reali (t: titolo, a: artista).
            - 2 film reali (t: titolo).
            - 1 serie TV reale (t: titolo).
            
            Rispondi SOLO JSON:
            {"summary":"...","songs":[{"t":"...","a":"..."}],"movies":[{"t":"..."}],"series":[{"t":"..."}]}`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content);

  } catch (error: any) {
    return NextResponse.json({ error: "Errore di connessione a Groq" }, { status: 500 });
  }
}
