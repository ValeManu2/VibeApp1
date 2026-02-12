import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Configura GROQ_API_KEY su Vercel." }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // MODELLO AGGIORNATO: llama-3.3-70b-versatile è quello attuale
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Rispondi solo in JSON. Schema: {\"summary\":\"\",\"songs\":[{\"t\":\"\",\"a\":\"\"}],\"movies\":[{\"t\":\"\"}],\"series\":[{\"t\":\"\"}]}"
          },
          { role: "user", content: `Analizza questo mood e dai 5 canzoni, 2 film e 1 serie tv: ${userText}` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: `ERRORE GROQ: ${data.error.message}` }, { status: 500 });
    }

    const content = data.choices?.[0]?.message?.content;
    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    return NextResponse.json({ error: `ERRORE TECNICO: ${error.message}` }, { status: 500 });
  }
}
