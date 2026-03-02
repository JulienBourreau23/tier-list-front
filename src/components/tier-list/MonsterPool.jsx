"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTierList } from "@/components/providers/TierListProvider";
import { useMonsters } from "@/lib/tier-list/useMonsters";
import { cn } from "@/lib/utils";

/**
 * Retourne l'URL de l'icône d'un monstre depuis l'API locale.
 * @param {number|string} com2us_id - L'identifiant Com2uS du monstre
 * @returns {string} L'URL de l'image PNG
 */

function getIconUrl(com2us_id) {
  return `/api/icons/${com2us_id}.png`;
}

/**
 * @typedef {"nat4-fwe"|"nat4-dl"|"nat5-fwe"|"nat5-dl"} TabId
 * Identifiant d'un onglet de la tier list.
 */

/**
 * @typedef {Object} ElementFilter
 * @property {string} id      - Identifiant technique de l'élément (ex: "Fire")
 * @property {string} label   - Libellé affiché (ex: "Feu")
 * @property {string} emoji   - Emoji représentatif (ex: "🔥")
 */

/**
 * Map des filtres d'éléments disponibles par onglet.
 * @type {Record<TabId, ElementFilter[]>}
 */

const ELEMENTS_BY_TAB = {
  "nat4-fwe": [
    { id: "Fire", label: "Feu", emoji: "🔥" },
    { id: "Water", label: "Eau", emoji: "💧" },
    { id: "Wind", label: "Vent", emoji: "💨" },
  ],
  "nat4-dl": [
    { id: "Light", label: "Lumière", emoji: "✨" },
    { id: "Dark", label: "Ténèbre", emoji: "🌑" },
  ],
  "nat5-fwe": [
    { id: "Fire", label: "Feu", emoji: "🔥" },
    { id: "Water", label: "Eau", emoji: "💧" },
    { id: "Wind", label: "Vent", emoji: "💨" },
  ],
  "nat5-dl": [
    { id: "Light", label: "Lumière", emoji: "✨" },
    { id: "Dark", label: "Ténèbre", emoji: "🌑" },
  ],
};

/**
 * @typedef {Object} Monster
 * @property {number} com2us_id     - Identifiant unique Com2uS
 * @property {string} nom_en        - Nom anglais du monstre
 * @property {string} element       - Élément (ex: "Fire", "Water"…)
 * @property {number} natural_stars - Nombre d'étoiles naturelles (4 ou 5)
 */

/**
 * Icône draggable représentant un monstre dans le pool.
 * Peut être glissée vers un tier via drag-and-drop (dataTransfer "monsterJson").
 *
 * @param {Object} props
 * @param {Monster} props.monster - Le monstre à afficher
 * @returns {JSX.Element}
 */

function MonsterIcon({ monster }) {
  const iconUrl = getIconUrl(monster.com2us_id);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("monsterJson", JSON.stringify(monster));
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      title={`${monster.nom_en} (${monster.element} ★${monster.natural_stars})`}
      aria-label={`Monstre ${monster.nom_en}`}
      className="flex min-w-15 max-w-20 shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-border bg-accent px-2 py-2 font-[inherit] transition-transform duration-150 hover:scale-110 hover:-translate-y-0.5 select-none"
    >
      <Image
        src={iconUrl}
        alt={monster.nom_en}
        width={48}
        height={48}
        className="rounded-lg"
        unoptimized
      />
      <span className="w-full text-center text-[9px] font-bold text-muted-foreground leading-tight line-clamp-2 wrap-break-word">
        {monster.nom_en}
      </span>
    </button>
  );
}

/**
 * Pool de monstres disponibles pour la tier list.
 *
 * Affiche les monstres non encore placés dans un tier, avec :
 * - un filtre par élément (selon l'onglet actif)
 * - une recherche par nom
 * - le drag-and-drop vers les tiers
 *
 * Les données sont récupérées via `useMonsters(activeTab)` et les monstres
 * déjà placés sont exclus grâce à `placedIds` fourni par `useTierList`.
 *
 * @returns {JSX.Element}
 *
 * @example
 * // Utilisation dans un layout de tier list
 * <TierListProvider>
 *   <TierBoard />
 *   <MonsterPool />
 * </TierListProvider>
 */

export default function MonsterPool() {
  const { activeTab, placedIds } = useTierList();
  const { data, isLoading, isError } = useMonsters(activeTab);
  const [search, setSearch] = useState("");
  const [activeElement, setActiveElement] = useState(null);

  // Remet le filtre élément à zéro quand on change d'onglet
  const elements = ELEMENTS_BY_TAB[activeTab] ?? [];

  /**
   * Liste filtrée des monstres :
   * - exclut les monstres déjà placés (`placedIds`)
   * - filtre par élément actif si sélectionné
   * - filtre par recherche textuelle (nom anglais, insensible à la casse)
   *
   * @type {Monster[]}
   */
  const monsters = useMemo(() => {
    let list = (data?.results ?? []).filter(
      (m) => !placedIds.has(String(m.com2us_id)),
    );
    if (activeElement) {
      list = list.filter((m) => m.element === activeElement);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.nom_en.toLowerCase().includes(q));
    }
    return list;
  }, [data, placedIds, activeElement, search]);

  const handleElementToggle = (id) => {
    setActiveElement((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-6 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          👾 Monstres disponibles
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {isLoading
            ? "Chargement..."
            : `${monsters.length} monstre${monsters.length !== 1 ? "s" : ""} · Glisser vers un tier`}
        </span>
      </div>
      {/* Barre de recherche + filtres élément */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-(--secondary)/50 px-4 py-2">
        {/* Recherche */}
        <div className="relative flex-1 min-w-40">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            🔍
          </span>
          <label htmlFor="search-monster" className="sr-only">
            Rechercher un monstre
          </label>
          <input
            id="search-monster"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un monstre..."
            className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-(--ring)/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtres par élément */}
        <div className="flex items-center gap-1">
          {elements.map((el) => (
            <button
              key={el.id}
              type="button"
              onClick={() => handleElementToggle(el.id)}
              aria-pressed={activeElement === el.id}
              title={el.label}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all duration-150",
                {
                  "border-primary bg-(--primary)/20 text-foreground":
                    activeElement === el.id,
                },
                {
                  "border-border bg-transparent text-muted-foreground hover:border-(--primary)/50 hover:text-foreground":
                    activeElement !== el.id,
                },
              )}
            >
              <span>{el.emoji}</span>
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div
        className="overflow-y-auto p-4"
        style={{ maxHeight: "calc(4 * (48px + 20px + 8px) + 32px)" }}
      >
        {isLoading && (
          <div className="flex w-full items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <span className="animate-spin">⏳</span> Chargement des monstres...
          </div>
        )}

        {isError && (
          <div className="w-full py-4 text-center text-sm text-destructive">
            ⚠️ Impossible de charger les monstres. Vérifie que ton API est
            démarrée.
          </div>
        )}

        {!isLoading && !isError && monsters.length === 0 && (
          <span className="block w-full py-6 text-center text-xs font-semibold text-muted-foreground opacity-50">
            {search || activeElement
              ? "Aucun monstre ne correspond aux filtres."
              : "Tous les monstres ont été placés 🎉"}
          </span>
        )}

        {!isLoading && !isError && monsters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {monsters.map((monster) => (
              <MonsterIcon key={monster.com2us_id} monster={monster} />
            ))}
          </div>
        )}
      </div>
      ;
    </div>
  );
}
