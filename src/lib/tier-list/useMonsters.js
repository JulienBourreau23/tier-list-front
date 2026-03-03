import { useQuery } from "@tanstack/react-query";
import { TABS } from "@/lib/tier-list/constants";

/**
 * Fonction qui permet de requeter l'API et récuperer les informations des monstres
 * @param {string} url - Récupère l'url de l'API
 * @returns {Promise<any>}  réponse de l'API qui ets un Json
 */
async function fetchMonsters(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}

/**
 * Fonction qui permet de classer les monstres dans les bons onglets
 * @param {string} tabId - L'identifiant de l'onglet actif
 * @returns {UseQueryResult} Les données, état de chargement et erreurs
 */
export function useMonsters(tabId) {
  const tab = TABS.find((t) => t.id === tabId);

  return useQuery({
    queryKey: ["monsters", tabId],
    queryFn: () => fetchMonsters(tab.apiUrl),
    staleTime: 5 * 60 * 1000,
    enabled: !!tab?.apiUrl,
  });
}
