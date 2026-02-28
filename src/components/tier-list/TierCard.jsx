"use client";

import Image from "next/image";
import { useTierList } from "@/components/providers/TierListProvider";
import TierEditPanel from "./TierEditPanel";

function getIconUrl(com2us_id) {
  return `/api/icons/${com2us_id}.png`;
}

// Reçoit l'objet monstre complet — pas besoin de chercher dans le cache
function MonsterChip({ monster, tierId }) {
  const { removeMonster } = useTierList();

  const handleDragStart = (e) => {
    e.dataTransfer.setData("monsterJson", JSON.stringify(monster));
    e.dataTransfer.setData("fromTierId", tierId);
  };

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
      className="flex w-[60px] flex-shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--accent)] px-1.5 py-1.5 font-[inherit] transition-transform duration-150 hover:scale-110 select-none"
    >
      <Image
        src={getIconUrl(monster.com2us_id)}
        alt={monster.nom_en}
        width={40}
        height={40}
        className="rounded-lg"
        unoptimized
      />
      <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[9px] font-bold text-[var(--muted-foreground)]">
        {monster.nom_en}
      </span>
    </button>
  );
}

export default function TierCard({ tier, index, total }) {
  const {
    editingId,
    openEdit,
    closeEdit,
    moveUp,
    moveDown,
    placeMonster,
    getMonstersForTier,
  } = useTierList();

  const isEditing = editingId === tier.id;
  const monsters = getMonstersForTier(tier.id);

  const handleDragOver = (e) => e.preventDefault();

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

  const handleToggleEdit = () => {
    if (isEditing) closeEdit();
    else openEdit(tier);
  };

  return (
    <div
      className="w-full overflow-hidden rounded-2xl bg-[var(--card)] transition-transform duration-150 hover:-translate-y-px"
      style={{
        border: `1px solid ${tier.color}55`,
        boxShadow: `0 0 20px ${tier.glow}25, 0 0 6px ${tier.color}30`,
      }}
    >
      <div className="flex items-stretch">
        {/* Label */}
        <div
          className="flex w-20 flex-shrink-0 items-center justify-center border-r border-[var(--border)] p-3"
          style={{ background: `${tier.color}18` }}
        >
          <span
            className="break-words text-center text-sm font-extrabold leading-snug"
            style={{ color: tier.color, textShadow: `0 0 12px ${tier.glow}cc` }}
          >
            {tier.label}
          </span>
        </div>

        {/* Zone de drop */}
        <section
          aria-label={`Zone de dépôt tier ${tier.label}`}
          className="flex min-h-[72px] flex-1 flex-wrap items-center gap-2 p-3 transition-colors hover:bg-[var(--primary)]/5"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {monsters.length === 0 ? (
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] opacity-40">
              Déposer ici
            </span>
          ) : (
            monsters.map((m) => (
              <MonsterChip key={m.com2us_id} monster={m} tierId={tier.id} />
            ))
          )}
        </section>

        {/* Contrôles */}
        <div className="flex flex-shrink-0 flex-col items-center justify-center gap-0.5 border-l border-[var(--border)] p-2">
          <button
            type="button"
            className="rounded px-1.5 py-1 text-sm text-[var(--muted-foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-20"
            onClick={() => moveUp(index)}
            disabled={index === 0}
            title="Monter"
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-sm transition hover:bg-[var(--accent)]"
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
            className="rounded px-1.5 py-1 text-sm text-[var(--muted-foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-20"
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
