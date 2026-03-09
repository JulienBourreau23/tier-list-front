// src/app/not-found.jsx

import Link from "next/link";
import NotFoundLogo from "@/components/layout/not-found-logo";

/**
 * Page 404 personnalisée affichée par Next.js quand une route est introuvable.
 * Utilise les variables CSS du thème (clair/sombre) définies dans globals.css.
 * @returns {React.JSX.Element}
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-foreground">
      {/* SVG */}
      {/*<NotFoundLogo />*/}

      {/* Code erreur */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-8xl font-extrabold tracking-tight text-primary">
          404
        </h2>
        <p className="text-lg font-semibold text-muted-foreground">
          Cette page n'existe pas.
        </p>
        <p className="text-sm text-muted-foreground opacity-60">
          Tu t'es peut-être perdu en cherchant tes monstres 👾
        </p>
      </div>

      {/* Retour */}
      <Link
        href="/"
        className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-foreground"
      >
        ← Retour à la tier list
      </Link>
    </div>
  );
}
