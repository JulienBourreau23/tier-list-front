"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTierListStore } from "@/lib/tier-list/store";
import ColorPicker from "./ColorPicker";

/**
 * Détermine si une couleur CSS est claire ou sombre via getComputedStyle.
 * Compatible avec les variables CSS (var(--palette-xxx)).
 * @param {string} color - Couleur CSS (hex ou var())
 * @returns {boolean} true si la couleur est claire
 */
function isLightColor(color) {
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  const match = computed.match(/\d+/g);
  if (!match) return false;
  const [r, g, b] = match.map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
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
            textShadow: `0 0 10px color-mix(in srgb, ${editColor.glow} 73%, transparent)`,
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
          <Trash2 /> Supprimer
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
