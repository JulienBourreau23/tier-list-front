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
 * @property {string}                          activeTab      - Id de l'onglet actif (ex: "nat4-fwe")
 * @property {Record<string, Tier[]>}          tiersByTab     - Tiers indexés par id d'onglet
 * @property {Record<string|number, Monster[]>} placedMonsters - Monstres placés, indexés par tierId
 * @property {number|null}                     editingId      - Id du tier en cours d'édition, null si aucun
 * @property {string}                          editLabel      - Label temporaire du tier en cours d'édition
 * @property {PaletteEntry}                    editColor      - Couleur temporaire du tier en cours d'édition
 */

/**
 * Initialise un objet avec les tiers par défaut pour chaque onglet.
 * @returns {Record<string, Tier[]>} Un objet { tabId: [...tiers] } pour tous les onglets
 */
function initTiersByTab() {
  return Object.fromEntries(TABS.map((t) => [t.id, makeTiers()]));
}

/**
 * Store Zustand global de la tier list.
 *
 * Gère l'intégralité de l'état de l'application :
 * - Les onglets et tiers (création, suppression, réorganisation)
 * - Les monstres placés dans les tiers (drag & drop)
 * - L'édition d'un tier (label, couleur)
 * - La persistance automatique dans localStorage via le middleware `persist`
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<TierListState>>}
 *
 * @example
 * // Dans un composant React
 * const activeTab = useTierListStore((state) => state.activeTab);
 * const addTier = useTierListStore((state) => state.addTier);
 */
export const useTierListStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────

      /** @type {string} Id de l'onglet actif */
      activeTab: TABS[0].id,

      /** @type {Record<string, Tier[]>} Tiers par onglet */
      tiersByTab: initTiersByTab(),

      /** @type {Record<string|number, Monster[]>} Monstres placés par tierId */
      placedMonsters: {},

      /** @type {number|null} Id du tier en cours d'édition */
      editingId: null,

      /** @type {string} Label temporaire pendant l'édition */
      editLabel: "",

      /** @type {PaletteEntry} Couleur temporaire pendant l'édition */
      editColor: PALETTE[0],

      // ── Getter ─────────────────────────────────────────────────────

      /**
       * Retourne les tiers de l'onglet actif.
       * @returns {Tier[]}
       */
      getTiers: () => get().tiersByTab[get().activeTab] ?? [],

      // ── Actions tabs ───────────────────────────────────────────────

      /**
       * Change l'onglet actif.
       * @param {string} tabId - L'id du nouvel onglet actif
       * @returns {void}
       */
      setActiveTab: (tabId) => set({ activeTab: tabId }),

      // ── Actions tiers ──────────────────────────────────────────────

      /**
       * Ajoute un nouveau tier en bas de la liste de l'onglet actif.
       * La couleur est choisie automatiquement depuis la palette.
       * @returns {void}
       */
      addTier: () => {
        const id = getNextId();
        const p = PALETTE[id % PALETTE.length];
        set((state) => ({
          tiersByTab: {
            ...state.tiersByTab,
            [state.activeTab]: [
              ...state.tiersByTab[state.activeTab],
              { id, label: "Nouveau", color: p.color, glow: p.glow },
            ],
          },
        }));
      },

      /**
       * Supprime un tier par son id dans l'onglet actif.
       * Ferme aussi le panneau d'édition si ce tier était en cours d'édition.
       * @param {number} id - L'id du tier à supprimer
       * @returns {void}
       */
      deleteTier: (id) => {
        set((state) => ({
          tiersByTab: {
            ...state.tiersByTab,
            [state.activeTab]: state.tiersByTab[state.activeTab].filter(
              (t) => t.id !== id,
            ),
          },
          editingId: state.editingId === id ? null : state.editingId,
        }));
      },

      /**
       * Remonte le tier à l'index donné d'une position dans l'onglet actif.
       * Sans effet si le tier est déjà en première position.
       * @param {number} index - Index actuel du tier à remonter
       * @returns {void}
       */
      moveUp: (index) => {
        set((state) => {
          const tiers = [...state.tiersByTab[state.activeTab]];
          if (index === 0) return {};
          [tiers[index - 1], tiers[index]] = [tiers[index], tiers[index - 1]];
          return {
            tiersByTab: { ...state.tiersByTab, [state.activeTab]: tiers },
          };
        });
      },

      /**
       * Descend le tier à l'index donné d'une position dans l'onglet actif.
       * Sans effet si le tier est déjà en dernière position.
       * @param {number} index - Index actuel du tier à descendre
       * @returns {void}
       */
      moveDown: (index) => {
        set((state) => {
          const tiers = [...state.tiersByTab[state.activeTab]];
          if (index === tiers.length - 1) return {};
          [tiers[index + 1], tiers[index]] = [tiers[index], tiers[index + 1]];
          return {
            tiersByTab: { ...state.tiersByTab, [state.activeTab]: tiers },
          };
        });
      },

      // ── Actions édition ────────────────────────────────────────────

      /**
       * Ouvre le panneau d'édition pour le tier donné.
       * Initialise les valeurs temporaires editLabel et editColor.
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
       * Ferme le panneau d'édition sans sauvegarder.
       * @returns {void}
       */
      closeEdit: () => set({ editingId: null }),

      /**
       * Met à jour le label temporaire pendant l'édition.
       * @param {string} label - Le nouveau label temporaire
       * @returns {void}
       */
      setEditLabel: (label) => set({ editLabel: label }),

      /**
       * Met à jour la couleur temporaire pendant l'édition.
       * @param {PaletteEntry} color - La nouvelle couleur temporaire
       * @returns {void}
       */
      setEditColor: (color) => set({ editColor: color }),

      /**
       * Sauvegarde les modifications du tier en cours d'édition
       * et ferme le panneau.
       * @returns {void}
       */
      saveEdit: () => {
        const { editingId, editLabel, editColor, activeTab } = get();
        set((state) => ({
          tiersByTab: {
            ...state.tiersByTab,
            [activeTab]: state.tiersByTab[activeTab].map((t) =>
              t.id === editingId
                ? {
                    ...t,
                    label: editLabel,
                    color: editColor.color,
                    glow: editColor.glow,
                  }
                : t,
            ),
          },
          editingId: null,
        }));
      },

      // ── Actions monstres ───────────────────────────────────────────

      /**
       * Place un monstre dans un tier.
       * Si le monstre est déjà dans un autre tier, il en est retiré automatiquement
       * — un monstre ne peut être que dans un seul tier à la fois.
       * @param {Monster} monsterObj - Le monstre à placer
       * @param {number|string} tierId - L'id du tier cible
       * @returns {void}
       */
      placeMonster: (monsterObj, tierId) => {
        const id = String(monsterObj.com2us_id);
        set((state) => {
          const cleaned = Object.fromEntries(
            Object.entries(state.placedMonsters).map(([tid, list]) => [
              tid,
              list.filter((m) => String(m.com2us_id) !== id),
            ]),
          );
          return {
            placedMonsters: {
              ...cleaned,
              [tierId]: [...(cleaned[tierId] ?? []), monsterObj],
            },
          };
        });
      },

      /**
       * Retire un monstre de tous les tiers.
       * @param {number|string} monsterId - Le com2us_id du monstre à retirer
       * @returns {void}
       */
      removeMonster: (monsterId) => {
        set((state) => ({
          placedMonsters: Object.fromEntries(
            Object.entries(state.placedMonsters).map(([tid, list]) => [
              tid,
              list.filter((m) => String(m.com2us_id) !== String(monsterId)),
            ]),
          ),
        }));
      },

      /**
       * Remet la tier list à zéro : réinitialise tous les tiers à leur état
       * par défaut et vide tous les monstres placés.
       * La persistance localStorage est également effacée via le middleware persist.
       * @returns {void}
       */
      resetAll: () =>
        set({
          tiersByTab: initTiersByTab(),
          placedMonsters: {},
          editingId: null,
        }),
    }),

    // ── Config persist ─────────────────────────────────────────────
    {
      name: "tierlist-state-v1", // même clé qu'avant → les données sauvegardées sont conservées
    },
  ),
);
