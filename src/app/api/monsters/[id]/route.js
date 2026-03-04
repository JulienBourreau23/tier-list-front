// src/app/api/monsters/[id]/route.js
// Proxy pour un monstre par com2us_id
import ky, { HTTPError } from "ky";

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const imageBuffer = await ky
      .get(`${API}/icons/${id}`, {
        headers: API_KEY ? { "X-API-Key": API_KEY } : {},
      })
      .arrayBuffer();
    return new Response(imageBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    if (error instanceof HTTPError) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }
}
