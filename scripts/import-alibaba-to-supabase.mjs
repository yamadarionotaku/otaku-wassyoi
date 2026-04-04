import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const FILE_MAPPINGS = {
  "alibaba-acrylic-stand.json": {
    sourceKeyword: "anime acrylic stand",
    itemCategory: "acrylic_stand",
  },
  "alibaba-anime-figure.json": {
    sourceKeyword: "anime figure",
    itemCategory: "figure",
  },
  "alibaba-can-badge.json": {
    sourceKeyword: "anime can badge pin button",
    itemCategory: "can_badge",
  },
  "alibaba-itabag.json": {
    sourceKeyword: "itabag anime",
    itemCategory: "itabag",
  },
  "alibaba-dakimakura.json": {
    sourceKeyword: "anime dakimakura pillow case",
    itemCategory: "dakimakura",
  },
};

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

async function readAlibabaRows() {
  const fileNames = (await readdir(dataDir))
    .filter((fileName) => /^alibaba-.*\.json$/u.test(fileName))
    .sort();

  const rows = [];

  for (const fileName of fileNames) {
    const mapping = FILE_MAPPINGS[fileName];

    if (!mapping) {
      throw new Error(`No keyword/category mapping found for ${fileName}`);
    }

    const filePath = path.join(dataDir, fileName);
    const fileContents = await readFile(filePath, "utf8");
    const records = JSON.parse(fileContents);

    if (!Array.isArray(records)) {
      throw new Error(`${fileName} does not contain a JSON array.`);
    }

    records.forEach((record, index) => {
      const title = requireText(record?.title, "title", fileName, index);
      const productUrl = requireText(record?.url, "url", fileName, index);
      const { priceMinUsd, priceMaxUsd } = parsePriceRange(record?.price);

      rows.push({
        title,
        price_min_usd: priceMinUsd,
        price_max_usd: priceMaxUsd,
        image_url: normalizeOptionalText(record?.image),
        product_url: productUrl,
        seller_name: normalizeOptionalText(record?.seller),
        source_keyword: mapping.sourceKeyword,
        item_category: mapping.itemCategory,
        raw_json: record,
      });
    });
  }

  return {
    fileCount: fileNames.length,
    rows,
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

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { fileCount, rows: rawRows } = await readAlibabaRows();
  const { rows, duplicateCount } = dedupeRowsByProductUrl(rawRows);

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const { error } = await supabase
      .from("alibaba_items")
      .upsert(batch, { onConflict: "product_url" });

    if (error) {
      throw new Error(`Failed to upsert Alibaba items: ${error.message}`);
    }
  }

  const { count, error: countError } = await supabase
    .from("alibaba_items")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(
      `Failed to fetch Alibaba item count: ${countError.message}`,
    );
  }

  console.log(
    `Imported ${rows.length} rows from ${fileCount} files into alibaba_items.`,
  );
  if (duplicateCount > 0) {
    console.log(`Skipped ${duplicateCount} duplicate rows by product_url.`);
  }
  console.log(`alibaba_items total rows: ${count ?? 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
