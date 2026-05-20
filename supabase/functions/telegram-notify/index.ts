import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

serve(async (req) => {
  try {
    const { record, type, table } = await req.json()

    // Logic to handle different database triggers
    // Example: New booking created
    if (table === 'bookings' && type === 'INSERT') {
      // In a real implementation, you would fetch the trainer's chat_id from telegram_settings
      // using the trainer_id associated with the slot's workout.
      const message = `Новая запись на тренировку! ID слота: ${record.slot_id}`
      // This is a placeholder for the trainer's chat_id
      const trainerChatId = "TRAINER_CHAT_ID_PLACEHOLDER"
      await sendTelegramMessage(trainerChatId, message)
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
