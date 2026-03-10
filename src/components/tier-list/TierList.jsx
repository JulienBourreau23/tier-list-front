"use client";

import { Camera, Hourglass, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/show-toast";
import { TABS } from "@/lib/tier-list/constants";
import { useTierListStore } from "@/lib/tier-list/store";
import MonsterPool from "./MonsterPool";
import TierCard from "./TierCard";
import TierTabs from "./TierTabs";

/** Zone de déclenchement de l'auto-scroll (px depuis le bord de la fenêtre) */
const SCROLL_ZONE = 120;
/** Vitesse maximale de l'auto-scroll (px/frame) */
const SCROLL_SPEED = 14;

/**
 * Composant principal qui appel aux fonctions des composants enfants pour générer la tierlist
 * @returns {React.JSX.Element}
 * @component
 */
export default function TierList() {
  const tiers = useTierListStore(
    (state) => state.tiersByTab[state.activeTab] ?? [],
  );
  const activeTab = useTierListStore((state) => state.activeTab);
  const addTier = useTierListStore((state) => state.addTier);
  const resetAll = useTierListStore((state) => state.resetAll);
  const tierZoneRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [_exportStatus, setExportStatus] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Auto-scroll pendant le drag ──────────────────────────────────
  useEffect(() => {
    let rafId = null;
    let lastY = 0;

    /**
     * Calcule la vitesse de scroll en fonction de la proximité du bord.
     * @param {number} y - Position Y du curseur
     * @returns {number} Vitesse (positive = vers le bas, négative = vers le haut, 0 = arrêt)
     */
    const getScrollVelocity = (y) => {
      const distTop = y;
      const distBottom = window.innerHeight - y;
      if (distTop < SCROLL_ZONE) {
        return -SCROLL_SPEED * (1 - distTop / SCROLL_ZONE);
      }
      if (distBottom < SCROLL_ZONE) {
        return SCROLL_SPEED * (1 - distBottom / SCROLL_ZONE);
      }
      return 0;
    };

    /**
     * Mémorise la position Y du curseur/
     * @param {DragEvent} e - Au survol
     * @returns {void}
     */
    const onDragOver = (e) => {
      lastY = e.clientY;
    };

    /**
     * Boucle qui permet de scroll automatiquement la fenetre jusqu'au moment ou l'utilisateur lache le monstre
     * la fenêtre tant que l'utilisateur déplace un monstre près des bords.
     * @returns {void}
     */
    const tick = () => {
      const velocity = getScrollVelocity(lastY);
      if (velocity !== 0) {
        window.scrollBy({ top: velocity, behavior: "instant" });
      }
      rafId = requestAnimationFrame(tick);
    };

    /**
     * Déclenche la boucle tick
     * @returns {void}
     */
    const onDragStart = () => {
      rafId = requestAnimationFrame(tick);
    };

    /**
     * Met fin à la boucle tick
     * @returns {void}
     */
    const onDragEnd = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragend", onDragEnd);
    document.addEventListener("drop", onDragEnd);

    return () => {
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragend", onDragEnd);
      document.removeEventListener("drop", onDragEnd);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  /**
   * Génère une image PNG de la tier list et la télécharge automatiquement.
   * Met à jour `exportStatus` à "success" ou "error" selon le résultat,
   * puis remet à null après 3 secondes.
   * @returns {Promise<void>}
   */
  const handleScreenshot = async () => {
    setExporting(true);
    try {
      // Récupère les données depuis le contexte via le DOM
      const tierCards = tierZoneRef.current?.querySelectorAll("[data-tier-id]");
      if (!tierCards?.length) return;

      const LABEL_W = 90;
      const ROW_H = 80;
      const ICON_SIZE = 52;
      const GAP = 8;
      const PADDING = 10;
      const TITLE_H = 48;

      // Collecte les données de chaque tier
      const rows = Array.from(tierCards).map((card) => {
        const labelEl = card.querySelector("[data-tier-label]");
        const label = labelEl?.textContent || "";
        // Résoudre la couleur CSS via getComputedStyle (gère les var(--palette-xxx))
        const color = labelEl ? getComputedStyle(labelEl).color : "#888";
        const icons = Array.from(
          card.querySelectorAll("[data-monster-icon]"),
        ).map((img) => img.src);
        return { label, color, icons };
      });

      // Calcule la largeur max
      const maxIcons = Math.max(...rows.map((r) => r.icons.length), 0);
      const contentW = Math.max(
        800,
        LABEL_W + maxIcons * (ICON_SIZE + GAP) + PADDING * 2,
      );
      const canvasH = TITLE_H + rows.length * (ROW_H + 4) + PADDING * 2;

      const canvas = document.createElement("canvas");
      canvas.width = contentW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#111318";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Titre
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🏆 Tier List", canvas.width / 2, 32);

      /**
       * Permet le chargement d'une image qui est en promesse
       * @param {string} src - lien de l'image
       * @returns {Promise<HTMLImageElement|null>}
       */
      const loadImg = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });

      // Dessine chaque tier
      for (let i = 0; i < rows.length; i++) {
        const { label, color, icons } = rows[i];
        const y = TITLE_H + PADDING + i * (ROW_H + 4);

        // Fond de la ligne
        ctx.fillStyle = "#1e2028";
        ctx.beginPath();
        ctx.roundRect(0, y, contentW, ROW_H, 10);
        ctx.fill();

        // Bordure colorée à gauche
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(0, y, 6, ROW_H, [10, 0, 0, 10]);
        ctx.fill();

        // Label
        ctx.fillStyle = color;
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, LABEL_W / 2, y + ROW_H / 2);

        // Séparateur vertical
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(LABEL_W, y + 8);
        ctx.lineTo(LABEL_W, y + ROW_H - 8);
        ctx.stroke();

        // Icônes des monstres
        const imgs = await Promise.all(icons.map(loadImg));
        for (let j = 0; j < imgs.length; j++) {
          const img = imgs[j];
          if (!img) continue;
          const x = LABEL_W + PADDING + j * (ICON_SIZE + GAP);
          const iy = y + (ROW_H - ICON_SIZE) / 2;

          // Fond rond pour l'icône
          ctx.fillStyle = "#2a2d36";
          ctx.beginPath();
          ctx.roundRect(x, iy, ICON_SIZE, ICON_SIZE, 8);
          ctx.fill();

          // Clip arrondi pour l'image
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, iy, ICON_SIZE, ICON_SIZE, 8);
          ctx.clip();
          ctx.drawImage(img, x, iy, ICON_SIZE, ICON_SIZE);
          ctx.restore();
        }
      }

      // Télécharge
      const link = document.createElement("a");
      link.download = `tierlist-${activeTab}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccessToast();
    } catch (_err) {
      showErrorToast();
    } finally {
      setExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  /**
   * permet le reset de la tierlist et vide le localstorage après double confirmation
   * @returns {void}
   */
  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      // Annule la confirmation après 3s si pas cliqué
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-4 pb-12 text-foreground">
      {/* Titre + actions globales */}
      <div className="mb-6 flex w-full max-w-[90%] justify-end">
        <div className="flex items-center gap-2">
          {/* Screenshot */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleScreenshot}
            disabled={exporting}
            title="Exporter en PNG"
            className="border border-border hover:border-primary hover:text-white hover:bg-primary/10"
          >
            {exporting ? <Hourglass /> : <Camera />}{" "}
            {exporting ? "Export..." : "Exporter PNG"}
          </Button>

          {/* Reset */}
          <Button
            variant={confirmReset ? "destructive" : "outline"}
            size="sm"
            onClick={handleReset}
            title="Remettre à zéro"
            className={
              confirmReset
                ? "border border-destructive bg-destructive/10 text-white hover:bg-destructive/20 hover:text-white"
                : "border border-border hover:border-destructive hover:text-white hover:bg-transparent"
            }
          >
            <Trash2 /> {confirmReset ? "Confirmer ?" : "Reset"}
          </Button>
        </div>
      </div>
      <div className="mb-5 w-full max-w-[90%]">
        <TierTabs />
      </div>

      <div className="mb-4 flex w-full max-w-[90%] items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {TABS.find((t) => t.id === activeTab)?.label}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={addTier}
          className="border border-border hover:border-primary hover:text-white hover:bg-primary/10"
        >
          <Plus /> Ajouter un tier
        </Button>
      </div>
      <div
        ref={tierZoneRef}
        data-capture
        className="flex w-full max-w-[90%] flex-col gap-3 rounded-2xl p-4 bg-background"
      >
        {tiers.map((tier, index) => (
          <TierCard
            key={tier.id}
            tier={tier}
            index={index}
            total={tiers.length}
          />
        ))}
      </div>
      <div className="w-full max-w-[90%]">
        <MonsterPool key={activeTab} />
      </div>
    </div>
  );
}
