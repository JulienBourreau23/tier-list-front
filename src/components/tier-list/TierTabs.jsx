"use client";

import { TABS } from "@/lib/tier-list/constants";
import { useTierListStore } from "@/lib/tier-list/store";
import { cn } from "@/lib/utils";

/**
 * Affiche les onglets de navigation entre les catégories de monstres
 * et gère le changement d'onglet actif.
 * @returns {React.JSX.Element} La barre d'onglets de la tier list
 * @constructor
 */
export default function TierTabs() {
  const activeTab = useTierListStore((state) => state.activeTab);
  const setActiveTab = useTierListStore((state) => state.setActiveTab);
  const closeEdit = useTierListStore((state) => state.closeEdit);
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-muted p-1.5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200",
            { "bg-card text-foreground shadow-sm": activeTab === tab.id },
            {
              "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground":
                activeTab !== tab.id,
            },
          )}
          onClick={() => {
            setActiveTab(tab.id);
            closeEdit();
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
