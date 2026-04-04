import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const TARGET_FILES = [
  "alibaba-genshin-action-figure.json",
  "alibaba-genshin-pvc-figure.json",
  "alibaba-genshin-figurine.json",
  "alibaba-genshin-gk-figure.json",
  "alibaba-genshin-gk-resin-statue.json",
];

const EXCLUDED_PRODUCT_URLS = new Set([
  "https://www.alibaba.com/product-detail/Anime-Cartoon-Custom-Acrylic-Keychain-Manufacturer_1601013977036.html",
  "https://www.alibaba.com/product-detail/Genshin-Impact-Anime-Figure-Game-Character_1600581613366.html",
  "https://www.alibaba.com/product-detail/2025-New-Fashion-Genuine-Genshin-Products_1601362671550.html",
  "https://www.alibaba.com/product-detail/Wholesale-Genshin-Impact-Soft-Stuffed-Cartoon_1601491473822.html",
  "https://www.alibaba.com/product-detail/Wholesale-Genshin-Impact-Plush-Toy-Cartoon_1601038547299.html",
  "https://www.alibaba.com/product-detail/Hot-Selling-Genshin-Impact-Cartoon-Game_1601608997662.html",
  "https://www.alibaba.com/product-detail/Genshin-Impact-Cosplay-Diluc-Ragnvindr-Wolf_1600612922259.html",
  "https://www.alibaba.com/product-detail/20-Cm-Anime-Character-Weapon-Model_1601585291962.html",
  "https://www.alibaba.com/product-detail/XRH-PVC-Blind-Box-Toys-Children_1601244567667.html",
  "https://www.alibaba.com/product-detail/Genshin-Impact-the-Two-dimensional-Beauty_1601536853241.html",
  "https://www.alibaba.com/product-detail/10-20CM-Genshin-Impact-Miku-Sailor_1601293069741.html",
  "https://www.alibaba.com/product-detail/Final-Fantasy-VII-Remake-Standing-Cloud_1601575982845.html",
  "https://www.alibaba.com/product-detail/Japan-Anime-GK-Zero-Tribe-Hisoka_1600489886684.html",
  "https://www.alibaba.com/product-detail/Customized-Life-Size-Resin-GK-Bust_1601674522468.html",
  "https://www.alibaba.com/product-detail/Customized-Life-Size-Vegeta-Bust-Statue_1601025147436.html",
  "https://www.alibaba.com/product-detail/Large-PVC-Statue-Pok%25C3%25A9moner-Gengar-Character_1601419415720.html",
  "https://www.alibaba.com/product-detail/High-Quality-Anime-Action-Figure-One_1601559365028.html",
  "https://www.alibaba.com/product-detail/Chainsaw-Man-Makima-GK-Figure-Anime_1601694495910.html",
  "https://www.alibaba.com/product-detail/Thanos-Resin-Model-57cm-Super-Large_1601045033803.html",
  "https://www.alibaba.com/product-detail/NEW-ARRIVAL-RESIN-MOTHER-EARTH-GAIA_1601471971276.html",
  "https://www.alibaba.com/product-detail/Customized-3D-Printed-PU-GK-Resin_1601386114863.html",
  "https://www.alibaba.com/product-detail/GK-Kanroji-Mitsuri-Anime-PVC-Action_1601520228622.html",
  "https://www.alibaba.com/product-detail/17cm-One-Pieced-Anime-Figure-Yamato_1601662157652.html",
  "https://www.alibaba.com/product-detail/SE7ART-Cheongsam-GK-Statue-Model-Street_1601433816717.html",
  "https://www.alibaba.com/product-detail/Wholesale-Custom-High-Quality-Resin-Doll_1601383905175.html",
  "https://www.alibaba.com/product-detail/Life-Size-One-Piece-Figure-Resin_1600650197506.html",
  "https://www.alibaba.com/product-detail/Customization-Drawing-Sculpture-3D-Model_1601242156842.html",
  "https://www.alibaba.com/product-detail/Customized-Life-Size-Fiberglass-GK-Bust_1601433073508.html",
]);

const BATCH_SIZE = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const envFilePath = path.join(rootDir, ".env.local");

loadEnv({ path: envFilePath });

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function requireText(value, fieldName, fileName, index) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    throw new Error(
      `Missing ${fieldName} in ${fileName} at index ${index.toString()}.`,
    );
  }

  return normalized;
}

function parsePriceRange(priceText) {
  if (typeof priceText !== "string" || priceText.trim().length === 0) {
    return {
      priceMinUsd: null,
      priceMaxUsd: null,
    };
  }

  const matches = priceText.replaceAll(",", "").match(/\d+(?:\.\d+)?/g);

  if (!matches || matches.length === 0) {
    return {
      priceMinUsd: null,
      priceMaxUsd: null,
    };
  }

  const [firstValue, secondValue = firstValue] = matches.map(Number);

  return {
    priceMinUsd: firstValue,
    priceMaxUsd: secondValue,
  };
}

function getSourceKeyword(fileName) {
  return fileName.replace(/^alibaba-/u, "").replace(/\.json$/u, "");
}

async function readRows() {
  const rows = [];
  let inputCount = 0;

  for (const fileName of TARGET_FILES) {
    const filePath = path.join(dataDir, fileName);
    const fileContents = await readFile(filePath, "utf8");
    const records = JSON.parse(fileContents);

    if (!Array.isArray(records)) {
      throw new Error(`${fileName} does not contain a JSON array.`);
    }

    const sourceKeyword = getSourceKeyword(fileName);
    inputCount += records.length;

    records.forEach((record, index) => {
      const title = requireText(record?.title, "title", fileName, index);
      const productUrl = requireText(
        record?.url ?? record?.product_url,
        "product_url",
        fileName,
        index,
      );
      const { priceMinUsd, priceMaxUsd } = parsePriceRange(record?.price);

      rows.push({
        title,
        price_min_usd: priceMinUsd,
        price_max_usd: priceMaxUsd,
        image_url: normalizeOptionalText(record?.image),
        product_url: productUrl,
        seller_name: normalizeOptionalText(record?.seller),
        source_keyword: sourceKeyword,
        item_category: "figure",
        raw_json: record,
      });
    });
  }

  return {
    inputCount,
    fileCount: TARGET_FILES.length,
    rows,
  };
}

function filterExcludedRows(rows) {
  const filteredRows = [];
  let excludedCount = 0;

  for (const row of rows) {
    if (EXCLUDED_PRODUCT_URLS.has(row.product_url)) {
      excludedCount += 1;
      continue;
    }

    filteredRows.push(row);
  }

  return {
    rows: filteredRows,
    excludedCount,
  };
}

function dedupeRowsByProductUrl(rows) {
  const seenProductUrls = new Set();
  const dedupedRows = [];
  let duplicateCount = 0;

  for (const row of rows) {
    if (seenProductUrls.has(row.product_url)) {
      duplicateCount += 1;
      continue;
    }

    seenProductUrls.add(row.product_url);
    dedupedRows.push(row);
  }

  return {
    rows: dedupedRows,
    duplicateCount,
  };
}

async function upsertRows(supabase, rows) {
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const { error } = await supabase
      .from("alibaba_items")
      .upsert(batch, { onConflict: "product_url" });

    if (error) {
      throw new Error(`Failed to upsert Alibaba items: ${error.message}`);
    }
  }
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { inputCount, fileCount, rows: rawRows } = await readRows();
  const { rows: filteredRows, excludedCount } = filterExcludedRows(rawRows);
  const { rows, duplicateCount } = dedupeRowsByProductUrl(filteredRows);

  await upsertRows(supabase, rows);

  const { count, error: countError } = await supabase
    .from("alibaba_items")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(
      `Failed to fetch Alibaba item count: ${countError.message}`,
    );
  }

  console.log(
    `Loaded ${inputCount} rows from ${fileCount} files, excluded ${excludedCount}, skipped ${duplicateCount} duplicates, upserted ${rows.length} rows.`,
  );
  console.log(`alibaba_items total rows: ${count ?? 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
