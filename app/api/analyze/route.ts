// Nel file app/api/analyze/route.ts, aggiorna la chiamata a Gemini
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Analizza: "${userText}". Genera suggerimenti UNICI e ORIGINALI. 
          Non ripetere MAI le stesse canzoni dei turni precedenti.
          Rispondi SOLO in JSON: {"summary":"...","music":[{"t":"...","a":"..."}],"cinema":[{"t":"...","y":"..."}]}`
        }]
      }],
      generationConfig: {
        temperature: 0.9, // Aumenta la varietà delle risposte
        topP: 1,
        maxOutputTokens: 500,
      }
    }),
  }
);
