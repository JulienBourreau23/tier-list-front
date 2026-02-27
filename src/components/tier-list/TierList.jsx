"use client";

import { useTierList } from "@/components/providers/TierListProvider";
import { TABS } from "@/lib/tier-list/constants";
import MonsterPool from "./MonsterPool";
import TierCard from "./TierCard";
import TierTabs from "./TierTabs";

export default function TierList() {
  const { tiers, activeTab, addTier } = useTierList();

  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--background)] px-6 py-8 pb-12 text-[var(--foreground)]">
      {/* Titre */}
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
        🏆 Tier List Summoners War
      </h1>

      {/* Onglets */}
      <div className="mb-5 w-full max-w-[90%]">
        <TierTabs />
      </div>

      {/* Sous-header */}
      <div className="mb-4 flex w-full max-w-[90%] items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          {TABS.find((t) => t.id === activeTab)?.label}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-bold tracking-wide text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] hover:shadow-sm"
          onClick={addTier}
        >
          <span className="text-base leading-none">＋</span>
          Ajouter un tier
        </button>
      </div>

      {/* Tiers */}
      <div className="flex w-full max-w-[90%] flex-col gap-3">
        {tiers.map((tier, index) => (
          <TierCard
            key={tier.id}
            tier={tier}
            index={index}
            total={tiers.length}
          />
        ))}
      </div>

      {/* Pool de monstres */}
      <div className="w-full max-w-[90%]">
        <MonsterPool />
      </div>
    </div>
  );
}
