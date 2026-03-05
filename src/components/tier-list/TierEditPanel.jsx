"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTierListStore } from "@/lib/tier-list/store";
import ColorPicker from "./ColorPicker";

/**
 * Détermine si une couleur hex est claire ou sombre.
 * Retourne true si la couleur est claire (texte noir recommandé).
 * @param {string} hex - Couleur en format hex (ex: "#ef4444")
 * @returns {boolean}
 */
function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Formule de luminosité perçue
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
/**
 * Panneau d'édition d'un tier (label + couleur + actions).
 * Permet de modifier le titre, la couleur, de sauvegarder ou de supprimer le tier.
 * Doit être utilisé dans `TierCard.jsx`.
 * @param {Object} props
 * @param {import('@/lib/tier-list/store').Tier} props.tier - Le tier en cours d'édition
 * @returns {React.JSX.Element} Le panneau d'édition du tier
 */
export default function TierEditPanel({ tier }) {
  const editLabel = useTierListStore((state) => state.editLabel);
  const editColor = useTierListStore((state) => state.editColor);
  const setEditLabel = useTierListStore((state) => state.setEditLabel);
  const saveEdit = useTierListStore((state) => state.saveEdit);
  const closeEdit = useTierListStore((state) => state.closeEdit);
  const deleteTier = useTierListStore((state) => state.deleteTier);

  return (
    <Card className="flex flex-col gap-4 border-t border-border bg-secondary p-4 rounded-none rounded-b-2xl shadow-none">
      {/* Titre */}
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Titre du tier
      </div>
      <Input
        value={editLabel}
        onChange={(e) => setEditLabel(e.target.value)}
        maxLength={30}
        placeholder="Ex: God Tier, À éviter absolument..."
        className="font-semibold  bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
      />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTier(tier.id)}
          className="mr-auto border border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-white"
        >
          🗑 Supprimer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={closeEdit}
          className="border border-border/80 text-foreground hover:border-primary hover:text-white hover:bg-primary/10"
        >
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={saveEdit}
          className="font-extrabold border-0 hover:opacity-85"
          style={{
            background: editColor.color,
            color: isLightColor(editColor.color) ? "#000000" : "#ffffff",
          }}
        >
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}
