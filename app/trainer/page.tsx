"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TrainerDashboard() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setWorkouts(data || []);
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  if (loading) return <div>Загрузка...</div>;

  const totalBookings = workouts.reduce((acc, w) => acc + (w.bookings_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="text-xs text-muted-foreground uppercase font-bold">Всего записей</div>
          <div className="text-2xl font-bold">{totalBookings}</div>
        </div>
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="text-xs text-muted-foreground uppercase font-bold">Активные тренировки</div>
          <div className="text-2xl font-bold">{workouts.length}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ваши тренировки</h1>
        <Link
          href="/trainer/workouts/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          + Создать
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
          У вас пока нет созданных тренировок.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/trainer/workouts/${workout.id}`}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-lg">{workout.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
              <div className="mt-4 text-sm font-medium">
                {workout.price} ₽
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
