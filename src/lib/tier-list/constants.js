export const PALETTE = [
  { name: "Rouge", color: "#ef4444", glow: "#ff6b6b" },
  { name: "Rose", color: "#ec4899", glow: "#ff80c0" },
  { name: "Orange", color: "#f97316", glow: "#ffaa5e" },
  { name: "Ambre", color: "#f59e0b", glow: "#ffd060" },
  { name: "Jaune", color: "#eab308", glow: "#ffe066" },
  { name: "Citron", color: "#84cc16", glow: "#b8f04a" },
  { name: "Vert", color: "#22c55e", glow: "#6fffaa" },
  { name: "Emeraude", color: "#10b981", glow: "#5fffc0" },
  { name: "Cyan", color: "#06b6d4", glow: "#5fefff" },
  { name: "Bleu ciel", color: "#38bdf8", glow: "#90deff" },
  { name: "Bleu", color: "#3b82f6", glow: "#7db8ff" },
  { name: "Indigo", color: "#6366f1", glow: "#a0a4ff" },
  { name: "Violet", color: "#a855f7", glow: "#d09cff" },
  { name: "Pourpre", color: "#d946ef", glow: "#f0a0ff" },
  { name: "Blanc", color: "#e2e8f0", glow: "#ffffff" },
];

// Les URLs pointent vers le proxy Next.js — la clé API n'est jamais exposée au navigateur
export const TABS = [
  {
    id: "nat4-fwe",
    label: "4★ Feu / Vent / Eau",
    icon: "🔥💨💧",
    apiUrl: "monsters?stars=4&elements=Fire,Water,Wind&limit=500",
  },
  {
    id: "nat4-dl",
    label: "4★ Ténèbre / Lumière",
    icon: "🌑✨",
    apiUrl: "monsters?stars=4&elements=Light,Dark&limit=500",
  },
  {
    id: "nat5-fwe",
    label: "5★ Feu / Vent / Eau",
    icon: "🔥💨💧",
    apiUrl: "monsters?stars=5&elements=Fire,Water,Wind&limit=500",
  },
  {
    id: "nat5-dl",
    label: "5★ Ténèbre / Lumière",
    icon: "🌑✨",
    apiUrl: "monsters?stars=5&elements=Light,Dark&limit=500",
  },
  {
    id: "2a",
    label: "2 Awakenning",
    icon: "🔥💨💧🌑✨",
    apiUrl: "monsters?awaken_level=2",
  },
];

export const DEFAULT_TIERS = [
  { id: 1, label: "S", color: "#ef4444", glow: "#ff6b6b" },
  { id: 2, label: "A", color: "#f97316", glow: "#ffaa5e" },
  { id: 3, label: "B", color: "#eab308", glow: "#ffe066" },
  { id: 4, label: "C", color: "#22c55e", glow: "#6fffaa" },
  { id: 5, label: "D", color: "#3b82f6", glow: "#7db8ff" },
  { id: 6, label: "E", color: "#a855f7", glow: "#d09cff" },
];
