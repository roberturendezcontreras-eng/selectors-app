import React, { useState, useEffect } from "react";
const API_EB = "4FZBXCGPGPHNCNUSTWWN";
const API_TICKETMASTER = "YOUR_TICKETMASTER_KEY"; // Obtén tu clave en https://developer.ticketmaster.com/

// --- 1. DEFINICIÓN DE TIPOS (ESTO ARREGLA LOS ERRORES ROJOS) ---
interface Image {
  url: string;
  width: number;
  height?: number;
}

interface Venue {
  name: string;
  city?: { name: string };
}

// Definimos la estructura exacta de un evento
interface Evento {
  id: string;
  name: string;
  url: string;
  images: Image[];
  dates: {
    start: {
      localDate: string;
    };
  };
  _embedded?: {
    venues?: Venue[];
  };
  classifications?: Array<{
    genre?: { name: string };
    subGenre?: { name: string };
  }>;
}

// --- 2. ESTILOS CYBERPUNK (TU DISEÑO FINAL) ---
const misEstilos = `
  :root {
    --neon-yellow: #fce300;
    --neon-green: #c1ff72; 
    --neon-pink: #ff00ff;
    --neon-blue: #00f3ff;
    --neon-gold: #FFD700;
    --bg-dark: #050505;
  }
  body {
    background-color: #050505;
    color: white;
    font-family: 'Courier New', monospace;
    margin: 0;
    padding: 0;
    background-image: radial-gradient(circle at 50% 50%, #111 0%, #000 100%);
    overflow-x: hidden;
  }

  .main-container { padding: 20px; max-width: 1600px; margin: 0 auto; }

  /* HEADER */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #333;
    padding-bottom: 30px;
    margin-bottom: 50px;
    gap: 40px;
    flex-wrap: wrap;
  }
  .brand-area { flex: 1; min-width: 300px; }
  h1 { font-size: 10vw; text-transform: uppercase; margin: 0; line-height: 0.9; letter-spacing: -4px; text-shadow: 0 0 15px var(--neon-blue); }
  @media (min-width: 768px) { h1 { font-size: 5rem; } }
  
  .subtitle { font-weight: bold; font-size: 1.1rem; margin-top: 15px; text-transform: uppercase; color: var(--neon-green); letter-spacing: 2px; border-left: 4px solid var(--neon-green); padding-left: 15px; }

  /* FILTROS */
  .filter-stack { display: flex; flex-direction: column; gap: 12px; min-width: 280px; align-items: flex-end; width: 100%; }
  @media (min-width: 768px) { .filter-stack { width: auto; } }

  .cyber-select { background: black; color: white; border: 1px solid #444; border-right: 5px solid var(--neon-blue); padding: 10px 15px; font-family: 'Courier New'; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; cursor: pointer; outline: none; transition: all 0.2s; width: 100%; text-align: right; border-radius: 0; appearance: none; }
  .cyber-select:hover { border-color: var(--neon-yellow); background: #111; }

  /* NAV TABS */
  .nav-tabs { display: flex; justify-content: flex-start; gap: 15px; margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 20px; overflow-x: auto; }
  .tab-btn { background: transparent; border: 2px solid #333; color: #666; padding: 10px 25px; font-family: 'Courier New'; font-weight: 900; font-size: 1.1rem; text-transform: uppercase; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
  .tab-btn:hover { color: white; border-color: white; }
  .tab-btn.active { background: var(--neon-green); color: black; border-color: var(--neon-green); box-shadow: 0 0 15px var(--neon-green); }

  /* HOMENAJE */
  .tribute-container { border: 2px solid var(--neon-gold); background: #000; margin-bottom: 80px; position: relative; box-shadow: 0 0 30px rgba(255, 215, 0, 0.2); }
  .tribute-header { position: relative; height: 400px; overflow: hidden; border-bottom: 4px solid var(--neon-gold); }
  @media (min-width: 768px) { .tribute-header { height: 600px; } }
  .tribute-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; filter: grayscale(100%) contrast(1.2); transition: transform 10s ease; }
  .tribute-header:hover .tribute-img { transform: scale(1.05); filter: grayscale(0%); }
  .tribute-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, black 20%, transparent 100%); padding: 30px; display: flex; flex-direction: column; align-items: flex-start; z-index: 2; }
  .legend-badge { background: var(--neon-gold); color: black; font-weight: 900; padding: 5px 15px; font-size: 1rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
  .tribute-title { font-size: 3.5rem; line-height: 0.9; margin: 0; color: white; text-shadow: 3px 3px 0px black; font-weight: 900; }
  @media (min-width: 768px) { .tribute-title { font-size: 6rem; } }
  .tribute-dates { font-size: 1.5rem; color: #ccc; margin-top: 10px; font-weight: bold; text-shadow: 2px 2px 0px black; }
  .tribute-content { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 900px) { .tribute-content { grid-template-columns: 1.5fr 1fr; } }
  .tribute-playlist { padding: 30px; border-bottom: 1px solid #333; background: #080808; }
  @media (min-width: 900px) { .tribute-playlist { border-right: 1px solid #333; border-bottom: none; } }
  .tribute-section-title { color: var(--neon-gold); font-size: 1.5rem; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
  .song-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #222; transition: 0.2s; background: transparent; }
  .song-item:hover { background: #111; border-left: 4px solid var(--neon-gold); padding-left: 15px; }
  .song-name { font-size: 1rem; font-weight: bold; color: #eee; }
  .play-btn { color: var(--neon-gold); text-decoration: none; font-size: 0.8rem; font-weight: bold; border: 1px solid var(--neon-gold); padding: 8px 15px; transition: 0.2s; white-space: nowrap; }
  .play-btn:hover { background: var(--neon-gold); color: black; }
  .tribute-form-box { padding: 30px; background: #050505; display: flex; flex-direction: column; justify-content: center; }
  .goodbye-input { width: 100%; padding: 20px; background: #111; border: 1px solid #333; color: white; font-family: 'Courier New'; margin-bottom: 20px; resize: none; height: 150px; font-size: 1.1rem; line-height: 1.5; box-sizing: border-box; }
  .goodbye-input:focus { border-color: var(--neon-gold); outline: none; }
  .candle-msg { text-align: center; color: var(--neon-gold); font-size: 1.5rem; padding: 40px; border: 2px solid var(--neon-gold); background: rgba(255, 215, 0, 0.05); animation: flicker 3s infinite; font-weight: bold; }
  @keyframes flicker { 0%, 100% { opacity: 1; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); } 50% { opacity: 0.8; box-shadow: 0 0 5px rgba(255, 215, 0, 0.1); } }

  /* SEPARADORES */
  .section-spacer { margin-bottom: 120px; padding-bottom: 20px; border-bottom: 1px dashed #222; }
  .section-label { display: inline-block; background: var(--neon-green); color: black; font-weight: 900; padding: 5px 15px; font-size: 1.1rem; margin-bottom: 30px; transform: skewX(-10deg); box-shadow: 5px 5px 0px black; }

  /* GRID */
  .concert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; }
  .card { background: #111111; border: 3px solid var(--neon-yellow); display: flex; flex-direction: column; position: relative; transition: transform 0.2s; box-shadow: 5px 5px 0px rgba(0,0,0,0.5); }
  .card:hover { transform: translateY(-5px); box-shadow: 10px 10px 0 var(--neon-green); border-color: white; }
  .date-tag { position: absolute; top: -15px; left: -5px; background: #ff5757; color: black; font-weight: 900; padding: 5px 15px; border: 2px solid black; transform: rotate(-2deg); z-index: 10; font-size: 1.2rem; box-shadow: 3px 3px 0px black; }
  .card-image { width: 100%; height: 220px; object-fit: cover; border-bottom: 3px solid var(--neon-yellow); filter: grayscale(100%); transition: filter 0.3s; }
  .card:hover .card-image { filter: grayscale(0%); }
  .card-info { padding: 25px; display: flex; flex-direction: column; flex-grow: 1; }
  .card h3 { margin: 0 0 10px 0; font-size: 1.5rem; line-height: 1; text-transform: uppercase; min-height: 2.5em; color: white; word-break: break-word; }
  .venue { color: #888; margin-bottom: 20px; font-size: 1rem; font-weight: bold; }
  .buy-btn-green { margin-top: auto; background: var(--neon-green); color: black; text-align: center; padding: 15px; text-decoration: none; font-weight: 900; text-transform: uppercase; border: 2px solid black; display: block; font-size: 1.2rem; transition: all 0.2s; }
  .buy-btn-green:hover { background: white; box-shadow: 0 0 15px white; }

  /* FOOTER */
  .subscribe-section { max-width: 800px; margin: 80px auto 50px; padding: 40px; border: 2px dashed #555; background: #0a0a0a; text-align: center; }
  input { width: 100%; padding: 15px; background: #000; border: 2px solid #333; color: white; margin-bottom: 15px; font-family: 'Courier New'; box-sizing: border-box; font-weight: bold; border-radius: 0; }
  .form-btn { width: 100%; padding: 15px; font-weight: 900; border: none; cursor: pointer; text-transform: uppercase; font-family: 'Courier New'; font-size: 1.2rem; margin-top: 10px; border-radius: 0; }
  .success-msg { padding: 20px; border: 1px solid white; color: white; }
`;

// --- 3. DATOS ---
const ROBE_SONGS = [
  { id: 1, title: "Si Te Vas", query: "Extremoduro Si Te Vas Official" },
  { id: 2, title: "So Payaso", query: "Extremoduro So Payaso Official" },
  {
    id: 3,
    title: "La Vereda de la Puerta de Atrás",
    query: "Extremoduro La Vereda",
  },
  { id: 4, title: "Standby", query: "Extremoduro Standby Official" },
  { id: 5, title: "Puta", query: "Extremoduro Puta Official" },
  { id: 6, title: "Salir", query: "Extremoduro Salir Official" },
  { id: 7, title: "Golfa", query: "Extremoduro Golfa Official" },
  { id: 8, title: "Ama, Ama y Ensancha el Alma", query: "Extremoduro Ama Ama" },
  {
    id: 9,
    title: "Mierda de Filosofía",
    query: "Robe Mierda de Filosofia Official",
  },
  {
    id: 10,
    title: "El Poder del Arte",
    query: "Robe El Poder del Arte Official",
  },
];

const MOCK_INDIE: Evento[] = [
  {
    id: "i1",
    name: "THE BLAZE",
    dates: { start: { localDate: "2025-06-20" } },
    _embedded: { venues: [{ name: "Razzmatazz" }] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80",
        width: 800,
      },
    ],
    url: "#",
    classifications: [{ genre: { name: "electronic" } }],
  },
  {
    id: "i2",
    name: "FONTAINES D.C.",
    dates: { start: { localDate: "2025-05-15" } },
    _embedded: { venues: [{ name: "Wizink" }] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=600&q=80",
        width: 800,
      },
    ],
    url: "#",
    classifications: [{ genre: { name: "rock" } }],
  },
];

// --- 4. COMPONENTES ---
const LegendTribute = () => {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [eventosMusica, setEventosMusica] = useState<any[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);

  const sendGoodbye = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = "none";
    const parent = e.currentTarget.parentNode as HTMLElement;
    if (parent)
      parent.style.background =
        "linear-gradient(135deg, #FFD700 0%, #000 100%)";
  };

  return (
    <div className="tribute-container">
      <div className="tribute-header">
        <img
          src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Homenaje Robe Iniesta"
          className="tribute-img"
          onError={handleImgError}
        />
        <div className="tribute-overlay">
          <div className="legend-badge">LEYENDA ETERNA</div>
          <h2 className="tribute-title">ROBE INIESTA</h2>
          <div className="tribute-dates">1962 - 2025</div>
        </div>
      </div>
      <div className="tribute-content">
        <div className="tribute-playlist">
          <div className="tribute-section-title">TOP 10 HIMNOS ETERNOS</div>
          {ROBE_SONGS.map((song) => (
            <div key={song.id} className="song-item">
              <span className="song-name">
                #{song.id} {song.title.toUpperCase()}
              </span>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  song.query
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="play-btn"
              >
                ESCUCHAR ▶
              </a>
            </div>
          ))}
        </div>
        <div className="tribute-form-box">
          <div className="tribute-section-title">TU ÚLTIMO ADIÓS</div>
          {!sent ? (
            <form onSubmit={sendGoodbye}>
              <p
                style={{
                  color: "#888",
                  marginBottom: "20px",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                El poeta de lo sucio nos ha dejado, pero sus versos son
                inmortales. <br /> Deja tu mensaje para el libro digital de
                fans.
              </p>
              <textarea
                className="goodbye-input"
                placeholder="Escribe tu mensaje aquí..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
              <button
                className="form-btn"
                style={{ background: "var(--neon-gold)", color: "black" }}
              >
                ENCENDER VELA 🕯️
              </button>
            </form>
          ) : (
            <div className="candle-msg">
              🕯️ VELA ENCENDIDA <br /> <br /> "ME VOY, VOLANDO POR AHÍ..."{" "}
              <br /> <br /> GRACIAS POR TU MENSAJE.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 5. LOGICA ---
const detectingGenero = (txt: string) => {
  txt = txt.toLowerCase();
  if (txt.includes("rock") || txt.includes("metal") || txt.includes("punk"))
    return "ROCK";
  if (txt.includes("indie") || txt.includes("alternative")) return "INDIE";
  if (
    txt.includes("electronic") ||
    txt.includes("techno") ||
    txt.includes("house")
  )
    return "ELECTRONICA";
  if (txt.includes("urban") || txt.includes("rap") || txt.includes("trap"))
    return "URBANA";
  if (txt.includes("pop")) return "POP";
  return "OTROS";
};

// --- 6. APP ---
function App() {
  const [activeTab, setActiveTab] = useState("conciertos");
  const [eventos, setEventos] = useState<any[]>([]); // Usamos any para evitar peleas con propiedades extra
  const [filtros, setFiltros] = useState({
    city: "TODAS",
    genre: "TODOS",
    month: "TODOS",
  });
  const [form, setForm] = useState({
    nom: "",
    mail: "",
    a1: "",
    a2: "",
    a3: "",
  });
  const [sent, setSent] = useState(false);

  const API_KEY = "BJ3Y8ZAac5K1knkFCn3cnb3bsTmqzrx6";
  const FORMSPREE = "https://formspree.io/f/mwpgnlkn";

  useEffect(() => {
    const s = document.createElement("style");
    s.innerText = misEstilos;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&countryCode=ES&classificationName=music&size=100&sort=date,asc`;
      if (filtros.city !== "TODAS") url += `&city=${filtros.city}`;

      try {
        const tm = await fetch(url).then((r) => r.json());

        let all: any[] = [];
        if (tm._embedded?.events) {
          all = tm._embedded.events.map((ev: any) => ({
            id: ev.id,
            name: ev.name,
            url: ev.url,
            images: ev.images,
            dates: ev.dates,
            _embedded: ev._embedded,
            genre: detectingGenero(
              (ev.classifications?.[0]?.genre?.name || "") +
                " " +
                (ev.classifications?.[0]?.subGenre?.name || "")
            ),
          }));
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fut = all.filter(
          (e) =>
            e.dates?.start?.localDate &&
            new Date(e.dates.start.localDate) >= hoy
        );
        fut.sort(
          (a, b) =>
            new Date(a.dates.start.localDate).getTime() -
            new Date(b.dates.start.localDate).getTime()
        );

        setEventos(fut);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    load();
  }, [filtros.city]);

  const filtered = eventos.filter((e) => {
    if (filtros.genre !== "TODOS" && e.genre !== filtros.genre) return false;
    if (
      filtros.month !== "TODOS" &&
      new Date(e.dates.start.localDate).getMonth() + 1 !==
        parseInt(filtros.month)
    )
      return false;
    return true;
  });

  const formatearFecha = (iso: string) => {
    if (!iso) return "TBC";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="main-container">
      <header className="dashboard-header">
        <div className="brand-area">
          <h1>
            <span style={{ color: "#fce300" }}>⚡</span>SELECTORS
            <span style={{ color: "#00f3ff" }}>.</span>
          </h1>
          <div className="subtitle">LA INTELIGENCIA MUSICAL EN VIVO</div>
        </div>
        {activeTab === "conciertos" && (
          <div className="filter-stack">
            <select
              className="cyber-select"
              onChange={(e) => setFiltros({ ...filtros, city: e.target.value })}
            >
              <option value="TODAS">CIUDAD: TODA ESPAÑA</option>
              <option value="Barcelona">BARCELONA</option>
              <option value="Madrid">MADRID</option>
              <option value="Valencia">VALENCIA</option>
              <option value="Bilbao">BILBAO</option>
              <option value="Sevilla">SEVILLA</option>
            </select>
            <select
              className="cyber-select"
              onChange={(e) =>
                setFiltros({ ...filtros, genre: e.target.value })
              }
            >
              <option value="TODOS">GÉNERO: TODOS</option>
              <option value="ROCK">ROCK / METAL</option>
              <option value="INDIE">INDIE / ALT</option>
              <option value="ELECTRONICA">ELECTRÓNICA</option>
              <option value="URBANA">URBANO / TRAP</option>
              <option value="POP">POP</option>
            </select>
            <select
              className="cyber-select"
              onChange={(e) =>
                setFiltros({ ...filtros, month: e.target.value })
              }
            >
              <option value="TODOS">FECHA: CUALQUIERA</option>
              <option value="1">ENERO</option>
              <option value="2">FEBRERO</option>
              <option value="3">MARZO</option>
              <option value="4">ABRIL</option>
              <option value="5">MAYO</option>
              <option value="6">JUNIO</option>
              <option value="7">JULIO</option>
              <option value="8">AGOSTO</option>
              <option value="9">SEPTIEMBRE</option>
              <option value="10">OCTUBRE</option>
              <option value="11">NOVIEMBRE</option>
              <option value="12">DICIEMBRE</option>
            </select>
          </div>
        )}
      </header>

      <nav className="nav-tabs">
        <button className={`tab-btn active`}>CONCIERTOS</button>
      </nav>

      {activeTab === "conciertos" && (
        <>
          <LegendTribute />
          <div className="section-spacer">
            <div
              className="section-label"
              style={{ background: "var(--neon-green)" }}
            >
              PRÓXIMOS CONCIERTOS ({filtered.length})
            </div>
            <div className="concert-grid">
              {filtered.map((e) => (
                <article key={e.id} className="card">
                  <div className="date-tag">
                    {formatearFecha(e.dates.start.localDate)}
                  </div>
                  <img
                    src={
                      e.images.find((i: any) => i.width > 600)?.url ||
                      e.images[0]?.url
                    }
                    className="card-image"
                    alt={e.name}
                  />
                  <div className="card-info">
                    <h3>{e.name}</h3>
                    <div className="venue">
                      📍 {e._embedded?.venues?.[0]?.name}
                    </div>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="buy-btn-green"
                    >
                      ENTRADAS -&gt;
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      <section className="subscribe-section" style={{ borderColor: "#00f3ff" }}>
        <h2 style={{ fontSize: "3rem", margin: "0 0 20px 0", lineHeight: 1 }}>
          SISTEMA <span style={{ color: "var(--neon-blue)" }}>RADAR</span>
        </h2>
        <p style={{ color: "#888", marginBottom: "30px" }}>
          TE AVISAMOS CUANDO TUS ARTISTAS FAVORITOS ANUNCIEN GIRA.
        </p>
        {!sent ? (
          <form onSubmit={send}>
            <input
              type="text"
              placeholder="TU NOMBRE"
              required
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <input
              type="email"
              placeholder="TU EMAIL"
              required
              onChange={(e) => setForm({ ...form, mail: e.target.value })}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                className="input-artist"
                placeholder="ARTISTA 1"
                onChange={(e) => setForm({ ...form, a1: e.target.value })}
              />
              <input
                className="input-artist"
                placeholder="ARTISTA 2"
                onChange={(e) => setForm({ ...form, a2: e.target.value })}
              />
              <input
                className="input-artist"
                placeholder="ARTISTA 3"
                onChange={(e) => setForm({ ...form, a3: e.target.value })}
              />
            </div>
            <button className="form-btn" style={{ background: "#00f3ff" }}>
              ACTIVAR RASTREO
            </button>
          </form>
        ) : (
          <div className="success-msg">✅ RADAR ACTIVADO</div>
        )}
      </section>
    </div>
  );
}

// FUNCIONES PARA OBTENER EVENTOS DE TICKETMASTER Y EVENTBRITE
// Obtener eventos de Ticketmaster
async function fetchTicketmasterEvents() {
  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&countryCode=ES&size=50&apikey=${API_TICKETMASTER}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data._embedded?.events) {
      return data._embedded.events.map((event: any) => ({
        id: event.id,
        nombre: event.name,
        fecha: event.dates?.start?.localDate || "N/A",
        lugar: event._embedded?.venues?.[0]?.name || "N/A",
        ciudad: event._embedded?.venues?.[0]?.city?.name || "N/A",
        imagen: event.images?.[0]?.url || "",
        url: event.url || "#",
        plataforma: "Ticketmaster",
      }));
    }
    return [];
  } catch (error) {
    console.log("Ticketmaster API - Necesita clave válida");
    return [];
  }
}

// Obtener eventos de Eventbrite
async function fetchEventbriteEvents() {
  try {
    const url = `https://www.eventbriteapi.com/v3/events/search/?q=musica&location.address=Spain&token=${API_EB}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.events) {
      return data.events.map((event: any) => ({
        id: event.id,
        nombre: event.name.text,
        fecha: event.start?.local?.split("T")[0] || "N/A",
        lugar: event.venue?.name || "N/A",
        ciudad: event.venue?.address?.city || "N/A",
        imagen: event.logo?.url || "",
        url: event.url || "#",
        plataforma: "Eventbrite",
      }));
    }
    return [];
  } catch (error) {
    console.log("Eventbrite API - Conectando...");
    return [];
  }
}

export default App;
