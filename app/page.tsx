// Modifica questa parte nel tuo app/page.tsx
const generateVibe = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Forza il browser a non ricordare i vecchi risultati
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setResult(data);
  } catch (e) { alert("Errore"); }
  setLoading(false);
};
