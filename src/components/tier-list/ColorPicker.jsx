"use client";

import { useTierList } from "@/components/providers/TierListProvider";
import { PALETTE } from "@/lib/tier-list/constants";

export default function ColorPicker() {
  const { editColor, setEditColor } = useTierList();

  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
        Couleur —{" "}
        <span
          style={{
            color: editColor.color,
            textShadow: `0 0 8px ${editColor.glow}`,
          }}
        >
          {editColor.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((p) => (
          <button
            key={p.color}
            type="button"
            className={`h-6 w-6 flex-shrink-0 rounded-full border-2 transition-transform duration-150 hover:scale-125 ${
              editColor.color === p.color
                ? "scale-110 border-[var(--foreground)]"
                : "border-transparent"
            }`}
            style={{
              background: p.color,
              boxShadow: `0 0 6px ${p.glow}66`,
              "--dot-glow": p.glow,
            }}
            onClick={() => setEditColor(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditColor(p);
            }}
            title={p.name}
            aria-label={`Couleur ${p.name}`}
            aria-pressed={editColor.color === p.color}
          />
        ))}
      </div>
    </div>
  );
}
