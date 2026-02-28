"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PALETTE, TABS } from "@/lib/tier-list/constants";
import { getNextId, makeTiers } from "@/lib/tier-list/utils";

const TierListContext = createContext(null);
const STORAGE_KEY = "tierlist-state-v1";

function initTiersByTab() {
  return Object.fromEntries(TABS.map((t) => [t.id, makeTiers()]));
}

// Charge depuis localStorage si disponible
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Sauvegarde dans localStorage
function saveToStorage(tiersByTab, placedMonsters) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tiersByTab, placedMonsters }),
    );
  } catch {
    // localStorage plein ou désactivé — on ignore
  }
}

export function TierListProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [tiersByTab, setTiersByTab] = useState(initTiersByTab);
  const [placedMonsters, setPlacedMonsters] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState(PALETTE[0]);
  const [hydrated, setHydrated] = useState(false);

  // Chargement initial depuis localStorage (après hydration côté client)
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.tiersByTab) setTiersByTab(saved.tiersByTab);
    if (saved?.placedMonsters) setPlacedMonsters(saved.placedMonsters);
    setHydrated(true);
  }, []);

  // Sauvegarde automatique à chaque changement (après hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(tiersByTab, placedMonsters);
  }, [tiersByTab, placedMonsters, hydrated]);

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

  const placeMonster = (monsterObj, tierId) => {
    const id = String(monsterObj.com2us_id);
    setPlacedMonsters((prev) => {
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

  // Reset complet — remet tout à zéro et efface localStorage
  // biome-ignore lint/correctness/useExhaustiveDependencies: closeEdit est stable
  const resetAll = useCallback(() => {
    setTiersByTab(initTiersByTab());
    setPlacedMonsters({});
    closeEdit();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const placedIds = new Set(
    Object.values(placedMonsters)
      .flat()
      .map((m) => String(m.com2us_id)),
  );

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
        resetAll,
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
