# MVP Specification: Sports Training Management Platform

## 0. Product Context
A SaaS platform for independent coaches and small sports studios (figure skating, gymnastics, badminton) to manage schedules and bookings, replacing manual coordination via messenges and spreadsheets.

**Core Value:** Eliminating operational chaos, reducing manual communication, and simplifying the booking process for both trainers and clients.

---

## 1. Architecture (Simplicity First)

### 1.1 Overall Architecture
- **Monolith-first (Next.js):** All frontend and API logic in one place.
- **Serverless/BaaS (Supabase):** Offloading Auth, Database, and File Storage.
- **Edge Functions:** For lightweight background tasks (like Telegram notifications).

### 1.2 Frontend Architecture
- **Framework:** Next.js (App Router) for SEO, performance, and developer velocity.
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI) for a clean, accessible, and fast UI.
- **State Management:** React Server Components (RSC) + `useForm` / `react-query` (via Supabase hooks) for client state.
- **Mobile-first:** Responsive design optimized for touch and small screens.

### 1.3 Backend Architecture
- **Next.js Route Handlers:** Minimal API layer for custom logic.
- **Supabase BaaS:** Using PostgREST (direct DB access from client with RLS) for 90% of operations.
- **Business Logic:** Encapsulated in Database Functions (PL/pgSQL) or Edge Functions to ensure data integrity.

### 1.4 Database Structure
- **PostgreSQL (Supabase):** Relational DB is a must for complex scheduling.
- **Tables:** `profiles`, `workouts`, `slots`, `bookings`, `telegram_settings`.

### 1.5 Auth Architecture
- **Supabase Auth:** Email/Password and Magic Links.
- **JWT-based:** Securely passed to the DB for RLS.

### 1.6 API Structure
- **RESTful (PostgREST):** Automatic API via Supabase.
- **Custom Handlers:** `/api/telegram-webhook` for bot interactions.

### 1.7 Notifications Architecture
- **Trigger-based:** Database Webhooks -> Supabase Edge Functions -> Telegram Bot API.
- **No Queue Manager:** Direct calls for MVP to avoid complexity (rely on Edge Function retries).

### 1.8 File Storage
- **Supabase Storage:** For profile pictures or training materials (minimal use in MVP).

### 1.9 Hosting
- **Vercel:** Optimized for Next.js, zero-config deployment.

### 1.10 What NOT to overengineer
- **No Microservices:** Single repo.
- **No Custom Auth Provider:** Use Supabase.
- **No Complex Billing:** Manual subscriptions or simple Stripe checkout link (no recurring engine for MVP).
- **No WebSockets:** Refresh data on navigation/actions is enough for MVP.

---

## 2. Backend (Functional Requirements)

### 2.1 Database Schema
- **profiles:** `id (UUID)`, `email`, `full_name`, `role (trainer|client|admin)`, `avatar_url`.
- **workouts:** `id`, `trainer_id (FK)`, `title`, `description`, `location`, `price`.
- **slots:** `id`, `workout_id (FK)`, `start_time`, `end_time`, `capacity`, `current_bookings (computed)`.
- **bookings:** `id`, `slot_id (FK)`, `client_id (FK)`, `status (active|cancelled)`.
- **telegram_settings:** `user_id (FK)`, `chat_id`, `is_enabled`.

### 2.2 Roles & Permissions (RLS)
- **Trainer:** Can CRUD own workouts/slots. View bookings for own slots.
- **Client:** Can Read workouts/slots. CRUD own bookings.
- **Admin:** Bypass RLS for moderation.

### 2.3 Booking Logic
1. Check `capacity` vs `current_bookings` in a transaction (or DB function).
2. Create `booking` record.
3. Trigger Telegram notification.

---

## 3. Frontend (Design & UX)

### 3.1 Sitemap
- `/` - Landing / Login.
- `/dashboard` - Role-based home.
- `/workouts` - Browse workouts (Client) / Manage (Trainer).
- `/calendar` - Visual schedule.
- `/profile` - Settings & Telegram link.

### 3.2 Trainer Dashboard
- Quick view of today's slots.
- Total bookings for the week.
- "Add Slot" floating button.

### 3.3 Booking Flow (Client)
1. View Trainer's public link.
2. Select date/time slot.
3. Confirm booking (One-tap).
4. Receive Telegram confirmation.

### 3.4 Design System
- **Colors:** Slate/Zinc (Clean), Indigo/Blue (Primary Action).
- **Typography:** Sans-serif (Inter).
- **Components:** shadcn/ui (Cards, Calendars, Buttons, Dialogs).

---

## 4. Localization
- **Primary:** Russian (ru).
- **Tooling:** `next-intl` or simple JSON dictionary for MVP.

---

## 5. Telegram Integration (Utility Layer)

### 5.1 Architecture
- **Supabase Edge Function** acts as the bot backend.
- **Direct linking:** User enters `/start [token]` or links via Web UI.

### 5.2 Notification Flow
- **New Booking:** Notify Trainer.
- **Cancellation:** Notify both parties.
- **Reminder:** Send message 2 hours before training (via Cron Job/Scheduled Function).

### 5.3 What NOT to do in TG MVP
- No complex menus.
- No booking inside Telegram (redirect to Web App).
- No payment processing via TG.

---

## 6. Product Principles & Success Metrics

### 6.1 Anti-Overengineering Rules
- If it takes more than 2 days to build, simplify.
- Use native browser features over custom JS libraries.
- Standard shadcn components only (no custom themes).

### 6.2 Success Metrics (MVP)
- **Retention:** 30% of trainers return to schedule next week's slots.
- **Speed:** Time to create a workout < 60 seconds.
- **Usage:** > 5 bookings per trainer in the first month.

### 6.3 Pilot Launch Strategy
1. Onboard 3-5 friendly coaches manually.
2. Observe "shadow" usage (WhatsApp communication vs App).
3. Gather feedback via direct chat.
