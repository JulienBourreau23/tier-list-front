/**
 * REFACTO COMPLÈTE : TIERS GLOBAUX
 *
 * Fichier : src/lib/tier-list/store.js
 *
 * Changements :
 * - placedMonstersByTab → placedMonsters (global)
 * - Migration v3 → v4
 * - Suppression de toute logique "par onglet" pour les monstres
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PALETTE, TABS } from "@/lib/tier-list/constants";
import { getNextId, makeTiers } from "@/lib/tier-list/utils";

/**
 * @typedef {Object} Tier
 * @property {number} id      - Identifiant unique du tier
 * @property {string} label   - Nom affiché du tier (ex: "S", "A", "God Tier"...)
 * @property {string} color   - Couleur principale en hex (ex: "#ef4444")
 * @property {string} glow    - Couleur du halo lumineux en hex (ex: "#ff6b6b")
 */

/**
 * @typedef {Object} Monster
 * @property {number} com2us_id     - Identifiant unique Com2uS du monstre
 * @property {string} nom_en        - Nom anglais du monstre
 * @property {string} element       - Élément du monstre (ex: "Fire", "Water"...)
 * @property {string} archetype     - Archétype du monstre (ex: "Attack", "Support"...)
 * @property {number} natural_stars - Nombre d'étoiles naturelles (4 ou 5)
 * @property {number} base_stars    - Nombre d'étoiles de base
 */

/**
 * @typedef {Object} PaletteEntry
 * @property {string} name  - Nom lisible de la couleur (ex: "Rouge")
 * @property {string} color - Valeur hex de la couleur (ex: "#ef4444")
 * @property {string} glow  - Valeur hex du halo (ex: "#ff6b6b")
 */

/**
 * @typedef {Object} TierListState
 * @property {string}                 activeTab        - Id de l'onglet actif (ex: "nat4-fwe")
 * @property {Tier[]}                 tiers            - Liste globale des tiers (partagée)
 * @property {Record<number, number[]>} placedMonsters - Monstres par tier: { tierId: [monsterIds] }
 * @property {number|null}            editingId        - Id du tier en cours d'édition
 * @property {string}                 editLabel        - Label temporaire
 * @property {PaletteEntry}           editColor        - Couleur temporaire
 * @property {boolean}                showMonsterNames - Afficher les noms
 */

/**
 * Migre l'ancien format vers le nouveau.
 * @param {any} persistedState - État chargé depuis localStorage
 * @returns {any} État migré
 */
function migrateStorage(persistedState) {
  if (!persistedState) return persistedState;

  const migrated = { ...persistedState };

  // Migration 1: tiersByTab → tiers global
  if (migrated.tiersByTab && !migrated.tiers) {
    const firstTab = TABS[0].id;
    migrated.tiers = migrated.tiersByTab[firstTab] || makeTiers();
    delete migrated.tiersByTab;
  }

  // Migration 2: placedMonstersByTab → placedMonsters global
  if (migrated.placedMonstersByTab && !migrated.placedMonsters) {
    // Fusionne TOUS les onglets en un seul objet
    const merged = {};

    for (const tabMonsters of Object.values(migrated.placedMonstersByTab)) {
      for (const [tierId, monsterIds] of Object.entries(tabMonsters)) {
        const tid = Number(tierId);
        if (!merged[tid]) merged[tid] = [];

        // Ajoute les IDs sans doublons
        for (const id of monsterIds) {
          if (!merged[tid].includes(id)) {
            merged[tid].push(id);
          }
        }
      }
    }

    migrated.placedMonsters = merged;
    delete migrated.placedMonstersByTab;
  }

  return migrated;
}

/**
 * Store Zustand global de la tier list.
 *
 * Architecture simplifiée :
 * - **Tiers globaux** : partagés entre tous les onglets
 * - **Monstres globaux** : un monstre placé = visible partout
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<TierListState>>}
 */
export const useTierListStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────

      /** @type {string} Id de l'onglet actif */
      activeTab: TABS[0].id,

      /** @type {Tier[]} Tiers globaux partagés entre tous les onglets */
      tiers: makeTiers(),

      /** @type {Record<number, number[]>} Monstres globaux par tier */
      placedMonsters: {},

      /** @type {number|null} Id du tier en cours d'édition */
      editingId: null,

      /** @type {string} Label temporaire pendant l'édition */
      editLabel: "",

      /** @type {PaletteEntry} Couleur temporaire pendant l'édition */
      editColor: PALETTE[0],

      /** @type {boolean} Afficher ou masquer les noms des monstres */
      showMonsterNames: true,

      // ── Actions tabs ───────────────────────────────────────────────

      /**
       * Change l'onglet actif.
       * @param {string} tabId - L'id du nouvel onglet actif
       * @returns {void}
       */
      setActiveTab: (tabId) => set({ activeTab: tabId }),

      // ── Actions tiers ──────────────────────────────────────────────

      /**
       * Ajoute un nouveau tier.
       * @returns {void}
       */
      addTier: () => {
        const id = getNextId();
        const p = PALETTE[id % PALETTE.length];
        set((state) => ({
          tiers: [
            ...state.tiers,
            { id, label: "Nouveau", color: p.color, glow: p.glow },
          ],
        }));
      },

      /**
       * Supprime un tier.
       * @param {number} id - L'id du tier à supprimer
       * @returns {void}
       */
      deleteTier: (id) => {
        set((state) => {
          const newTiers = state.tiers.filter((t) => t.id !== id);
          const newPlacedMonsters = { ...state.placedMonsters };
          delete newPlacedMonsters[id];

          return {
            tiers: newTiers,
            placedMonsters: newPlacedMonsters,
            editingId: state.editingId === id ? null : state.editingId,
          };
        });
      },

      /**
       * Remonte un tier d'une position.
       * @param {number} index - Index actuel du tier
       * @returns {void}
       */
      moveUp: (index) => {
        set((state) => {
          const tiers = [...state.tiers];
          if (index === 0) return {};
          [tiers[index - 1], tiers[index]] = [tiers[index], tiers[index - 1]];
          return { tiers };
        });
      },

      /**
       * Descend un tier d'une position.
       * @param {number} index - Index actuel du tier
       * @returns {void}
       */
      moveDown: (index) => {
        set((state) => {
          const tiers = [...state.tiers];
          if (index === tiers.length - 1) return {};
          [tiers[index + 1], tiers[index]] = [tiers[index], tiers[index + 1]];
          return { tiers };
        });
      },

      // ── Actions édition ────────────────────────────────────────────

      /**
       * Ouvre le panneau d'édition.
       * @param {Tier} tier - Le tier à éditer
       * @returns {void}
       */
      openEdit: (tier) =>
        set({
          editingId: tier.id,
          editLabel: tier.label,
          editColor: PALETTE.find((p) => p.color === tier.color) ?? PALETTE[0],
        }),

      /**
       * Ferme le panneau d'édition.
       * @returns {void}
       */
      closeEdit: () => set({ editingId: null }),

      /**
       * Met à jour le label temporaire.
       * @param {string} label
       * @returns {void}
       */
      setEditLabel: (label) => set({ editLabel: label }),

      /**
       * Met à jour la couleur temporaire.
       * @param {PaletteEntry} color
       * @returns {void}
       */
      setEditColor: (color) => set({ editColor: color }),

      /**
       * Sauvegarde les modifications du tier.
       * @returns {void}
       */
      saveEdit: () => {
        const { editingId, editLabel, editColor } = get();
        set((state) => ({
          tiers: state.tiers.map((t) =>
            t.id === editingId
              ? {
                  ...t,
                  label: editLabel,
                  color: editColor.color,
                  glow: editColor.glow,
                }
              : t,
          ),
          editingId: null,
        }));
      },

      // ── Actions monstres ───────────────────────────────────────────

      /**
       * Place un monstre dans un tier.
       * @param {Monster} monsterObj - Le monstre à placer
       * @param {number|string} tierId - L'id du tier cible
       * @param {number|null} index - Position d'insertion
       * @returns {void}
       */
      placeMonster: (monsterObj, tierId, index = null) => {
        const id = monsterObj.com2us_id;
        const tid = Number(tierId);

        set((state) => {
          // Retire le monstre de tous les tiers
          const cleaned = {};
          for (const [t, ids] of Object.entries(state.placedMonsters)) {
            cleaned[t] = ids.filter((mId) => mId !== id);
          }

          // Ajoute à la position demandée
          const list = [...(cleaned[tid] ?? [])];
          list.splice(index ?? list.length, 0, id);

          return {
            placedMonsters: {
              ...cleaned,
              [tid]: list,
            },
          };
        });
      },

      /**
       * Réordonne un monstre dans un tier.
       * @param {number|string} com2us_id
       * @param {number|string} tierId
       * @param {number} toIndex
       * @returns {void}
       */
      reorderMonster: (com2us_id, tierId, toIndex) => {
        const id = Number(com2us_id);
        const tid = Number(tierId);

        set((state) => {
          const list = [...(state.placedMonsters[tid] ?? [])];
          const fromIndex = list.indexOf(id);

          if (fromIndex === -1 || fromIndex === toIndex) return {};

          const [item] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, item);

          return {
            placedMonsters: {
              ...state.placedMonsters,
              [tid]: list,
            },
          };
        });
      },

      /**
       * Retire un monstre de tous les tiers.
       * @param {number|string} com2us_id
       * @returns {void}
       */
      removeMonster: (com2us_id) => {
        const id = Number(com2us_id);

        set((state) => {
          const cleaned = {};
          for (const [tid, ids] of Object.entries(state.placedMonsters)) {
            cleaned[tid] = ids.filter((mId) => mId !== id);
          }
          return { placedMonsters: cleaned };
        });
      },

      // ── Actions UI ─────────────────────────────────────────────────

      /**
       * Bascule l'affichage des noms des monstres.
       * @returns {void}
       */
      toggleMonsterNames: () =>
        set((state) => ({ showMonsterNames: !state.showMonsterNames })),

      // ── Reset ──────────────────────────────────────────────────────

      /**
       * Remet tout à zéro.
       * @returns {void}
       */
      resetAll: () =>
        set({
          tiers: makeTiers(),
          placedMonsters: {},
          editingId: null,
          showMonsterNames: true,
        }),
    }),
    {
      name: "tier-list-storage-v4", // ✅ Nouvelle version
      version: 4,
      migrate: migrateStorage,
    },
  ),
);
