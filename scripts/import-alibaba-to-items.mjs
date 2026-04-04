import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const BATCH_SIZE = 100;
const SOURCE = "alibaba";
const GAME = "genshin";
const ITEM_TYPE = "figure";
const AVAILABILITY = "unknown";
const IS_CHINA_EXCLUSIVE = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envFilePath = path.join(rootDir, ".env.local");
const inputFilePath = path.join(rootDir, "data", "filtered-final.json");

dotenv.config({ path: envFilePath });

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

function requireText(value, fieldName, index) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    throw new Error(
      `Missing ${fieldName} in ${path.basename(inputFilePath)} at index ${index.toString()}.`,
    );
  }

  return normalized;
}

function parsePrice(priceText) {
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

function inferSourceKeyword(record) {
  const candidate = normalizeOptionalText(record?.source_keyword);
  return candidate ?? SOURCE;
}

async function readInputRecords() {
  const fileContents = await readFile(inputFilePath, "utf8");
  const records = JSON.parse(fileContents);

  if (!Array.isArray(records)) {
    throw new Error(`${path.basename(inputFilePath)} does not contain a JSON array.`);
  }

  return records;
}

function transformRecord(record, index) {
  const title = requireText(record?.title, "title", index);
  const productUrl = requireText(
    record?.product_url ?? record?.url,
    "product_url",
    index,
  );
  const sellerName = requireText(record?.seller, "seller", index);
  const { priceMinUsd, priceMaxUsd } = parsePrice(record?.price);

  return {
    title_ja: title,
    game: GAME,
    item_type: ITEM_TYPE,
    source: SOURCE,
    price_min_usd: priceMinUsd,
    price_max_usd: priceMaxUsd,
    image_url: normalizeOptionalText(record?.image),
    purchase_urls: [
      {
        label: sellerName,
        url: productUrl,
        type: "ec",
      },
    ],
    seller_name: sellerName,
    source_keyword: inferSourceKeyword(record),
    raw_json: record,
    availability: AVAILABILITY,
    is_china_exclusive: IS_CHINA_EXCLUSIVE,
  };
}

function createHeaders(serviceRoleKey, extraHeaders = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders,
  };
}

async function expectOk(response, action) {
  if (response.ok) {
    return;
  }

  const text = await response.text();
  throw new Error(
    `${action} failed (${response.status} ${response.statusText}): ${text}`,
  );
}

async function fetchCount(baseRestUrl, serviceRoleKey, query) {
  const response = await fetch(`${baseRestUrl}/items?select=id&${query}`, {
    method: "HEAD",
    headers: createHeaders(serviceRoleKey, {
      Prefer: "count=exact",
    }),
  });

  await expectOk(response, "Count query");

  const contentRange = response.headers.get("content-range");

  if (!contentRange) {
    throw new Error("Count query did not return a content-range header.");
  }

  const totalText = contentRange.split("/")[1];
  const count = Number(totalText);

  if (!Number.isFinite(count)) {
    throw new Error(`Unable to parse count from content-range: ${contentRange}`);
  }

  return count;
}

async function deleteAlibabaItems(baseRestUrl, serviceRoleKey) {
  const response = await fetch(`${baseRestUrl}/items?source=eq.${SOURCE}`, {
    method: "DELETE",
    headers: createHeaders(serviceRoleKey, {
      Prefer: "return=minimal",
    }),
  });

  await expectOk(response, "Delete alibaba items");
}

async function insertItems(baseRestUrl, serviceRoleKey, rows) {
  let insertedCount = 0;

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const response = await fetch(`${baseRestUrl}/items`, {
      method: "POST",
      headers: createHeaders(serviceRoleKey, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify(batch),
    });

    await expectOk(response, "Insert items");
    insertedCount += batch.length;
  }

  return insertedCount;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const baseRestUrl = `${supabaseUrl.replace(/\/$/u, "")}/rest/v1`;

  const records = await readInputRecords();
  const rows = records.map(transformRecord);

  const deletedCount = await fetchCount(
    baseRestUrl,
    serviceRoleKey,
    `source=eq.${SOURCE}`,
  );
  await deleteAlibabaItems(baseRestUrl, serviceRoleKey);

  const insertedCount = await insertItems(baseRestUrl, serviceRoleKey, rows);
  const manualItemsPreserved = await fetchCount(
    baseRestUrl,
    serviceRoleKey,
    `source=neq.${SOURCE}`,
  );

  console.log("Import Results:");
  console.log(`  Deleted existing alibaba items: ${deletedCount}`);
  console.log(`  Inserted new items: ${insertedCount}`);
  console.log(`  Manual items preserved: ${manualItemsPreserved}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
