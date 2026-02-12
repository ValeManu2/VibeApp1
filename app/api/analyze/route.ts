import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { text: userText } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analizza: "${userText}". Dammi 5 canzoni, 2 film e 1 serie tv reali. Rispondi solo JSON: {"summary":"...","songs":[{"t":"...","a":"..."}],"movies":[{"t":"..."}],"series":[{"t":"..."}]}` }] }]
        })
      }
    );

    const data = await response.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });

    const raw = data.candidates[0].content.parts[0].text;
    return NextResponse.json(JSON.parse(raw.match(/\{[\s\S]*\}/)[0]));
  } catch (e) {
    return NextResponse.json({ error: "Cambio AI necessario" }, { status: 500 });
  }
}
