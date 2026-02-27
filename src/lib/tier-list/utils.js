import { DEFAULT_TIERS } from "./constants";

export function makeTiers() {
  return DEFAULT_TIERS.map((t) => ({ ...t }));
}

let _nextId = DEFAULT_TIERS.length + 1;
export function getNextId() {
  return _nextId++;
}
