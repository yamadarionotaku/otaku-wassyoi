-- Migration: Merge alibaba_items into items table
-- Date: 2026-04-04
-- This migration adds columns to items, makes character_id nullable,
-- and copies all alibaba_items data into items with source='alibaba'.
-- The alibaba_items table is NOT dropped (do that manually after verification).
--
-- NOTE:
-- The repo's current base schema defines items.item_type as text with a CHECK
-- constraint, not as a PostgreSQL enum.
-- If your actual database has been changed to use an enum instead, confirm the
-- enum name first:
--   SELECT typname FROM pg_type WHERE typname LIKE '%item%';
-- Then adapt the type update accordingly, for example:
--   ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'can_badge';
--   ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'itabag';
--   ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'dakimakura';
--
-- CAUTION:
-- If your database uses a real enum for items.item_type, the data copy below may
-- require an explicit cast such as item_category::text::item_type, and it will
-- fail unless every Alibaba category value already exists in that enum.

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS price_min_usd numeric;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS price_max_usd numeric;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS seller_name text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS source_keyword text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS raw_json jsonb;

ALTER TABLE public.items
  ALTER COLUMN character_id DROP NOT NULL;

-- Current schema uses text + CHECK, so extend the allowed item_type values by
-- replacing the existing CHECK constraint instead of altering an enum.
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.items'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%item_type%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.items DROP CONSTRAINT %I',
      constraint_name
    );
  END LOOP;
END $$;

ALTER TABLE public.items
  ADD CONSTRAINT items_item_type_check
  CHECK (
    item_type IN (
      'figure',
      'acrylic_stand',
      'can_badge',
      'itabag',
      'dakimakura',
      'plush',
      'apparel',
      'stationery',
      'other'
    )
  );

-- NOTE:
-- This INSERT assumes alibaba_items.item_category values map directly to
-- items.item_type values. In the current schema, both are text columns with
-- CHECK constraints, so no enum cast is required.
INSERT INTO public.items (
  id,
  title_ja,
  character_id,
  game,
  item_type,
  source,
  price_min_usd,
  price_max_usd,
  image_url,
  purchase_urls,
  seller_name,
  source_keyword,
  raw_json,
  is_china_exclusive,
  availability,
  created_at,
  updated_at
)
SELECT
  id,
  title,
  NULL,
  'genshin',
  item_category,
  'alibaba',
  price_min_usd,
  price_max_usd,
  image_url,
  jsonb_build_array(
    jsonb_build_object(
      'label', COALESCE(seller_name, 'Alibaba'),
      'url', product_url,
      'type', 'ec'
    )
  ),
  seller_name,
  source_keyword,
  raw_json,
  false,
  'available',
  created_at,
  updated_at
FROM public.alibaba_items
ON CONFLICT (id) DO NOTHING;
