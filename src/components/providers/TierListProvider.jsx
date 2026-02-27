"use client";

import { createContext, useContext, useState } from "react";
import { PALETTE, TABS } from "@/lib/tier-list/constants";
import { getNextId, makeTiers } from "@/lib/tier-list/utils";

const TierListContext = createContext(null);

function initTiersByTab() {
  return Object.fromEntries(TABS.map((t) => [t.id, makeTiers()]));
}

export function TierListProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [tiersByTab, setTiersByTab] = useState(initTiersByTab);

  // Stocke les objets monstres complets : { tierId: [monsterObj, ...] }
  const [placedMonsters, setPlacedMonsters] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState(PALETTE[0]);

  const tiers = tiersByTab[activeTab] ?? [];

  const setTiers = (updater) =>
    setTiersByTab((prev) => ({
      ...prev,
      [activeTab]:
        typeof updater === "function" ? updater(prev[activeTab]) : updater,
    }));

  const openEdit = (tier) => {
    setEditingId(tier.id);
    setEditLabel(tier.label);
    setEditColor(PALETTE.find((p) => p.color === tier.color) || PALETTE[0]);
  };

  const closeEdit = () => setEditingId(null);

  const saveEdit = () => {
    setTiers((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              label: editLabel,
              color: editColor.color,
              glow: editColor.glow,
            }
          : t,
      ),
    );
    closeEdit();
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setTiers((prev) => {
      const n = [...prev];
      [n[index - 1], n[index]] = [n[index], n[index - 1]];
      return n;
    });
  };

  const moveDown = (index) => {
    if (index === tiers.length - 1) return;
    setTiers((prev) => {
      const n = [...prev];
      [n[index + 1], n[index]] = [n[index], n[index + 1]];
      return n;
    });
  };

  const addTier = () => {
    const id = getNextId();
    const p = PALETTE[id % PALETTE.length];
    setTiers((prev) => [
      ...prev,
      { id, label: "Nouveau", color: p.color, glow: p.glow },
    ]);
  };

  const deleteTier = (id) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) closeEdit();
  };

  // Reçoit l'objet monstre complet au moment du drop
  const placeMonster = (monsterObj, tierId) => {
    const id = String(monsterObj.com2us_id);
    setPlacedMonsters((prev) => {
      // Retire de tous les tiers si déjà placé
      const cleaned = Object.fromEntries(
        Object.entries(prev).map(([tid, list]) => [
          tid,
          list.filter((m) => String(m.com2us_id) !== id),
        ]),
      );
      return {
        ...cleaned,
        [tierId]: [...(cleaned[tierId] ?? []), monsterObj],
      };
    });
  };

  const removeMonster = (monsterId) => {
    setPlacedMonsters((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([tid, list]) => [
          tid,
          list.filter((m) => String(m.com2us_id) !== String(monsterId)),
        ]),
      ),
    );
  };

  // Set des IDs déjà placés (pour filtrer le pool)
  const placedIds = new Set(
    Object.values(placedMonsters)
      .flat()
      .map((m) => String(m.com2us_id)),
  );

  // Objets monstres dans un tier donné
  const getMonstersForTier = (tierId) => placedMonsters[tierId] ?? [];

  return (
    <TierListContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tiers,
        addTier,
        deleteTier,
        moveUp,
        moveDown,
        editingId,
        editLabel,
        editColor,
        openEdit,
        closeEdit,
        saveEdit,
        setEditLabel,
        setEditColor,
        placedIds,
        placeMonster,
        removeMonster,
        getMonstersForTier,
      }}
    >
      {children}
    </TierListContext.Provider>
  );
}

export function useTierList() {
  const ctx = useContext(TierListContext);
  if (!ctx)
    throw new Error("useTierList doit être utilisé dans <TierListProvider>");
  return ctx;
}
