create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text not null,
  type text not null check (type in ('asset', 'liability')),
  institution text,
  notes text,
  is_manual boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.balances (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.accounts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value numeric(14,2) not null default 0,
  recorded_at timestamptz default now()
);

create table public.snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_assets numeric(14,2) not null,
  total_liabilities numeric(14,2) not null,
  net_worth numeric(14,2) not null,
  snapshot_date date not null,
  created_at timestamptz default now(),
  unique(user_id, snapshot_date)
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.balances enable row level security;
alter table public.snapshots enable row level security;

create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users can manage own accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "Users can manage own balances" on public.balances for all using (auth.uid() = user_id);
create policy "Users can manage own snapshots" on public.snapshots for all using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
