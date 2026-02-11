import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.text || "";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Controllo chiave API
    if (!apiKey) {
      return NextResponse.json({ 
        mood_summary: "Errore: Chiave API non configurata su Vercel", 
        tracks: [] 
      }, { status: 500 });
    }

    // Prompt ultra-veloce per evitare il timeout di Vercel
    const prompt = `[INST] Mood: "${userText}". Generate 15 songs. Reply ONLY JSON: {"mood_summary":"breve descrizione","tracks":[{"title":"Song","artist":"Artist"}]} [/INST]`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { 
          Authorization: `Bearer ${apiKey}`, 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { 
            max_new_tokens: 1200, 
            temperature: 0.7,
            return_full_text: false 
          }
        }),
      }
    );

    const result = await response.json();
    
    // Gestione della risposta (Hugging Face può restituire un array o un oggetto)
    let generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
    
    if (!generatedText) {
      throw new Error("L'IA non ha risposto in tempo");
    }

    // Estrazione del JSON pulito dalla risposta testuale
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato JSON non trovato");
    
    const data = JSON.parse(jsonMatch[0]);

    // Generazione automatica dei link YouTube per ogni traccia
    data.tracks = (data.tracks || []).map((t: any) => ({
      ...t,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + " " + t.artist)}`
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Errore API:", error);
    // Risposta di emergenza se l'IA fallisce o va in timeout
    return NextResponse.json({
      mood_summary: "L'IA è un po' lenta oggi, ecco dei classici per te:",
      tracks: [
        { title: "Starboy", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Starboy+The+Weeknd" },
        { title: "Nightcall", artist: "Kavinsky", link: "https://www.youtube.com/results?search_query=Nightcall+Kavinsky" },
        { title: "Midnight City", artist: "M83", link: "https://www.youtube.com/results?search_query=Midnight+City+M83" },
        { title: "Blinding Lights", artist: "The Weeknd", link: "https://www.youtube.com/results?search_query=Blinding+Lights+The+Weeknd" }
      ]
    });
  }
}
