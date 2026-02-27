"use client";

import Image from "next/image";
import { useTierList } from "@/components/providers/TierListProvider";
import { useMonsters } from "@/lib/tier-list/useMonsters";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Toujours construire depuis com2us_id — ignore icon_url de l'API
function getIconUrl(com2us_id) {
  return `${API}/icons/${com2us_id}.png`;
}

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
      className="flex w-[72px] flex-shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--accent)] px-2 py-2 font-[inherit] transition-transform duration-150 hover:scale-110 hover:-translate-y-0.5 select-none"
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={monster.nom_en}
          width={48}
          height={48}
          className="rounded-lg"
          unoptimized
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--muted)] text-xl">
          ?
        </div>
      )}
      <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[9px] font-bold text-[var(--muted-foreground)]">
        {monster.nom_en}
      </span>
    </button>
  );
}

export default function MonsterPool() {
  const { activeTab, placedIds } = useTierList();
  const { data, isLoading, isError } = useMonsters(activeTab);

  const monsters = (data?.results ?? []).filter(
    (m) => !placedIds.has(String(m.com2us_id)),
  );

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
            Tous les monstres ont été placés 🎉
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
