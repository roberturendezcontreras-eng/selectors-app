import React, { useState, useEffect } from "react";

// ============================================================
// TYPES AND INTERFACES
// ============================================================

export interface AggregatedEvent {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string;
  ciudad: string;
  imagen: string;
  url: string;
  plataforma: "Eventbrite" | "Ticketmaster";
  descripcion?: string;
  precio?: string;
}

interface EventAggregatorProps {
  city?: string;
  query?: string;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Function to aggregate events from both Eventbrite and Ticketmaster
export async function aggregateEvents(
  eventbriteEvents: any[],
  ticketmasterEvents: any[]
): Promise<AggregatedEvent[]> {
  const aggregated: AggregatedEvent[] = [];

  // Process Eventbrite events
  if (eventbriteEvents && eventbriteEvents.length > 0) {
    eventbriteEvents.forEach((event: any) => {
      aggregated.push({
        id: event.id,
        nombre: event.name?.text || "Sin nombre",
        fecha: event.start?.local || "Fecha no disponible",
        lugar: event.venue_id || "Sin lugar",
        ciudad: "Eventbrite",
        imagen: event.logo?.url || "",
        url: event.url || "",
        plataforma: "Eventbrite",
        descripcion: event.description?.text || "",
        precio: event.status || "Precio no disponible",
      });
    });
  }

  // Process Ticketmaster events
  if (ticketmasterEvents && ticketmasterEvents.length > 0) {
    ticketmasterEvents.forEach((event: any) => {
      aggregated.push({
        id: event.id,
        nombre: event.name || "Sin nombre",
        fecha: event.dates?.start?.localDate || "Fecha no disponible",
        lugar: event._embedded?.venues?.[0]?.name || "Sin lugar",
        ciudad: event._embedded?.venues?.[0]?.city?.name || "Sin ciudad",
        imagen: event.images?.[0]?.url || "",
        url: event.url || "",
        plataforma: "Ticketmaster",
        descripcion: event.info || "",
        precio: event.priceRanges?.[0]?.max || "Precio no disponible",
      });
    });
  }

  return aggregated;
}

// Function to filter events by city
export function filterEventsByCity(
  events: AggregatedEvent[],
  city: string
): AggregatedEvent[] {
  return events.filter((event) =>
    event.ciudad.toLowerCase().includes(city.toLowerCase())
  );
}

// Function to filter events by date range
export function filterEventsByDateRange(
  events: AggregatedEvent[],
  startDate: string,
  endDate: string
): AggregatedEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.fecha).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return eventDate >= start && eventDate <= end;
  });
}

// ============================================================
// REACT COMPONENT
// ============================================================

const EventAggregatorComponent: React.FC<EventAggregatorProps> = ({
  city = "Madrid",
  query = "",
}) => {
  const [events, setEvents] = useState<AggregatedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Contar eventos de Eventbrite
  const eventbriteCount = events.filter(
    (e) => e.plataforma === "Eventbrite"
  ).length;
  const ticketmasterCount = events.filter(
    (e) => e.plataforma === "Ticketmaster"
  ).length;

  useEffect(() => {
    // Placeholder for fetching aggregated events
    // In a real implementation, this would call the API
    setLoading(false);
  }, [city, query]);

  return (
    <div
      style={{ padding: "20px", backgroundColor: "#f5f5f5", marginTop: "20px" }}
    >
      <h2 style={{ color: "#333", marginBottom: "20px" }}>
        Eventos Agregados - {city}
      </h2>
      {/* STATISTICS SECTION */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#e8f4f8",
          border: "2px solid #0066cc",
          borderRadius: "5px",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          <strong>📊 Total de eventos:</strong> {events.length}
        </p>
        <p style={{ margin: "5px 0" }}>
          <strong>🎫 Eventbrite:</strong> {eventbriteCount} eventos
        </p>
        <p style={{ margin: "5px 0" }}>
          <strong>🎪 Ticketmaster:</strong> {ticketmasterCount} eventos
        </p>
      </div>
      {loading && <p style={{ color: "#666" }}>Cargando eventos...</p>}
      {!loading && events.length === 0 && (
        <p style={{ color: "#999" }}>
          No hay eventos disponibles en este momento.
        </p>
      )}
      {!loading && events.length > 0 && (
        <div>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                borderRadius: "5px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{event.nombre}</h3>
              <p>
                <strong>Plataforma:</strong> {event.plataforma}
              </p>
              <p>
                <strong>Fecha:</strong> {event.fecha}
              </p>
              <p>
                <strong>Lugar:</strong> {event.lugar}
              </p>
              {event.ciudad && (
                <p>
                  <strong>Ciudad:</strong> {event.ciudad}
                </p>
              )}
              {event.precio && (
                <p>
                  <strong>Precio:</strong> {event.precio}
                </p>
              )}
              {event.imagen && (
                <img
                  src={event.imagen}
                  alt={event.nombre}
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              )}
              {event.url && (
                <p>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0066cc" }}
                  >
                    Ver más
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// EXPORTS
// ============================================================

export { EventAggregatorComponent };
export default EventAggregatorComponent;
