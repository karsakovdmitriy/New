-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Roles type
create type user_role as enum ('trainer', 'client', 'admin');

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role default 'client'::user_role,
  avatar_url text,
  created_at timestamptz default now()
);

-- Workouts table (General description of a service)
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  trainer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  price numeric(10, 2) default 0.00,
  created_at timestamptz default now()
);

-- Slots table (Specific time instances of a workout)
create table public.slots (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int default 1 not null,
  created_at timestamptz default now(),
  check (end_time > start_time)
);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.slots(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz default now(),
  unique(slot_id, client_id) -- Prevent double booking for the same slot
);

-- Telegram settings
create table public.telegram_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  chat_id text unique,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- RLS Policies

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.telegram_settings enable row level security;

-- Profile policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Workout policies
create policy "Workouts are viewable by everyone." on public.workouts
  for select using (true);

create policy "Trainers can CRUD own workouts." on public.workouts
  for all using (auth.uid() = trainer_id);

-- Slot policies
create policy "Slots are viewable by everyone." on public.slots
  for select using (true);

create policy "Trainers can manage slots for their workouts." on public.slots
  for all using (
    exists (
      select 1 from public.workouts
      where workouts.id = slots.workout_id
      and workouts.trainer_id = auth.uid()
    )
  );

-- Booking policies
create policy "Clients can view their own bookings." on public.bookings
  for select using (auth.uid() = client_id);

create policy "Trainers can view bookings for their slots." on public.bookings
  for select using (
    exists (
      select 1 from public.slots
      join public.workouts on slots.workout_id = workouts.id
      where slots.id = bookings.slot_id
      and workouts.trainer_id = auth.uid()
    )
  );

create policy "Clients can create their own bookings." on public.bookings
  for insert with check (auth.uid() = client_id);

create policy "Clients can update/cancel their own bookings." on public.bookings
  for update using (auth.uid() = client_id);

-- Telegram settings policies
create policy "Users can manage their own telegram settings." on public.telegram_settings
  for all using (auth.uid() = user_id);

-- Helper Functions
create or replace function get_slot_occupancy(slot_id uuid)
returns bigint as $$
  select count(*) from public.bookings
  where bookings.slot_id = $1 and status = 'active';
$$ language sql security definer;

-- Trigger to create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Booking validation logic (capacity check)
create or replace function public.check_slot_capacity()
returns trigger as $$
declare
  v_capacity int;
  v_occupancy bigint;
begin
  select capacity into v_capacity from public.slots where id = new.slot_id;
  select count(*) into v_occupancy from public.bookings where slot_id = new.slot_id and status = 'active';

  if v_occupancy >= v_capacity then
    raise exception 'Этот слот уже полностью заполнен';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger before_booking_insert
  before insert on public.bookings
  for each row execute procedure public.check_slot_capacity();
