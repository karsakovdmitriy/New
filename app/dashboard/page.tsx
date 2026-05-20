"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: 'cancelled' })
      .eq("id", bookingId);

    if (error) alert(error.message);
    else {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          slots (
            start_time,
            workouts (
              title
            )
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setBookings(data || []);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
        <h1 className="text-3xl font-bold">Мои записи</h1>

        {loading ? (
          <div>{t.common.loading}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-4">У вас пока нет записей на тренировки.</p>
            <Link href="/workouts" className="text-primary font-bold hover:underline">
              Найти тренировку
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border p-4 rounded-xl flex justify-between items-center bg-card">
                <div>
                  <h3 className="font-bold">{booking.slots?.workouts?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.slots?.start_time).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                    booking.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'active' ? 'Активна' : 'Отменена'}
                  </span>
                  {booking.status === 'active' && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="text-[10px] text-destructive hover:underline font-bold uppercase"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
