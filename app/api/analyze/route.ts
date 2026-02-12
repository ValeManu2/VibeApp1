import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Manca GROQ_API_KEY" }, { status: 500 });

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
            content: "Sei un esperto curatore musicale e cinematografico. Rispondi esclusivamente in formato JSON."
          },
          {
            role: "user",
            content: `Analizza questo mood: "${userText}". 
            Fornisci: 
            1. 5 canzoni reali (artista e titolo). 
            2. 2 film reali. 
            3. 1 serie TV reale.
            
            Rispondi SOLO con questo schema JSON:
            {"summary":"...","songs":[{"t":"Titolo","a":"Artista"}],"movies":[{"t":"Titolo"}],"series":[{"t":"Titolo"}]}`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const content = data.choices[0].message.content;
    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Errore con Groq: " + error.message }, { status: 500 });
  }
}
