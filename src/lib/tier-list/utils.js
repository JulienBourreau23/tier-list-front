import { DEFAULT_TIERS } from "./constants";
/**
 * Crée une copie indépendante des tiers par défaut.
 * @returns {import('./constants').Tier[]} Tableau de tiers avec id, label, color et glow
 */
export function makeTiers() {
  return DEFAULT_TIERS.map((t) => ({ ...t }));
}

/**
 * Fonction appelé lors de la création d'un nouveau tier, elle lui donne un nouvel ID unique
 * @returns {number} L'ID unique du nouveau tier suite à une incrémentation de 1 par rapport à l'ID le plus grand.
 */
let _nextId = DEFAULT_TIERS.length + 1;
export function getNextId() {
  return _nextId++;
}
