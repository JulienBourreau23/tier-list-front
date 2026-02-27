"use client";

import { useTierList } from "@/components/providers/TierListProvider";
import { TABS } from "@/lib/tier-list/constants";

export default function TierTabs() {
  const { activeTab, setActiveTab, closeEdit } = useTierList();

  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-1.5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
          }`}
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
