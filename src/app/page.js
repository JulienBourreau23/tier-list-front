import { TierListProvider } from "@/components/providers/TierListProvider";
import TierList from "@/components/tier-list/TierList";

export default function Home() {
  return (
    <TierListProvider>
      <TierList />
    </TierListProvider>
  );
}
