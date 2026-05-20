"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [telegramLink, setTelegramLink] = useState("");
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("telegram_settings")
          .select("chat_id")
          .eq("user_id", user.id)
          .single();

        if (data) setChatId(data.chat_id);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const linkTelegram = async () => {
    // In a real app, this would generate a unique token
    // For MVP, we just take the chat_id from the user (manual input or bot command)
    if (!chatId) return;

    const { error } = await supabase.from("telegram_settings").upsert({
      user_id: user.id,
      chat_id: chatId,
      is_enabled: true
    });

    if (error) alert(error.message);
    else alert("Telegram успешно привязан!");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">Профиль</h1>
          <div className="p-4 border rounded-xl bg-card">
            <p className="font-medium">{user?.email}</p>
          </div>
        </section>

        <section className="space-y-4 border-t pt-10">
          <h2 className="text-xl font-bold">Уведомления в Telegram</h2>
          <p className="text-sm text-muted-foreground">
            Привяжите Telegram, чтобы получать уведомления о новых записях и переносах.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
              <p className="mb-2">1. Перейдите в нашего бота: <strong>@MySportsMvpBot</strong></p>
              <p>2. Напишите команду /start и скопируйте ваш Chat ID</p>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Ваш Chat ID"
                className="flex-1 p-2 border rounded bg-background"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
              <button
                onClick={linkTelegram}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold"
              >
                Привязать
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
