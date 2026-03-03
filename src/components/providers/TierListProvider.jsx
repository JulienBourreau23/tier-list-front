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

/**
 * Initialisation des tiers pour chaque onglet
 * @returns {Object} Un objet avec les tiers initiaux pour chaque onglet
 */
function initTiersByTab() {
  return Object.fromEntries(TABS.map((t) => [t.id, makeTiers()]));
}

/**
 *Charge depuis localStorage si disponible
 * @returns {object|null} json des monstres dans chaque tier s'il y en a
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sauvegarde dans localStorage
 * @param {Object} tiersByTab - L'ensemble des tier avec la position des monstres
 * @param {Object} placedMonsters - L'ensemble des monstres placé
 */
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

/**
 * Permet l'affichage de la tier list dans le navigateur
 * @param {React.ReactNode} children - Les composants enfants à envelopper
 * @return {React.JSX.Element}
 * @component
 */
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

  /**
   * Ouvre le panneau d'édition du tier choisi
   * @param {object} tier - les attributs de l'objet tier
   * @returns {void}
   */
  const openEdit = (tier) => {
    setEditingId(tier.id);
    setEditLabel(tier.label);
    setEditColor(PALETTE.find((p) => p.color === tier.color) || PALETTE[0]);
  };

  /**
   * Fermer la fenetre d'edition d'un tier
   * @returns {void}
   */
  const closeEdit = () => setEditingId(null);

  /**
   * Sauvergarde les modifications d'un tier
   * @returns {void}
   */
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

  /**
   * Fait monter d'un cran le tier décrémentation de 1
   * @param {number} index - index du tier concerné
   * @returns {void}
   */
  const moveUp = (index) => {
    if (index === 0) return;
    setTiers((prev) => {
      const n = [...prev];
      [n[index - 1], n[index]] = [n[index], n[index - 1]];
      return n;
    });
  };

  /**
   * Fait descendre d'un cran le tier incrémentation de 1
   * @param {number} index - index du tier concerné
   * @returns {void}
   */
  const moveDown = (index) => {
    if (index === tiers.length - 1) return;
    setTiers((prev) => {
      const n = [...prev];
      [n[index + 1], n[index]] = [n[index], n[index + 1]];
      return n;
    });
  };

  /**
   * Ajout d'un tier en bas des autres
   * @returns {void}
   */
  const addTier = () => {
    const id = getNextId();
    const p = PALETTE[id % PALETTE.length];
    setTiers((prev) => [
      ...prev,
      { id, label: "Nouveau", color: p.color, glow: p.glow },
    ]);
  };

  /**
   * Supprimer le tier choisi
   * @param {number} id - Id du tier choisi
   * @returns {void}
   */
  const deleteTier = (id) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) closeEdit();
  };

  /**
   * Place un monstre dans le tier choisi
   * @param {object} monsterObj - objet monstre, ses informations (id, nom, références images...)
   * @param {number} tierId - Id du tier choisi pour placer le monstre
   */
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

  /**
   * Fonction qui retire un monstre d'un tier
   * @param {number} monsterId - cible l'Id du monstre à retirer
   */
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

  /**
   * Remet la tier list à zéro : vide les tiers, les monstres placés
   *  et éfface le localStorage.
   * @returns {void}
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

  /**
   * Récupère les monstres dans un tier
   * @param {number} tierId - Id du tier
   * @returns {object[]}
   */
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

/**
 * utilise la tierlist
 * @returns {Object} retourne la tier list avec l'ensemble des éléments
 * @throws {Error} Si le hook est utilisé en dehors de <TierListProvider>
 */
export function useTierList() {
  const ctx = useContext(TierListContext);
  if (!ctx)
    throw new Error("useTierList doit être utilisé dans <TierListProvider>");
  return ctx;
}
