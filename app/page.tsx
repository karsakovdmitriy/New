import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl mb-4">
        Управляйте тренировками проще
      </h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl mb-8">
        Забудьте про хаос в Telegram и Excel. Простая запись и расписание для тренеров и клиентов.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t.auth.login}
        </Link>
        <Link
          href="/workouts"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t.workouts.available}
        </Link>
      </div>
    </main>
  );
}
