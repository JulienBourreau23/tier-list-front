"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTierList } from "@/components/providers/TierListProvider";
import { useMonsters } from "@/lib/tier-list/useMonsters";

function getIconUrl(com2us_id) {
  return `/api/icons/${com2us_id}.png`;
}

// Éléments disponibles selon l'onglet actif
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
      className="flex min-w-[60px] max-w-[80px] flex-shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--accent)] px-2 py-2 font-[inherit] transition-transform duration-150 hover:scale-110 hover:-translate-y-0.5 select-none"
    >
      <Image
        src={iconUrl}
        alt={monster.nom_en}
        width={48}
        height={48}
        className="rounded-lg"
        unoptimized
      />
      <span className="w-full text-center text-[9px] font-bold text-[var(--muted-foreground)] leading-tight line-clamp-2 break-words">
        {monster.nom_en}
      </span>
    </button>
  );
}

export default function MonsterPool() {
  const { activeTab, placedIds } = useTierList();
  const { data, isLoading, isError } = useMonsters(activeTab);
  const [search, setSearch] = useState("");
  const [activeElement, setActiveElement] = useState(null);

  // Remet le filtre élément à zéro quand on change d'onglet
  const elements = ELEMENTS_BY_TAB[activeTab] ?? [];

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
    <div className="mt-6 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--secondary)] px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
          👾 Monstres disponibles
        </span>
        <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
          {isLoading
            ? "Chargement..."
            : `${monsters.length} monstre${monsters.length !== 1 ? "s" : ""} · Glisser vers un tier`}
        </span>
      </div>

      {/* Barre de recherche + filtres élément */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--secondary)]/50 px-4 py-2">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[160px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un monstre..."
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] py-1.5 pl-8 pr-3 text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs"
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
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                activeElement === el.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--foreground)]"
              }`}
            >
              <span>{el.emoji}</span>
              <span>{el.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corps — hauteur fixe ~4 lignes, scroll vertical */}
      <div
        className="overflow-y-auto p-4"
        style={{ maxHeight: "calc(4 * (48px + 20px + 8px) + 32px)" }}
      >
        {isLoading && (
          <div className="flex w-full items-center justify-center gap-2 py-6 text-sm text-[var(--muted-foreground)]">
            <span className="animate-spin">⏳</span> Chargement des monstres...
          </div>
        )}

        {isError && (
          <div className="w-full py-4 text-center text-sm text-[var(--destructive)]">
            ⚠️ Impossible de charger les monstres. Vérifie que ton API est
            démarrée.
          </div>
        )}

        {!isLoading && !isError && monsters.length === 0 && (
          <span className="block w-full py-6 text-center text-xs font-semibold text-[var(--muted-foreground)] opacity-50">
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
    </div>
  );
}
