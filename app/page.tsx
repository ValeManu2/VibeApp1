// ... (parte iniziale del file uguale a prima)

        ) : (
          <div className="pb-20 animate-in fade-in duration-1000">
            <button onClick={() => setResult(null)} className="mb-10 text-[9px] uppercase tracking-widest border-b border-black/20">← Cambia Mood</button>
            
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-16 text-center italic">— {result.summary} —</p>
            
            {/* 5 CANZONI */}
            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2">5 Music Suggestions</h3>
              {result.songs?.map((s: any, i: number) => (
                <div key={i} className="mb-6"><h4 className="text-xl font-light">{s.t}</h4><p className="text-[10px] opacity-40 uppercase">{s.a}</p></div>
              ))}
            </section>

            {/* 2 FILM */}
            <section className="mb-12">
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2">2 Movie Picks</h3>
              {result.movies?.map((m: any, i: number) => (
                <div key={i} className="mb-6"><h4 className="text-xl font-light">{m.t}</h4><p className="text-[10px] opacity-40 uppercase">Film</p></div>
              ))}
            </section>

            {/* 1 SERIE TV */}
            <section>
              <h3 className="text-[10px] uppercase opacity-30 mb-8 border-b pb-2">1 TV Series</h3>
              <div className="mb-6">
                <h4 className="text-xl font-light">{result.series?.[0]?.t}</h4>
                <p className="text-[10px] opacity-40 uppercase">Serie TV</p>
              </div>
            </section>
          </div>
        )}
// ...
