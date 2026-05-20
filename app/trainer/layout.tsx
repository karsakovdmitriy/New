import Link from "next/link";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4 flex justify-between items-center">
        <Link href="/trainer" className="font-bold text-lg">Панель Тренера</Link>
        <nav className="flex gap-4">
          <Link href="/trainer/workouts" className="text-sm hover:underline">Мои тренировки</Link>
          <Link href="/profile" className="text-sm hover:underline">Профиль</Link>
        </nav>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
