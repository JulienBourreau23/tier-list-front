// src/app/api/monsters/[id]/route.js
// Proxy pour récupérer les données JSON d'un monstre par son com2us_id
import ky, { HTTPError } from "ky";

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const data = await ky
      .get(`${API}/api/monsters/${id}`, {
        headers: API_KEY ? { "X-API-Key": API_KEY } : {},
      })
      .json();

    return Response.json(data);
  } catch (error) {
    if (error instanceof HTTPError) {
      return Response.json(
        { error: "Monstre introuvable" },
        { status: error.response.status },
      );
    }
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
