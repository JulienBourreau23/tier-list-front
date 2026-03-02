"use client";

import { useTierList } from "@/components/providers/TierListProvider";
import ColorPicker from "./ColorPicker";

export default function TierEditPanel({ tier }) {
  const {
    editLabel,
    editColor,
    setEditLabel,
    saveEdit,
    closeEdit,
    deleteTier,
  } = useTierList();

  return (
    <div className="flex flex-col gap-4 border-t border-border bg-secondary p-4">
      {/* Titre */}
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Titre du tier
        </div>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-(--ring)/25"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          maxLength={30}
          placeholder="Ex: God Tier, À éviter absolument..."
        />
      </div>

      {/* Couleur */}
      <ColorPicker />

      {/* Aperçu */}
      <div
        className="flex items-center gap-3 rounded-lg bg-background px-4 py-3"
        style={{ border: `1px solid ${editColor.color}44` }}
      >
        <span
          className="max-w-40 wrap-break-word text-sm font-extrabold leading-snug"
          style={{
            color: editColor.color,
            textShadow: `0 0 10px ${editColor.glow}bb`,
          }}
        >
          {editLabel || "?"}
        </span>
        <span className="text-xs opacity-50 text-muted-foreground">Aperçu</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="mr-auto rounded-lg px-4 py-2 text-sm font-bold text-destructive transition hover:bg-(--destructive)/20"
          onClick={() => deleteTier(tier.id)}
        >
          🗑 Supprimer
        </button>
        <button
          type="button"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition hover:opacity-80"
          onClick={closeEdit}
        >
          Annuler
        </button>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-extrabold text-black transition hover:opacity-85"
          style={{ background: editColor.color }}
          onClick={saveEdit}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
