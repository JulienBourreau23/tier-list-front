import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Génère dynamiquement l'image Open Graph de l'application.
 * Utilisée automatiquement par Next.js pour les previews sur les réseaux sociaux
 * (Discord, Twitter, Facebook...) quand un lien est partagé.
 *
 * @returns {ImageResponse} Une image PNG 1200x630px générée côté serveur
 */
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#111318",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div style={{ fontSize: 80 }}>🏆</div>
      <div style={{ color: "white", fontSize: 64, fontWeight: "bold" }}>
        Tier List Summoners War
      </div>
      <div style={{ color: "#888", fontSize: 32 }}>
        Classe tes monstres nat4, nat5 et 2A
      </div>
    </div>,
    { ...size },
  );
}
