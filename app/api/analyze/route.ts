import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // 1. Controllo se la chiave esiste davvero
    if (!apiKey) {
      return NextResponse.json({ error: "ERRORE: La chiave GROQ_API_KEY non è stata configurata correttamente su Vercel." }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "Rispondi solo in JSON. Schema: {\"summary\":\"\",\"songs\":[{\"t\":\"\",\"a\":\"\"}],\"movies\":[{\"t\":\"\"}],\"series\":[{\"t\":\"\"}]}"
          },
          { role: "user", content: `Mood: ${userText}. Fornisci 5 canzoni, 2 film e 1 serie TV.` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    // 2. Controllo se Groq ha dato errore (es. chiave scaduta o limite raggiunto)
    if (data.error) {
      return NextResponse.json({ error: `ERRORE GROQ: ${data.error.message}` }, { status: 500 });
    }

    // 3. Provo a leggere il contenuto
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "ERRORE: L'IA ha risposto in modo vuoto." }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    // 4. Se crasha tutto, mostrami il messaggio tecnico dell'errore
    return NextResponse.json({ error: `ERRORE TECNICO: ${error.message}` }, { status: 500 });
  }
}
