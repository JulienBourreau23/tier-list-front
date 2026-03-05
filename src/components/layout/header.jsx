import { ThemeButton } from "@/components/layout/theme-button";

export default function Header() {
  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <div className="flex-1" />
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        🏆 Tier List
      </h1>
      <div className="flex flex-1 justify-end">
        <ThemeButton />
      </div>
    </header>
  );
}
