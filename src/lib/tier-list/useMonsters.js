import { useQuery } from "@tanstack/react-query";
import { TABS } from "@/lib/tier-list/constants";

async function fetchMonsters(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}

export function useMonsters(tabId) {
  const tab = TABS.find((t) => t.id === tabId);

  return useQuery({
    queryKey: ["monsters", tabId],
    queryFn: () => fetchMonsters(tab.apiUrl),
    staleTime: 5 * 60 * 1000,
    enabled: !!tab?.apiUrl,
  });
}
