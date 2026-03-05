import { toast } from "sonner";

export function showSuccessToast() {
  toast.custom(() => (
    <div className="p-4 rounded-2xl border-success-border bg-success-bg/10 text-success-text">
      ✅ Export réussi !
    </div>
  ));
}

export function showErrorToast() {
  toast.custom(() => (
    <div className="p-4 rounded-2xl border border-destructive bg-destructive/10 text-destructive">
      ❌ Export échoué!
    </div>
  ));
}
