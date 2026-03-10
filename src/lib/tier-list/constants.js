export const PALETTE = [
  {
    name: "Rouge",
    color: "var(--palette-rouge)",
    glow: "var(--palette-rouge-glow)",
  },
  {
    name: "Rose",
    color: "var(--palette-rose)",
    glow: "var(--palette-rose-glow)",
  },
  {
    name: "Orange",
    color: "var(--palette-orange)",
    glow: "var(--palette-orange-glow)",
  },
  {
    name: "Ambre",
    color: "var(--palette-ambre)",
    glow: "var(--palette-ambre-glow)",
  },
  {
    name: "Jaune",
    color: "var(--palette-jaune)",
    glow: "var(--palette-jaune-glow)",
  },
  {
    name: "Citron",
    color: "var(--palette-citron)",
    glow: "var(--palette-citron-glow)",
  },
  {
    name: "Vert",
    color: "var(--palette-vert)",
    glow: "var(--palette-vert-glow)",
  },
  {
    name: "Emeraude",
    color: "var(--palette-emeraude)",
    glow: "var(--palette-emeraude-glow)",
  },
  {
    name: "Cyan",
    color: "var(--palette-cyan)",
    glow: "var(--palette-cyan-glow)",
  },
  {
    name: "Bleu ciel",
    color: "var(--palette-bleu-ciel)",
    glow: "var(--palette-bleu-ciel-glow)",
  },
  {
    name: "Bleu",
    color: "var(--palette-bleu)",
    glow: "var(--palette-bleu-glow)",
  },
  {
    name: "Indigo",
    color: "var(--palette-indigo)",
    glow: "var(--palette-indigo-glow)",
  },
  {
    name: "Violet",
    color: "var(--palette-violet)",
    glow: "var(--palette-violet-glow)",
  },
  {
    name: "Pourpre",
    color: "var(--palette-pourpre)",
    glow: "var(--palette-pourpre-glow)",
  },
  {
    name: "Blanc",
    color: "var(--palette-blanc)",
    glow: "var(--palette-blanc-glow)",
  },
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
  {
    id: "all",
    label: "Tous les monstres",
    icon: "🔥💨💧🌑✨",
    apiUrl: "monsters?limit=1100",
  },
];

export const DEFAULT_TIERS = [
  {
    id: 1,
    label: "S",
    color: "var(--palette-rouge)",
    glow: "var(--palette-rouge-glow)",
  },
  {
    id: 2,
    label: "A",
    color: "var(--palette-orange)",
    glow: "var(--palette-orange-glow)",
  },
  {
    id: 3,
    label: "B",
    color: "var(--palette-jaune)",
    glow: "var(--palette-jaune-glow)",
  },
  {
    id: 4,
    label: "C",
    color: "var(--palette-vert)",
    glow: "var(--palette-vert-glow)",
  },
  {
    id: 5,
    label: "D",
    color: "var(--palette-bleu)",
    glow: "var(--palette-bleu-glow)",
  },
  {
    id: 6,
    label: "E",
    color: "var(--palette-violet)",
    glow: "var(--palette-violet-glow)",
  },
];
