"use client";

import Image from "next/image";
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
 * Peut être glissée vers un autre tier via drag-and-drop.
 * Un clic retire le monstre de son tier via `removeMonster` du store.
 * @param {Object} props
 * @param {import('@/lib/tier-list/store').Monster} props.monster - Le monstre à afficher
 * @param {number} props.tierId - Id du tier contenant le monstre
 * @returns {React.JSX.Element}
 */
// Reçoit l'objet monstre complet — pas besoin de chercher dans le cache
function MonsterChip({ monster, tierId }) {
  const removeMonster = useTierListStore((state) => state.removeMonster);

  /**
   * Permet le départ du monstre depuis sa position
   * @param {DragEvent} e - Stock les information du monstre lors de l'evenement
   * @returns {void}
   */
  const handleDragStart = (e) => {
    e.dataTransfer.setData("monsterJson", JSON.stringify(monster));
    e.dataTransfer.setData("fromTierId", tierId);
  };

  /**
   * Permet de retirer le monstre de sa position
   * @returns {void}
   */
  const handleRemove = () => removeMonster(monster.com2us_id);

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={handleRemove}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleRemove();
      }}
      title={`${monster.nom_en} — clic pour retirer`}
      className="flex min-w-14 max-w-20 shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-border bg-accent px-1.5 py-1.5 font-[inherit] transition-transform duration-150 hover:scale-110 select-none"
    >
      <Image
        data-monster-icon
        src={getIconUrl(monster.com2us_id)}
        alt={monster.nom_en}
        width={40}
        height={40}
        className="rounded-lg shrink-0"
        unoptimized
      />
      <span className="w-full text-center text-[9px] font-bold text-muted-foreground leading-tight line-clamp-2 wrap-break-word">
        {monster.nom_en}
      </span>
    </button>
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
  const monsters = placedMonsters[tier.id] ?? [];
  const isEditing = editingId === tier.id;

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
    if (json) {
      try {
        const monsterObj = JSON.parse(json);
        placeMonster(monsterObj, tier.id);
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
        border: `1px solid ${tier.color}55`,
        boxShadow: `0 0 20px ${tier.glow}25, 0 0 6px ${tier.color}30`,
      }}
    >
      <div className="flex items-stretch">
        {/* Label */}
        <div
          className="flex w-35 shrink-0 items-center justify-center border-r border-border p-3"
          style={{ background: `${tier.color}18` }}
        >
          <span
            data-tier-label
            className="wrap-break-word text-center text-sm font-extrabold leading-snug"
            style={{ color: tier.color, textShadow: `0 0 12px ${tier.glow}cc` }}
          >
            {tier.label}
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
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
              Déposer ici
            </span>
          ) : (
            monsters.map((m) => (
              <MonsterChip key={m.com2us_id} monster={m} tierId={tier.id} />
            ))
          )}
        </section>

        {/* Contrôles */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-l border-border p-2">
          <button
            type="button"
            className="rounded px-1.5 py-1 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-20"
            onClick={() => moveUp(index)}
            disabled={index === 0}
            title="Monter"
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-sm transition hover:bg-accent"
            onClick={handleToggleEdit}
            title="Paramètres"
            style={{
              color: isEditing ? tier.color : "var(--muted-foreground)",
            }}
          >
            ⚙
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-20"
            onClick={() => moveDown(index)}
            disabled={index === total - 1}
            title="Descendre"
          >
            ↓
          </button>
        </div>
      </div>

      {isEditing && <TierEditPanel tier={tier} />}
    </div>
  );
}
