import { useState, useEffect } from "react";

const EventbriteIntegration = ({ city = "Madrid", query = "concierto" }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregatedEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intenta traer eventos de Eventbrite directamente con un endpoint mock
        const mockEventbriteEvents = [
          {
            id: "1",
            source: "EVENTBRITE",
            name: "Concierto Indie Madrid - Eventbrite",
            date: "2025-12-20",
            time: "20:00",
            image: "https://via.placeholder.com/300x200?text=Eventbrite+Event",
            url: "https://www.eventbrite.es",
            venueName: "Sala Apolo",
            venueCity: city,
            price: "€25",
            logo: "https://www.eventbrite.com/l/static/images/logos/eventbrite-logo-149x50.png",
          },
          {
            id: "2",
            source: "EVENTBRITE",
            name: "Festival Electrónico Barcelona - Eventbrite",
            date: "2025-12-22",
            time: "22:00",
            image:
              "https://via.placeholder.com/300x200?text=Electronic+Festival",
            url: "https://www.eventbrite.es",
            venueName: "Parc Güell",
            venueCity: "Barcelona",
            price: "€40",
            logo: "https://www.eventbrite.com/l/static/images/logos/eventbrite-logo-149x50.png",
          },
        ];

        setEvents(mockEventbriteEvents);
      } catch (err: any) {
        console.error("Error en EventbriteIntegration:", err);
        setError(`No se pudieron cargar eventos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedEvents();
  }, [city, query]);

  if (loading)
    return (
      <div className="text-center py-12 text-white">
        Cargando eventos de Eventbrite...
      </div>
    );
  if (error)
    return <div className="text-red-500 py-12 text-center">{error}</div>;
  if (events.length === 0)
    return (
      <div className="text-gray-400 py-12 text-center">
        No hay eventos encontrados en Eventbrite
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <h2 className="col-span-full text-3xl font-bold text-cyan-400 mb-4">
        ✨ Eventos de Eventbrite
      </h2>
      {events.map((event) => (
        <div
          key={`${event.source}-${event.id}`}
          className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer border border-cyan-500/30"
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e: any) =>
                (e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image")
              }
            />
            <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-xs text-white font-bold">EVENTBRITE</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
              {event.name}
            </h3>

            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">📅</span>
                <span>
                  {event.date} {event.time && `@ ${event.time}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">📍</span>
                <span>{event.venueName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">💰</span>
                <span>{event.price}</span>
              </div>
            </div>

            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded font-bold text-center hover:opacity-80 transition block"
            >
              VER EN EVENTBRITE
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventbriteIntegration;
