"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function WorkoutBooking() {
  const { id } = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [workoutRes, slotsRes] = await Promise.all([
        supabase.from("workouts").select("*, profiles(full_name)").eq("id", id).single(),
        supabase.from("slots").select("*").eq("workout_id", id).gte('start_time', new Date().toISOString()).order("start_time")
      ]);

      if (!workoutRes.error) setWorkout(workoutRes.data);
      if (!slotsRes.error) setSlots(slotsRes.data || []);
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleBooking = async (slotId: string) => {
    setBookingLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы записаться.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      slot_id: slotId,
      client_id: user.id,
      status: 'active'
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Успешная запись!");
      router.push("/dashboard"); // Where user sees their bookings
    }
    setBookingLoading(false);
  };

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (!workout) return <div className="p-6">Тренировка не найдена</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{workout.title}</h1>
        <p className="text-lg text-muted-foreground">Тренер: {workout.profiles?.full_name}</p>
        <div className="inline-block bg-accent px-3 py-1 rounded-full text-sm font-semibold">
          {workout.price} ₽
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Выберите подходящее время</h2>
        <div className="grid gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="border p-4 rounded-xl flex justify-between items-center bg-card">
              <div className="space-y-1">
                <div className="font-bold">
                  {new Date(slot.start_time).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-muted-foreground">
                  {new Date(slot.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={() => handleBooking(slot.id)}
                disabled={bookingLoading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Записаться
              </button>
            </div>
          ))}
          {slots.length === 0 && (
            <p className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
              На данный момент доступных слотов для записи нет.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
