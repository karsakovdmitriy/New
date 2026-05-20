import Link from "next/link";

export function Header() {
  return (
    <header className="border-b px-6 py-4 flex justify-between items-center bg-background/95 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="font-extrabold text-xl tracking-tighter">SPORTS</Link>
      <nav className="flex items-center gap-6">
        <Link href="/workouts" className="text-sm font-medium hover:text-primary transition-colors">Тренировки</Link>
        <Link href="/login" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Войти</Link>
      </nav>
    </header>
  );
}
