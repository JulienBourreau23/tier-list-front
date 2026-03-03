import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TABS } from "@/lib/tier-list/constants";

/**
 * Fonction qui permet de classer les monstres dans les bons onglets
 * @param {string} tabId - L'identifiant de l'onglet actif
 * @returns {UseQueryResult} Les données, état de chargement et erreurs
 */
export function useMonsters(tabId) {
  const tab = TABS.find((t) => t.id === tabId);

  return useQuery({
    queryKey: ["monsters", tabId],
    queryFn: () => api.get(tab.apiUrl).json(),
    staleTime: 5 * 60 * 1000,
    enabled: !!tab?.apiUrl,
  });
}
