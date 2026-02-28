// src/app/api/monsters/[id]/route.js
// Proxy pour un monstre par com2us_id

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(_request, { params }) {
  const { id } = await params;

  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(`${API}/api/monsters/${id}`, { headers });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Monstre introuvable" }), {
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
