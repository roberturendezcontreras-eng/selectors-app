// /public/eventbrite.js - Proxy para Eventbrite (Serverless Function)
// Este archivo actúa como puente para evitar bloqueos CORS
// Oculta la API Key privada y normaliza los datos

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 1. Obtener parámetros
    const { city = "Madrid", q = "music", page = 1, limit = 50 } = req.query;

    // 2. API Key (Hardcodeada - en producción usar env variable)
    // IMPORTANTE: En Vercel real, esto sería: const API_KEY = process.env.EVENTBRITE_API_KEY;
    const API_KEY = "4FZBXCGPGPHNCNUSTWWN"; // Tu API Key de Eventbrite

    if (!API_KEY) {
      return res.status(500).json({
        error: "API_KEY no configurada",
        hint: "Añade EVENTBRITE_API_KEY en variables de entorno",
      });
    }

    // 3. Construir URL a Eventbrite
    const eventbriteUrl = `https://www.eventbriteapi.com/v3/events/search/?q=${q}&location.address=${city}&expand=venue&page=${page}`;

    console.log(`[EVENTBRITE PROXY] Fetching: ${eventbriteUrl}`);

    // 4. Llamada Server-to-Server (Sin CORS porque no viene del navegador)
    const response = await fetch(eventbriteUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Eventbrite API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // 5. NORMALIZACIÓN: Mapear datos de Eventbrite a formato unificado
    const normalizedEvents = (data.events || []).map((event) => ({
      id: event.id,
      source: "EVENTBRITE",
      name: event.name?.text || "Sin nombre",
      date: event.start?.local ? event.start.local.split("T")[0] : "N/A",
      time: event.start?.local
        ? event.start.local.split("T")[1]?.slice(0, 5)
        : "",
      image:
        event.logo?.url ||
        "https://via.placeholder.com/400x200?text=Eventbrite+Event",
      url: event.url || "",
      venue: event.venue?.name || "Ubicación secreta",
      city: event.venue?.address?.city || city,
      description: event.description?.text || "",
      price: event.ticket_classes?.[0]?.cost?.display || "Consultar",
    }));

    // 6. Respuesta normalizada
    return res.status(200).json({
      success: true,
      source: "EVENTBRITE",
      events: normalizedEvents,
      pagination: data.pagination || {},
      total: data.pagination?.object_count || 0,
    });
  } catch (error) {
    console.error("[EVENTBRITE PROXY ERROR]", error);

    return res.status(500).json({
      error: "No se pudo conectar con Eventbrite",
      message: error.message,
      hint: "Verifica 1) API Key válida 2) Conexión a internet 3) Rate limits de Eventbrite",
    });
  }
}
