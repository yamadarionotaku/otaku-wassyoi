-- Seed data: 原神キャラクター + 中国限定グッズサンプル
-- Supabase SQL Editor で 001_initial_schema.sql 実行後に投入

-- Characters
insert into characters (id, name_ja, name_zh, name_en, slug, game) values
  ('a1000000-0000-0000-0000-000000000001', '鍾離', '钟离', 'Zhongli', 'zhongli', 'genshin'),
  ('a1000000-0000-0000-0000-000000000002', '雷電将軍', '雷电将军', 'Raiden Shogun', 'raiden-shogun', 'genshin'),
  ('a1000000-0000-0000-0000-000000000003', '胡桃', '胡桃', 'Hu Tao', 'hu-tao', 'genshin'),
  ('a1000000-0000-0000-0000-000000000004', '甘雨', '甘雨', 'Ganyu', 'ganyu', 'genshin'),
  ('a1000000-0000-0000-0000-000000000005', '楓原万葉', '枫原万叶', 'Kaedehara Kazuha', 'kazuha', 'genshin');

-- Items
insert into items (title_ja, title_zh, character_id, game, item_type, source, price_cny, price_jpy_estimate, purchase_urls, release_date, is_china_exclusive, availability, description) values
(
  '鍾離 岩王帝君 1/7スケールフィギュア',
  '钟离 岩王帝君 1/7比例手办',
  'a1000000-0000-0000-0000-000000000001',
  'genshin', 'figure',
  'miHoYo天猫旗艦店',
  799, 17000,
  '[{"label":"miHoYo天猫旗艦店","url":"https://example.com/zhongli-figure","type":"official"},{"label":"瑠璃代行","url":"https://example.com/ruri-zhongli","type":"proxy"}]'::jsonb,
  '2025-12-01', true, 'available',
  'miHoYo公式の鍾離フィギュア。岩王帝君の姿を精密に再現。台座に璃月の岩元素モチーフ。全高約270mm。'
),
(
  '雷電将軍 夢想の一太刀 アクリルスタンド',
  '雷电将军 梦想一刀 亚克力立牌',
  'a1000000-0000-0000-0000-000000000002',
  'genshin', 'acrylic_stand',
  'miHoYo公式ショップ',
  89, 2000,
  '[{"label":"miHoYo公式ショップ","url":"https://example.com/raiden-acrylic","type":"official"}]'::jsonb,
  '2026-01-15', true, 'available',
  '元素爆発「夢想の一太刀」のポーズを再現したアクリルスタンド。高さ約150mm。'
),
(
  '胡桃 ぬいぐるみ 20cm',
  '胡桃 毛绒公仔 20cm',
  'a1000000-0000-0000-0000-000000000003',
  'genshin', 'plush',
  'miHoYo天猫旗艦店',
  169, 3600,
  '[{"label":"miHoYo天猫旗艦店","url":"https://example.com/hutao-plush","type":"official"},{"label":"CHINAMART","url":"https://example.com/chinamart-hutao","type":"proxy"}]'::jsonb,
  '2026-02-01', true, 'sold_out',
  'デフォルメされた胡桃のぬいぐるみ。帽子の蝶々も再現。即完売の人気商品。'
),
(
  '甘雨 月海亭 Tシャツ',
  '甘雨 月海亭 T恤',
  'a1000000-0000-0000-0000-000000000004',
  'genshin', 'apparel',
  'miHoYo公式ショップ',
  129, 2800,
  '[{"label":"miHoYo公式ショップ","url":"https://example.com/ganyu-tshirt","type":"official"}]'::jsonb,
  '2026-03-01', true, 'preorder',
  '甘雨の月海亭秘書モチーフのTシャツ。背面に璃月港のイラスト入り。S/M/L/XLサイズ展開。'
),
(
  '楓原万葉 紅葉モチーフ ノートブック',
  '枫原万叶 红叶主题 笔记本',
  'a1000000-0000-0000-0000-000000000005',
  'genshin', 'stationery',
  'miHoYo天猫旗艦店',
  59, 1300,
  '[{"label":"miHoYo天猫旗艦店","url":"https://example.com/kazuha-notebook","type":"official"},{"label":"瑠璃代行","url":"https://example.com/ruri-kazuha","type":"proxy"},{"label":"Amazon","url":"https://example.com/amazon-kazuha","type":"ec"}]'::jsonb,
  '2025-10-15', true, 'available',
  '万葉をイメージした紅葉柄のハードカバーノート。A5サイズ、192ページ。しおり紐付き。'
),
(
  '鍾離 契約の岩 デスクマット',
  '钟离 契约之岩 桌垫',
  'a1000000-0000-0000-0000-000000000001',
  'genshin', 'other',
  'miHoYo公式ショップ',
  149, 3200,
  '[{"label":"miHoYo公式ショップ","url":"https://example.com/zhongli-deskmat","type":"official"}]'::jsonb,
  '2026-01-20', true, 'available',
  '鍾離の契約シーンをモチーフにした大判デスクマット。800x400mm、滑り止め加工。'
);
