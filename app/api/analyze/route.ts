import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Leggiamo il JSON una sola volta all'inizio
  const body = await req.json();
  const userText = body.text || "";
  const input = userText.toLowerCase();
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  try {
    // 2. Tentativo con Hugging Face
    const aiResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Analizza: "${userText}". Rispondi SOLO JSON: {"valence":0.5,"energy":0.5,"mood_summary":"vibe","tracks":[{"title":"T","artist":"A"}]} [/INST]`,
        }),
      }
    );

    const result = await aiResponse.json();
    const generatedText = result[0].generated_text.split('[/INST]')[1].trim();
    return NextResponse.json(JSON.parse(generatedText));

  } catch (error) {
    // 3. PIANO B: Ora l'input è già disponibile, non crasha più!
    console.log("Utilizzo logica di riserva per evitare errori tecnici");

    let fallback = {
      valence: 0.5, 
      energy: 0.5, 
      mood_summary: "Analisi locale completata",
      tracks: [
        {title: "Starboy", artist: "The Weeknd"}, 
        {title: "Nightcall", artist: "Kavinsky"},
        {title: "After Hours", artist: "The Weeknd"},
        {title: "Midnight City", artist: "M83"},
        {title: "Blinding Lights", artist: "The Weeknd"}
      ]
    };

    if (input.includes("calcio") || input.includes("partita") || input.includes("vincere")) {
      fallback = { 
        valence: 0.8, energy: 0.95, mood_summary: "Carica agonistica attivata!",
        tracks: [
          {title: "Sahara", artist: "Hensonn"}, 
          {title: "Disaster", artist: "KSLV Noh"},
          {title: "Thunderstruck", artist: "AC/DC"},
          {title: "Live Is Life", artist: "Opus"},
          {title: "Seven Nation Army", artist: "The White Stripes"}
        ]
      };
    } else if (input.includes("respirare") || input.includes("relax") || input.includes("ansia")) {
      fallback = { 
        valence: 0.4, energy: 0.2, mood_summary: "Pausa rigenerante",
        tracks: [
          {title: "Dum Surfer", artist: "King Krule"}, 
          {title: "Borderline", artist: "Tame Impala"},
          {title: "Weightless", artist: "Marconi Union"},
          {title: "Blue Train", artist: "John Coltrane"},
          {title: "Alone Again", artist: "King Krule"}
        ]
      };
    }

    return NextResponse.json(fallback);
  }
}