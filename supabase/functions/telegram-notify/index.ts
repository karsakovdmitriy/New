import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  try {
    const { record, type, table } = await req.json()

    if (table === 'bookings' && type === 'INSERT') {
      // 1. Get slot and workout info to find the trainer
      const { data: slot, error: slotError } = await supabase
        .from('slots')
        .select(`
          start_time,
          workouts (
            title,
            trainer_id
          )
        `)
        .eq('id', record.slot_id)
        .single()

      if (slotError || !slot) throw new Error('Slot not found')

      // 2. Get trainer's chat_id
      const { data: settings, error: settingsError } = await supabase
        .from('telegram_settings')
        .select('chat_id')
        .eq('user_id', slot.workouts.trainer_id)
        .single()

      if (!settingsError && settings?.chat_id) {
        const date = new Date(slot.start_time).toLocaleString('ru-RU')
        const message = `<b>Новая запись!</b>\n\nТренировка: ${slot.workouts.title}\nВремя: ${date}`
        await sendTelegramMessage(settings.chat_id, message)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})

async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  })
}
