"use client";

import { useQueryClient } from "@tanstack/react-query";
import { MoveDown, MoveUp, Settings } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TABS } from "@/lib/tier-list/constants";
import { useTierListStore } from "@/lib/tier-list/store";
import TierEditPanel from "./TierEditPanel";

/**
 * Récupération de l'icone des monstres
 * @param {number} com2us_id - id du monstre
 * @returns {string} Lien vers l'icone du monstre
 */
function getIconUrl(com2us_id) {
  return `/api/icons/${com2us_id}.png`;
}

/**
 * Icône draggable d'un monstre placé dans un tier.
 * Supporte le réordonnancement par drag-and-drop à l'intérieur du même tier,
 * ainsi que le déplacement vers un autre tier.
 * Un clic retire le monstre de son tier.
 *
 * @param {Object}  props
 * @param {import('@/lib/tier-list/store').Monster} props.monster   - Le monstre à afficher
 * @param {number|string}  props.tierId    - Id du tier contenant le monstre
 * @param {number}  props.index     - Index du monstre dans le tier
 * @param {boolean} props.showName  - Afficher ou non le nom du monstre
 * @returns {React.JSX.Element}
 */
function MonsterChip({ monster, tierId, index, showName }) {
  const removeMonster = useTierListStore((state) => state.removeMonster);
  const reorderMonster = useTierListStore((state) => state.reorderMonster);
  const placeMonster = useTierListStore((state) => state.placeMonster);
  const [dropSide, setDropSide] = useState(null); // "left" | "right" | null

  /** Démarre le drag : transmet le monstre + le tier source */
  const handleDragStart = (e) => {
    e.dataTransfer.setData("monsterJson", JSON.stringify(monster));
    e.dataTransfer.setData("fromTierId", String(tierId));
    e.dataTransfer.setData("fromIndex", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Pendant le survol : détermine si le curseur est à gauche ou à droite
   * du centre du chip pour afficher le bon indicateur de position.
   * @param {DragEvent} e - Survol
   * @returns {void}
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    setDropSide(e.clientX < mid ? "left" : "right");
  };

  /**
   * Réinitialise l'indicateur visuel de position quand le curseur quitte le chip.
   * @returns {void}
   */
  const handleDragLeave = () => setDropSide(null);

  /**
   * Drop sur ce chip : réordonne dans le même tier ou déplace depuis un autre.
   * @param {DragEvent} e - L'événement de drop natif
   * @returns {void}
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropSide(null);

    const json = e.dataTransfer.getData("monsterJson");
    if (!json) return;
    try {
      const monsterObj = JSON.parse(json);
      const fromTierId = e.dataTransfer.getData("fromTierId");
      const fromIndex = parseInt(e.dataTransfer.getData("fromIndex"), 10);

      // Calcule la position cible (avant ou après ce chip)
      const rect = e.currentTarget.getBoundingClientRect();
      const insertAfter = e.clientX >= rect.left + rect.width / 2;
      let toIndex = insertAfter ? index + 1 : index;

      if (fromTierId === String(tierId)) {
        // Même tier → réordonnancement
        // Ajustement de l'index si on déplace vers la droite
        if (fromIndex < toIndex) toIndex -= 1;
        reorderMonster(monsterObj.com2us_id, tierId, toIndex);
      } else {
        // Tier différent → place le monstre à la position cible
        placeMonster(monsterObj, tierId, toIndex);
      }
    } catch (_) {
      /* ignore */
    }
  };

  const handleRemove = () => removeMonster(monster.com2us_id);
  const iconSize = showName ? 40 : 52;

  return (
    <li
      className="relative flex shrink-0"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Indicateur d'insertion à gauche */}
      {dropSide === "left" && (
        <span className="pointer-events-none absolute -left-1.5 top-0 bottom-0 w-1 rounded-full bg-primary z-10" />
      )}

      <button
        type="button"
        draggable
        onDragStart={handleDragStart}
        onClick={handleRemove}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRemove();
        }}
        title={`${monster.nom_en} — clic pour retirer`}
        className="flex shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-border bg-accent font-[inherit] transition-transform duration-150 hover:scale-110 select-none"
        style={{
          padding: showName ? "6px" : "4px",
          minWidth: showName ? "56px" : "60px",
          maxWidth: showName ? "80px" : "68px",
        }}
      >
        <Image
          data-monster-icon
          src={getIconUrl(monster.com2us_id)}
          alt={monster.nom_en}
          width={iconSize}
          height={iconSize}
          className="rounded-lg shrink-0"
          loading="lazy"
          unoptimized
        />
        {showName && (
          <span className="w-full text-center text-[9px] font-bold text-muted-foreground leading-tight line-clamp-2 wrap-break-word">
            {monster.nom_en}
          </span>
        )}
      </button>

      {/* Indicateur d'insertion à droite */}
      {dropSide === "right" && (
        <span className="pointer-events-none absolute -right-1.5 top-0 bottom-0 w-1 rounded-full bg-primary z-10" />
      )}
    </li>
  );
}

/**
 * Permet la gestion des tier, affichage titre, monstres placés à l'intérieur, déplacement des monstres,
 * et la modification des tier
 * @param {object} props - propriété des tiers (id, titre, liste des monstres...)
 * @param {object} props.tier - propriété du tier choisi
 * @param {number} props.index - index du tier
 * @param {number} props.total - nombre total de tier
 * @returns {React.JSX.Element}
 * @component
 */
export default function TierCard({ tier, index, total }) {
  const editingId = useTierListStore((state) => state.editingId);
  const openEdit = useTierListStore((state) => state.openEdit);
  const closeEdit = useTierListStore((state) => state.closeEdit);
  const moveUp = useTierListStore((state) => state.moveUp);
  const moveDown = useTierListStore((state) => state.moveDown);
  const placedMonsters = useTierListStore((state) => state.placedMonsters);
  const placeMonster = useTierListStore((state) => state.placeMonster);
  const showMonsterNames = useTierListStore((state) => state.showMonsterNames);
  const queryClient = useQueryClient();
  /**
   * Mappe les IDs stockés vers les objets monstres complets.
   * Cherche dans TOUS les caches React Query.
   * @type {import('@/lib/tier-list/store').Monster[]}
   */
  const monsters = useMemo(() => {
    const monsterIds = placedMonsters[tier.id] ?? [];
    if (monsterIds.length === 0) return [];

    // Collecte tous les monstres de tous les onglets
    const allMonsters = [];
    for (const tab of TABS) {
      const cached = queryClient.getQueryData(["monsters", tab.id]);
      if (cached?.results) {
        allMonsters.push(...cached.results);
      }
    }

    // Mappe les IDs → objets complets
    return monsterIds
      .map((id) => allMonsters.find((m) => m.com2us_id === id))
      .filter(Boolean);
  }, [placedMonsters, tier.id, queryClient]);

  const isEditing = editingId === tier.id;
  const editColor = useTierListStore((state) => state.editColor);
  const editLabel = useTierListStore((state) => state.editLabel);

  const displayColor = isEditing ? editColor.color : tier.color;
  const displayGlow = isEditing ? editColor.glow : tier.glow;
  const displayLabel = isEditing ? editLabel : tier.label;

  /**
   * Permet de drag and drop sans recharger la page
   * @param {DragEvent} e - Empêche le fonctionnement par défaut
   * @returns {void}
   */
  const handleDragOver = (e) => e.preventDefault();

  /**
   * Fait le transfert de l'objet monstre du composant A au composant B
   * @param {DragEvent} e - Transfert les données
   * @returns {void}
   */
  const handleDrop = (e) => {
    e.preventDefault();
    // Essaie de récupérer l'objet complet
    const json = e.dataTransfer.getData("monsterJson");
    const chips = Array.from(e.currentTarget.querySelectorAll("li"));
    const index = chips.findIndex((chip) => {
      const rect = chip.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2;
    });
    if (json) {
      try {
        const monsterObj = JSON.parse(json);
        placeMonster(monsterObj, tier.id, index === -1 ? null : index);
      } catch (_) {
        /* ignore */
      }
    }
  };

  /**
   * Ouvre ou ferme la fenêtre édition du tier en fonction de son état
   * @returns {void}
   */
  const handleToggleEdit = () => {
    if (isEditing) closeEdit();
    else openEdit(tier);
  };

  return (
    <div
      data-tier-id={tier.id}
      data-tier-color={tier.color}
      className="w-full overflow-hidden rounded-2xl bg-card transition-transform duration-150 hover:-translate-y-px"
      style={{
        border: `1px solid color-mix(in srgb, ${displayColor} 33%, transparent)`,
        boxShadow: `0 0 20px color-mix(in srgb, ${displayGlow} 15%, transparent), 0 0 6px color-mix(in srgb, ${displayColor} 19%, transparent)`,
      }}
    >
      <div className="flex items-stretch">
        {/* Label */}
        <div
          className="flex w-35 shrink-0 items-center justify-center border-r border-border p-3"
          style={{
            background: `color-mix(in srgb, ${displayColor} 9%, transparent)`,
          }}
        >
          <span
            data-tier-label
            className="wrap-break-word text-center text-sm font-extrabold leading-snug"
            style={{
              color: displayColor,
              textShadow: `0 0 12px color-mix(in srgb, ${displayGlow} 80%, transparent)`,
            }}
          >
            {displayLabel}
          </span>
        </div>

        {/* Zone de drop */}
        <section
          aria-label={`Zone de dépôt tier ${tier.label}`}
          className="flex min-h-18 flex-1 flex-wrap items-center gap-2 p-3 transition-colors hover:bg-(--primary)/5"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {monsters.length === 0 ? (
            <span className="text-xs text-muted-foreground/40 select-none">
              Glisser un monstre ici…
            </span>
          ) : (
            monsters.map((m, i) => (
              <MonsterChip
                key={m.com2us_id}
                monster={m}
                tierId={tier.id}
                index={i}
                showName={showMonsterNames}
              />
            ))
          )}
        </section>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-l border-border px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={() => moveUp(index)}
            disabled={index === 0}
            title="Monter"
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleToggleEdit}
            title="Modifier"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={() => moveDown(index)}
            disabled={index === total - 1}
            title="Descendre"
          >
            <MoveDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panneau d'édition */}
      {isEditing && <TierEditPanel tier={tier} />}
    </div>
  );
}
