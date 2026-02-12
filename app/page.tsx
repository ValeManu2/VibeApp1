// Sostituisci la parte dei risultati nel tuo page.tsx con questa:
{result && (
  <div className="space-y-12 pb-20 pt-10">
    {/* SEZIONE MUSICA */}
    <section>
      <h3 className="text-[10px] uppercase opacity-40 mb-6 border-b pb-2">Music (Apple / Amazon)</h3>
      {result.music_tracks?.map((t: any, i: number) => (
        <div key={i} className="mb-6 border-b border-black/5 pb-4">
          <h4 className="text-lg font-light">{t.title}</h4>
          <p className="text-[10px] opacity-50 uppercase mb-3">{t.artist}</p>
          <div className="flex gap-2">
            <a href={t.apple_link} target="_blank" className="text-[8px] border border-black/20 px-2 py-1 hover:bg-black hover:text-white transition-all">Apple Music</a>
            <a href={t.amazon_link} target="_blank" className="text-[8px] border border-black/20 px-2 py-1 hover:bg-black hover:text-white transition-all">Amazon Music</a>
          </div>
        </div>
      ))}
    </section>

    {/* SEZIONE CINEMA */}
    <section>
      <h3 className="text-[10px] uppercase opacity-40 mb-6 border-b pb-2">Cinema (Letterboxd / Tomatoes)</h3>
      {result.movies_tv_shows?.map((m: any, i: number) => (
        <div key={i} className="mb-6 border-b border-black/5 pb-4">
          <h4 className="text-lg font-light">{m.title}</h4>
          <p className="text-[10px] opacity-50 uppercase mb-3">{m.type}</p>
          <div className="flex gap-2">
            <a href={m.letterboxd_link} target="_blank" className="text-[8px] border border-black/20 px-2 py-1 hover:bg-black hover:text-white transition-all">Letterboxd</a>
            <a href={m.tomatoes_link} target="_blank" className="text-[8px] border border-black/20 px-2 py-1 hover:bg-black hover:text-white transition-all">Rotten Tomatoes</a>
          </div>
        </div>
      ))}
    </section>
  </div>
)}
