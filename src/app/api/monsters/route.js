import ky, { HTTPError } from "ky";

const API = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const data = await ky
      .get(`${API}/api/monsters`, {
        searchParams,
        headers: API_KEY ? { "X-API-Key": API_KEY } : {},
      })
      .json();
    return Response.json(data);
  } catch (error) {
    if (error instanceof HTTPError) {
      return Response.json(
        { error: "Erreur API" },
        { status: error.response.status },
      );
    }
    return Response.json({ error: "Erreur Serveur" }, { status: 500 });
  }
}
