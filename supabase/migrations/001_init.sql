-- SpotMap Database Schema
-- Migration 001: Initial setup

-- Erlaubte User (Allowlist, wird vom Admin gepflegt)
create table allowed_emails (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  invited_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Spots
create table spots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in (
    'breakfast', 'party', 'lostplace', 'nature', 'viewpoint', 
    'restaurant', 'bar', 'art', 'skate', 'secret_sex', 'misc'
  )),
  lat double precision not null check (lat >= -90 and lat <= 90),
  lng double precision not null check (lng >= -180 and lng <= 180),
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Fotos zu einem Spot
create table spot_photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Notifications (neue Spots seit letztem Besuch)
create table user_last_seen (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen timestamptz default now()
);

-- Enable Row Level Security
alter table allowed_emails enable row level security;
alter table spots enable row level security;
alter table spot_photos enable row level security;
alter table user_last_seen enable row level security;

-- RLS Policies für allowed_emails
create policy "Admins can manage allowed_emails" on allowed_emails
  for all using (
    auth.jwt() ->> 'email' = 'deine@email.de' -- Ersetze mit VITE_ADMIN_EMAIL
  );

-- RLS Policies für spots
create policy "Users can view all spots" on spots
  for select using (auth.role() = 'authenticated');

create policy "Users can create spots" on spots
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own spots" on spots
  for update using (auth.uid() = created_by);

create policy "Users can delete own spots" on spots
  for delete using (auth.uid() = created_by);

-- RLS Policies für spot_photos
create policy "Users can view all photos" on spot_photos
  for select using (auth.role() = 'authenticated');

create policy "Users can upload photos" on spot_photos
  for insert with check (auth.role() = 'authenticated');

create policy "Users can delete own photos" on spot_photos
  for delete using (auth.uid() = uploaded_by);

-- RLS Policies für user_last_seen
create policy "Users can manage own last_seen" on user_last_seen
  for all using (auth.uid() = user_id);

-- Indexes für Performance
create index idx_spots_category on spots(category);
create index idx_spots_created_at on spots(created_at desc);
create index idx_spots_location on spots(lat, lng);
create index idx_spot_photos_spot_id on spot_photos(spot_id);
create index idx_allowed_emails_email on allowed_emails(email);

-- Storage Bucket für Fotos
insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

-- RLS für Storage
create policy "Users can upload photos" on storage.objects
  for insert with check (
    bucket_id = 'spot-photos' and 
    auth.role() = 'authenticated'
  );

create policy "Users can view photos" on storage.objects
  for select using (
    bucket_id = 'spot-photos' and 
    auth.role() = 'authenticated'
  );

create policy "Users can update own photos" on storage.objects
  for update using (
    bucket_id = 'spot-photos' and 
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos" on storage.objects
  for delete using (
    bucket_id = 'spot-photos' and 
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Functions für Helper
create or replace function get_new_spots_count(p_user_id uuid)
returns integer as $$
declare
  last_seen_time timestamptz;
  new_count integer;
begin
  -- Hole den letzten Besuch des Users
  select coalesce(max(last_seen), now() - interval '30 days')
  into last_seen_time
  from user_last_seen
  where user_id = p_user_id;
  
  -- Zähle neue Spots seit dem letzten Besuch
  select count(*)
  into new_count
  from spots
  where created_at > last_seen_time;
  
  return new_count;
end;
$$ language plpgsql security definer;

-- Trigger um last_seen zu aktualisieren
create or replace function update_last_seen()
returns trigger as $$
begin
  insert into user_last_seen (user_id, last_seen)
  values (new.user_id, now())
  on conflict (user_id) 
  do update set last_seen = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger für auth.users
create trigger on_user_signup
  after insert on auth.users
  for each row
  execute function update_last_seen();
