-- Characters table
create table characters (
  id uuid primary key default gen_random_uuid(),
  name_ja text not null,
  name_zh text not null,
  name_en text not null,
  slug text not null unique,
  game text not null default 'genshin' check (game in ('genshin', 'starrail', 'wutheringwaves')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Items table
create table items (
  id uuid primary key default gen_random_uuid(),
  title_ja text not null,
  title_zh text,
  character_id uuid not null references characters(id),
  game text not null default 'genshin' check (game in ('genshin', 'starrail', 'wutheringwaves')),
  item_type text not null check (item_type in ('figure', 'acrylic_stand', 'plush', 'apparel', 'stationery', 'other')),
  source text,
  price_cny numeric,
  price_jpy_estimate numeric,
  image_url text,
  purchase_urls jsonb not null default '[]'::jsonb,
  release_date date,
  is_china_exclusive boolean not null default true,
  availability text not null default 'unknown' check (availability in ('preorder', 'available', 'sold_out', 'unknown')),
  description text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index items_character_id_idx on items(character_id);
create index items_game_idx on items(game);
create index items_item_type_idx on items(item_type);
create index items_availability_idx on items(availability);
create index characters_game_idx on characters(game);
create index characters_slug_idx on characters(slug);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at before update on items
  for each row execute function update_updated_at();

create trigger characters_updated_at before update on characters
  for each row execute function update_updated_at();

-- RLS policies (read-only public access)
alter table characters enable row level security;
alter table items enable row level security;

create policy "Characters are viewable by everyone"
  on characters for select using (true);

create policy "Items are viewable by everyone"
  on items for select using (true);
