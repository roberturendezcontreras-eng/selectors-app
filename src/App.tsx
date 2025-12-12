import React, { useState, useEffect } from "react";

// --- INTERFACES ---
interface AggregatedEvent {
  id: string;
  source: "TICKETMASTER" | "EVENTBRITE";
  name: string;
  date: string;
  time?: string;
  image: string;
  url: string;
  venue: string;
  city: string;
}

// --- APP COMPONENT ---
export default function App() {
  const [events, setEvents] = useState<AggregatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, eb: 0, tm: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Madrid");

  useEffect(() => {
    fetchEvents();
  }, [selectedCity]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const CITY = selectedCity;
      const TM_API_KEY = process.env.REACT_APP_TM_API_KEY || "TU_API_KEY_TM";

      // 1. TICKETMASTER (Directo o vía proxy si lo tienes, aquí directo por demo)
      const tmPromise = fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_API_KEY}&city=${CITY}&classificationName=music&size=50&sort=date,asc`
      ).then((res) => res.json());

      // 2. EVENTBRITE (Usando TU PROXY en /api/eventbrite)
      // Pedimos las páginas 1, 2, 3 y 4 simultáneamente
      const pages = [1, 2, 3, 4];
      const ebPromises = pages.map((page) =>
        // ¡OJO! Llamamos a TU backend local, no a eventbrite.com
        fetch(`/api/eventbrite?city=${CITY}&page=${page}`).then((res) =>
          res.json()
        )
      );

      // 3. Ejecutar todo en paralelo
      const [tmResult, ...ebResults] = await Promise.all([
        tmPromise,
        ...ebPromises,
      ]);

      // --- PROCESAR TICKETMASTER ---
      const tmEvents: AggregatedEvent[] = (
        tmResult._embedded?.events || []
      ).map((e: any) => ({
        id: e.id,
        source: "TICKETMASTER",
        name: e.name,
        date: e.dates.start.localDate,
        time: e.dates.start.localTime?.slice(0, 5),
        image:
          e.images?.find((img: any) => img.ratio === "16_9")?.url ||
          e.images?.[0]?.url,
        url: e.url,
        venue: e._embedded?.venues?.[0]?.name || "TBA",
        city: e._embedded?.venues?.[0]?.city?.name || CITY,
      }));

      // --- PROCESAR EVENTBRITE (Juntar las 4 páginas) ---
      let ebEvents: AggregatedEvent[] = [];
      ebResults.forEach((pageData: any) => {
        // Verificamos que pageData tenga eventos (tu proxy devuelve el JSON directo)
        if (pageData.events) {
          const mapped = pageData.events.map((e: any) => ({
            id: e.id,
            source: "EVENTBRITE",
            name: e.name.text,
            date: e.start?.local?.split("T")[0] || "Próximamente",
            time: e.start?.local?.split("T")[1]?.slice(0, 5),
            image:
              e.logo?.url ||
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80", // Fallback chulo
            url: e.url,
            venue: e.venue?.name || "Ubicación Secreta",
            city: e.venue?.address?.city || CITY,
          }));
          ebEvents = [...ebEvents, ...mapped];
        }
      });

      // --- MEZCLAR Y ORDENAR ---
      const allEvents = [...tmEvents, ...ebEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setEvents(allEvents);
      setStats({
        total: allEvents.length,
        tm: tmEvents.length,
        eb: ebEvents.length,
      });
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado local
  const filteredEvents = events.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER: LOGO CYBERPUNK ORIGINAL */}
      <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/90 sticky top-0 z-50 backdrop-blur">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic transform -skew-x-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
              SELECTORS
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="px-3 py-1 border border-cyan-500/30 bg-cyan-900/10 text-cyan-400 text-xs font-mono font-bold rounded">
            BETA v.1
          </span>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* DASHBOARD ESTADÍSTICAS */}
        <div className="mb-8 p-4 bg-gray-900/50 border border-blue-900/50 rounded-xl flex flex-wrap gap-6 items-center shadow-[0_0_20px_rgba(0,0,255,0.1)]">
          <div className="text-center">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Total
            </p>
            <p className="text-2xl font-bold text-white">📊 {stats.total}</p>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="text-center">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Ticketmaster
            </p>
            <p className="text-xl font-bold text-blue-400">🎫 {stats.tm}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Eventbrite
            </p>
            <p className="text-xl font-bold text-orange-400">🔥 {stats.eb}</p>
          </div>
        </div>

        {/* FILTROS ALINEADOS A LA IZQUIERDA */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 text-left items-end w-full">
          <div className="w-full md:w-1/4">
            <label className="block text-xs text-cyan-500 mb-2 font-bold uppercase tracking-widest">
              Ciudad
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition font-mono text-sm"
            >
              <option value="Madrid">Madrid</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Valencia">Valencia</option>
            </select>
          </div>

          <div className="w-full md:w-3/4">
            <label className="block text-xs text-cyan-500 mb-2 font-bold uppercase tracking-widest">
              Buscar Hype
            </label>
            <input
              type="text"
              placeholder="Buscar artista, sala o género..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-cyan-500 focus:outline-none transition font-mono text-sm placeholder-gray-600"
            />
          </div>
        </div>

        {/* RESULTADOS */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-cyan-400 text-4xl animate-bounce mb-4">👾</div>
            <p className="text-cyan-500 font-mono animate-pulse">
              CARGANDO EL HYPE...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                key={`${event.source}-${event.id}`}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/20"
              >
                {/* Imagen */}
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {/* Badge Source */}
                  <div
                    className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold tracking-widest text-white shadow-lg z-10
                    ${
                      event.source === "TICKETMASTER"
                        ? "bg-blue-600"
                        : "bg-orange-600"
                    }`}
                  >
                    {event.source === "TICKETMASTER" ? "TM" : "EB"}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-cyan-400 text-xs font-mono">
                      {event.date}
                    </div>
                    {event.time && (
                      <div className="text-gray-500 text-xs font-mono">
                        {event.time}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors h-14">
                    {event.name}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-400 text-xs border-t border-gray-800 pt-3 mt-2">
                    <span>📍</span>
                    <span className="truncate max-w-[200px]">
                      {event.venue}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
