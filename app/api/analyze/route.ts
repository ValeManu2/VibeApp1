import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text: userText } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Chiave GROQ_API_KEY non trovata" }, { status: 500 });
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
          { role: "user", content: `Analizza: ${userText}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));

  } catch (error) {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
