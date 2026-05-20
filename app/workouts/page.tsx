"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function WorkoutsCatalog() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (!error) setWorkouts(data || []);
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Доступные тренировки</h1>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">На главную</Link>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {workouts.map((workout) => (
          <div key={workout.id} className="border rounded-xl p-6 space-y-4 hover:border-primary transition-colors">
            <div>
              <h2 className="text-xl font-bold">{workout.title}</h2>
              <p className="text-sm text-muted-foreground">Тренер: {workout.profiles?.full_name || 'Не указан'}</p>
            </div>
            <p className="text-muted-foreground line-clamp-3 text-sm">{workout.description}</p>
            <div className="flex justify-between items-center pt-4">
              <span className="font-bold">{workout.price} ₽</span>
              <Link
                href={`/workouts/${workout.id}`}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
              >
                Выбрать время
              </Link>
            </div>
          </div>
        ))}
        {workouts.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            Пока нет активных тренировок.
          </div>
        )}
      </div>
    </div>
  );
}
