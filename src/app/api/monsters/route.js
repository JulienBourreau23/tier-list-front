// src/app/api/monsters/route.js
// Proxy entre le navigateur et FastAPI.
// La clé API ne quitte jamais le serveur Next.js.

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(request) {
  // Récupère les query params de la requête entrante
  // ex: /api/monsters?stars=4&elements=Fire,Water,Wind
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(`${API}/api/monsters?${queryString}`, { headers });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Erreur API" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
