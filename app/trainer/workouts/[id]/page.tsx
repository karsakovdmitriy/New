"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { t } from "@/lib/i18n";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot form state
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState("1");

  useEffect(() => {
    const fetchData = async () => {
      const [workoutRes, slotsRes] = await Promise.all([
        supabase.from("workouts").select("*").eq("id", id).single(),
        supabase.from("slots").select("*").eq("workout_id", id).order("start_time")
      ]);

      if (!workoutRes.error) setWorkout(workoutRes.data);
      if (!slotsRes.error) setSlots(slotsRes.data || []);
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) return;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

    const { data, error } = await supabase.from("slots").insert({
      workout_id: id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      capacity: parseInt(capacity)
    }).select().single();

    if (!error && data) {
      setSlots([...slots, data]);
      setStartTime("");
    } else if (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>{t.common.loading}</div>;
  if (!workout) return <div>Тренировка не найдена</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{workout.title}</h1>
        <p className="text-muted-foreground">{workout.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Существующие слоты</h2>
          <div className="grid gap-2">
            {slots.map((slot) => (
              <div key={slot.id} className="p-4 border rounded flex justify-between items-center bg-card">
                <div>
                  <div className="font-medium">
                    {new Date(slot.start_time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(slot.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{slot.capacity} мест</div>
                </div>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="text-muted-foreground text-sm">Слотов пока нет.</p>
            )}
          </div>
        </div>

        <div className="space-y-4 border p-6 rounded-xl bg-accent/20">
          <h2 className="text-xl font-semibold">Добавить новый слот</h2>
          <form onSubmit={addSlot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Дата и время начала</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded bg-background"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Вместимость (чел.)</label>
              <input
                type="number"
                className="w-full p-2 border rounded bg-background"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded font-bold"
            >
              Создать слот
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
