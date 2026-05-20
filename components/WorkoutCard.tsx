import Link from "next/link";

interface WorkoutCardProps {
  id: string;
  title: string;
  trainerName: string;
  description: string;
  price: number;
}

export function WorkoutCard({ id, title, trainerName, description, price }: WorkoutCardProps) {
  return (
    <div className="border rounded-xl p-5 space-y-4 bg-card hover:shadow-lg transition-all border-border/50">
      <div className="space-y-1">
        <h3 className="text-lg font-bold leading-none">{title}</h3>
        <p className="text-sm text-muted-foreground">Тренер: {trainerName}</p>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      <div className="flex justify-between items-center pt-2">
        <span className="font-bold text-lg">{price} ₽</span>
        <Link
          href={`/workouts/${id}`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
