"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useTierListStore } from "@/lib/tier-list/store";
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
 * @typedef {"nat4-fwe"|"nat4-dl"|"nat5-fwe"|"nat5-dl"|"2a"} TabId
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
  "2a": [
    { id: "Fire", label: "Feu", emoji: "🔥" },
    { id: "Water", label: "Eau", emoji: "💧" },
    { id: "Wind", label: "Vent", emoji: "💨" },
    { id: "Light", label: "Lumière", emoji: "✨" },
    { id: "Dark", label: "Ténèbre", emoji: "🌑" },
  ],
  all: [
    { id: "Fire", label: "Feu", emoji: "🔥" },
    { id: "Water", label: "Eau", emoji: "💧" },
    { id: "Wind", label: "Vent", emoji: "💨" },
    { id: "Light", label: "Lumière", emoji: "✨" },
    { id: "Dark", label: "Ténèbre", emoji: "🌑" },
  ],
};

/**
 * @typedef {2|3|4|5} StarId
 * Nombre d'étoiles naturelles d'un monstre.
 */

/**
 * @typedef {Object} StarFilter
 * @property {StarId} id      - Nombre d'étoiles (2, 3, 4 ou 5)
 * @property {string} label   - Libellé affiché (ex: "4⭐")
 */

/**
 * Map des filtres d'étoiles disponibles par onglet.
 * Uniquement défini pour l'onglet "all".
 * @type {Record<string, StarFilter[]>}
 */
const STARS_BY_TAB = {
  all: [
    { id: 2, label: "2⭐" },
    { id: 3, label: "3⭐" },
    { id: 4, label: "4⭐" },
    { id: 5, label: "5⭐" },
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
 * @param {boolean} props.showName - Afficher ou non le nom du monstre
 * @returns {JSX.Element}
 */
function MonsterIcon({ monster, showName }) {
  const iconUrl = getIconUrl(monster.com2us_id);
  const iconSize = showName ? 48 : 60;

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
      className="flex shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-border bg-accent font-[inherit] transition-transform duration-150 hover:scale-110 hover:-translate-y-0.5 select-none"
      style={{
        padding: showName ? "8px" : "5px",
        minWidth: showName ? "60px" : "70px",
        maxWidth: showName ? "80px" : "80px",
      }}
    >
      <Image
        src={iconUrl}
        alt={monster.nom_en}
        width={iconSize}
        height={iconSize}
        className="rounded-lg"
        unoptimized
      />
      {showName && (
        <span className="w-full text-center text-[9px] font-bold text-muted-foreground leading-tight line-clamp-2 wrap-break-word">
          {monster.nom_en}
        </span>
      )}
    </button>
  );
}

/**
 * Pool de monstres disponibles pour la tier list.
 *
 * Affiche les monstres non encore placés dans un tier, avec :
 * - un filtre par élément (selon l'onglet actif)
 * - une recherche par nom (toujours active même si les noms sont masqués)
 * - le drag-and-drop vers les tiers
 *
 * Les données sont récupérées via `useMonsters(activeTab)` et les monstres
 * déjà placés sont exclus grâce à `placedIds` dérivé de `useTierListStore`.
 *
 * @returns {JSX.Element}
 */
export default function MonsterPool() {
  const activeTab = useTierListStore((state) => state.activeTab);
  const placedMonsters = useTierListStore((state) => state.placedMonsters);
  const removeMonster = useTierListStore((state) => state.removeMonster);
  const showMonsterNames = useTierListStore((state) => state.showMonsterNames);
  const toggleMonsterNames = useTierListStore(
    (state) => state.toggleMonsterNames,
  );
  const placedIds = useMemo(
    () =>
      new Set(
        Object.values(placedMonsters ?? {})
          .flat()
          .map((m) => String(m.com2us_id)),
      ),
    [placedMonsters],
  );
  const { data, isLoading, isError } = useMonsters(activeTab);
  const [search, setSearch] = useState("");
  const [activeElement, setActiveElement] = useState(null);
  /** @type {StarId|null} Nombre d'étoiles actif pour le filtre, null si aucun */
  const [activeStars, setActiveStars] = useState(
    activeTab === "all" ? 5 : null,
  );

  // Remet le filtre élément à zéro quand on change d'onglet
  const elements = ELEMENTS_BY_TAB[activeTab] ?? [];
  const stars = STARS_BY_TAB[activeTab] ?? [];

  /**
   * Liste filtrée des monstres :
   * - exclut les monstres déjà placés (`placedIds`)
   * - filtre par élément actif si sélectionné
   * - filtre par recherche textuelle (nom anglais, insensible à la casse)
   * Note : la recherche par nom fonctionne toujours, même si les noms sont masqués visuellement.
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
    if (activeStars) {
      list = list.filter((m) => m.natural_stars === activeStars);
    }
    return list;
  }, [data, placedIds, activeElement, search, activeStars]);

  /**
   * Permet le filtre par element sélectionné
   * @param {string} id - id de l'élément
   * @returns {void}
   */
  const handleElementToggle = (id) => {
    setActiveElement((prev) => (prev === id ? null : id));
  };

  /**
   * Autorise le drop sur la zone du pool.
   * @param {DragEvent} e
   * @returns {void}
   */
  const handleDragOver = (e) => e.preventDefault();

  /**
   * Retire le monstre déposé de son tier et le remet dans le pool.
   * @param {DragEvent} e
   * @returns {void}
   */
  const handleDrop = (e) => {
    e.preventDefault();
    const json = e.dataTransfer.getData("monsterJson");
    if (json) {
      try {
        const monsterObj = JSON.parse(json);
        removeMonster(monsterObj.com2us_id);
      } catch (_) {
        /* ignore */
      }
    }
  };
  /**
   *  Bascule le filtre par nombre d'étoiles — sélectionne le nombre cliqué,
   *  ou le désélectionne s'il était déjà actif
   * @param {StarId} id - nombre d'étoiles
   * @returns {void}
   */
  const handleStarsToggle = (id) => {
    setActiveStars((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Zone de dépôt - pool de monstres"
      className="mt-6 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* En-tête */}
      <div className="grid grid-cols-3 items-center border-b border-border bg-secondary px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          👾 Monstres disponibles
        </span>
        <div className="flex items-center justify-center gap-4">
          {/* Toggle noms */}
          <button
            type="button"
            onClick={toggleMonsterNames}
            title={showMonsterNames ? "Masquer les noms" : "Afficher les noms"}
            className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Noms</span>
            {/* Interrupteur */}
            <span
              className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
              style={{
                backgroundColor: showMonsterNames
                  ? "var(--primary)"
                  : "var(--muted)",
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{
                  transform: showMonsterNames
                    ? "translateX(16px)"
                    : "translateX(0px)",
                }}
              />
            </span>
          </button>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {isLoading
              ? "Chargement..."
              : `${monsters.length} monstre${monsters.length !== 1 ? "s" : ""} · Glisser vers un tier`}
          </span>
        </div>
        {/* Filtres par étoiles — uniquement onglet "all" */}
        {stars.length > 0 && (
          <div className="flex items-center justify-end gap-1">
            {stars.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStarsToggle(s.id)}
                aria-pressed={activeStars === s.id}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all duration-150",
                  {
                    "border-primary bg-(--primary)/20 text-foreground":
                      activeStars === s.id,
                  },
                  {
                    "border-border bg-transparent text-muted-foreground hover:border-(--primary)/50 hover:text-foreground":
                      activeStars !== s.id,
                  },
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Barre de recherche + filtres élément */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-(--secondary)/50 px-4 py-2">
        {/* Recherche — toujours disponible même si les noms sont masqués */}
        <div className="relative flex-1 min-w-40">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            <Search />
          </span>
          <label htmlFor="search-monster" className="sr-only">
            Rechercher un monstre
          </label>
          <Input
            id="search-monster"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un monstre..."
            className="pl-8 pr-3 text-xs font-medium"
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
          <div className="w-full py-4 text-center text-sm text-muted-foreground">
            {search
              ? `Aucun résultat pour « ${search} »`
              : "Tous les monstres sont placés 🎉"}
          </div>
        )}

        {!isLoading && !isError && monsters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {monsters.map((m) => (
              <MonsterIcon
                key={m.com2us_id}
                monster={m}
                showName={showMonsterNames}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
