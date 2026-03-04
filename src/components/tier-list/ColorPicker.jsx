"use client";

import { PALETTE } from "@/lib/tier-list/constants";
import { useTierListStore } from "@/lib/tier-list/store";

/**
 * Affiche une palette de couleurs et permet à l'utilisateur
 * de choisir la couleur du tier en cours d'édition.
 * @returns {React.JSX.Element} La palette de couleurs interactive
 * @constructor
 */
export default function ColorPicker() {
  const editColor = useTierListStore((state) => state.editColor);
  const setEditColor = useTierListStore((state) => state.setEditColor);

  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Couleur —{" "}
        <span
          style={{
            color: editColor.color,
            textShadow: `0 0 8px ${editColor.glow}`,
          }}
        >
          {editColor.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((p) => (
          <button
            key={p.color}
            type="button"
            className={`h-6 w-6 shrink-0 rounded-full border-2 transition-transform duration-150 hover:scale-125 ${
              editColor.color === p.color
                ? "scale-110 border-foreground"
                : "border-transparent"
            }`}
            style={{
              background: p.color,
              boxShadow: `0 0 6px ${p.glow}66`,
              "--dot-glow": p.glow,
            }}
            onClick={() => setEditColor(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditColor(p);
            }}
            title={p.name}
            aria-label={`Couleur ${p.name}`}
            aria-pressed={editColor.color === p.color}
          />
        ))}
      </div>
    </div>
  );
}
