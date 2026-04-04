create table alibaba_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price_min_usd numeric,
  price_max_usd numeric,
  image_url text,
  product_url text not null unique,
  seller_name text,
  source_keyword text not null,
  item_category text not null check (
    item_category in (
      'acrylic_stand',
      'figure',
      'can_badge',
      'itabag',
      'dakimakura'
    )
  ),
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index alibaba_items_item_category_idx on alibaba_items(item_category);

create trigger alibaba_items_updated_at before update on alibaba_items
  for each row execute function update_updated_at();

-- RLS remains disabled during development.
