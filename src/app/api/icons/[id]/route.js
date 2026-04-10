// src/app/api/icons/[id]/route.js
// Proxy pour les icônes — le navigateur appelle /api/icons/23514.png
// Next.js ajoute la clé API et récupère l'image depuis FastAPI

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(_request, { params }) {
  const { id } = await params;

  const headers = {};
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(`${API}/icons/${id}`, { headers });

  if (!res.ok) {
    return new Response(null, { status: 404 });
  }

  const imageBuffer = await res.arrayBuffer();

  // ✅ NOUVEAU : Récupère les headers de cache depuis FastAPI
  const cacheControl = res.headers.get("cache-control");
  const etag = res.headers.get("etag");

  const responseHeaders = {
    "Content-Type": "image/png",
  };

  // ✅ Transmet les headers de cache au navigateur
  if (cacheControl) responseHeaders["Cache-Control"] = cacheControl;
  if (etag) responseHeaders.ETag = etag;

  return new Response(imageBuffer, {
    status: 200,
    headers: responseHeaders,
  });
}
