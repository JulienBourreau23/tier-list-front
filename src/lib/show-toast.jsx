import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function showSuccessToast() {
  toast.custom(() => (
    <div
      className="p-4 rounded-2xl border flex gap-2 text-sm font-bold"
      style={{
        borderColor: "var(--success-border)",
        background: "color-mix(in srgb, var(--success-bg) 10%, transparent)",
        color: "var(--success-text)",
      }}
    >
      <Check />
      Export réussi !
    </div>
  ));
}

export function showErrorToast() {
  toast.custom(() => (
    <div
      className="p-4 rounded-2xl border flex gap-2 text-sm font-bold"
      style={{
        borderColor: "var(--destructive)",
        background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
        color: "var(--destructive)",
      }}
    >
      <X />
      Export échoué !
    </div>
  ));
}
