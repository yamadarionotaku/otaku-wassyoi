import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REQUIRED_GENSHIN_KEYWORDS = ["genshin", "genshined", "yuanshen"];
const EXCLUDED_KEYWORDS = [
  "cosplay",
  "wig",
  "keychain",
  "key chain",
  "key ring",
  "plush",
  "acrylic stand",
  "acrylic standee",
  "pillow",
  "sword",
  "katana",
  "badge",
  "pin",
  "poster",
  "card",
  "stuffed",
  "costume",
  "dakimakura",
  "standee",
  "sticker",
  "tapestry",
  "mousepad",
  "mouse pad",
  "phone case",
  "backpack",
  "bag charm",
  "necklace",
  "earring",
  "bracelet",
  "ring",
];
const EXCLUDED_FRANCHISES = [
  "demon slayer",
  "one piece",
  "dragon ball",
  "naruto",
  "pokemon",
  "chainsaw man",
  "spy x family",
  "marvel",
  "final fantasy",
  "hunter x hunter",
  "sailor moon",
  "miku",
  "attack on titan",
  "jujutsu kaisen",
  "my hero academia",
  "honkai star rail",
  "zenless zone zero",
  "blue archive",
  "arknights",
  "fate",
  "evangelion",
  "gundam",
  "disney",
  "star wars",
  "thanos",
  "goku",
  "vegeta",
  "luffy",
  "pikachu",
  "gengar",
];
const FIGURE_KEYWORDS = [
  "figure",
  "figurine",
  "statue",
  "gk",
  "resin",
  "pvc",
  "model",
  "doll",
  "toy",
  "ornament",
];
const REASON_ORDER = [
  "missing_genshin",
  "excluded_keyword",
  "excluded_franchise",
  "missing_figure_keyword",
  "duplicate_url",
  "invalid_entry",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const passedOutputPath = path.join(dataDir, "filtered-layer1.json");
const excludedOutputPath = path.join(dataDir, "filtered-layer1-excluded.json");

function normalizeText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function findFirstMatch(text, keywords) {
  return keywords.find((keyword) => text.includes(keyword)) ?? null;
}

function getReasonBucket(reason) {
  const [bucket = reason] = reason.split(":");
  return bucket;
}

function toExcludedEntry(item, excludeReason) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    return {
      ...item,
      excludeReason,
    };
  }

  return {
    raw: item ?? null,
    excludeReason,
  };
}

function getAlibabaFileNames() {
  return fs
    .readdirSync(dataDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && /^alibaba-.*\.json$/u.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function loadAlibabaItems() {
  const fileNames = getAlibabaFileNames();
  const items = [];

  if (fileNames.length === 0) {
    throw new Error(`No Alibaba JSON files found in ${dataDir}.`);
  }

  for (const fileName of fileNames) {
    const filePath = path.join(dataDir, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const records = JSON.parse(fileContents);

    if (!Array.isArray(records)) {
      throw new Error(`${fileName} does not contain a JSON array.`);
    }

    items.push(...records);
  }

  return {
    fileCount: fileNames.length,
    items,
  };
}

function classifyItem(item, seenUrls) {
  const title = normalizeText(item?.title);
  const url = normalizeText(item?.url);

  if (!title || !url) {
    return { passed: false, reason: "invalid_entry" };
  }

  const titleLower = title.toLowerCase();

  if (!findFirstMatch(titleLower, REQUIRED_GENSHIN_KEYWORDS)) {
    return { passed: false, reason: "missing_genshin" };
  }

  const excludedKeyword = findFirstMatch(titleLower, EXCLUDED_KEYWORDS);
  if (excludedKeyword) {
    return {
      passed: false,
      reason: `excluded_keyword:${excludedKeyword}`,
    };
  }

  const excludedFranchise = findFirstMatch(titleLower, EXCLUDED_FRANCHISES);
  if (excludedFranchise) {
    return {
      passed: false,
      reason: `excluded_franchise:${excludedFranchise}`,
    };
  }

  if (!findFirstMatch(titleLower, FIGURE_KEYWORDS)) {
    return { passed: false, reason: "missing_figure_keyword" };
  }

  if (seenUrls.has(url)) {
    return { passed: false, reason: "duplicate_url" };
  }

  seenUrls.add(url);
  return { passed: true };
}

function filterItems(items) {
  const seenUrls = new Set();
  const passedItems = [];
  const excludedItems = [];
  const reasonCounts = Object.fromEntries(
    REASON_ORDER.map((reason) => [reason, 0]),
  );

  for (const item of items) {
    const result = classifyItem(item, seenUrls);

    if (result.passed) {
      passedItems.push(item);
      continue;
    }

    const bucket = getReasonBucket(result.reason);
    reasonCounts[bucket] = (reasonCounts[bucket] ?? 0) + 1;
    excludedItems.push(toExcludedEntry(item, result.reason));
  }

  return {
    passedItems,
    excludedItems,
    reasonCounts,
  };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function logSummary(totalLoaded, passedCount, excludedCount, reasonCounts) {
  console.log("Layer 1 Filter Results:");
  console.log(`  Total loaded: ${totalLoaded}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Excluded: ${excludedCount}`);

  for (const reason of REASON_ORDER) {
    console.log(`    - ${reason}: ${reasonCounts[reason] ?? 0}`);
  }
}

async function main() {
  const { items } = loadAlibabaItems();
  const { passedItems, excludedItems, reasonCounts } = filterItems(items);

  writeJson(passedOutputPath, passedItems);
  writeJson(excludedOutputPath, excludedItems);

  logSummary(
    items.length,
    passedItems.length,
    excludedItems.length,
    reasonCounts,
  );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export {
  EXCLUDED_FRANCHISES,
  EXCLUDED_KEYWORDS,
  FIGURE_KEYWORDS,
  REQUIRED_GENSHIN_KEYWORDS,
  classifyItem,
  filterItems,
  getAlibabaFileNames,
  loadAlibabaItems,
  main,
};
