import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const COMMON_WORDS = new Set([
  "genshin",
  "genshined",
  "impact",
  "anime",
  "game",
  "figure",
  "figurine",
  "statue",
  "action",
  "pvc",
  "model",
  "toy",
  "toys",
  "doll",
  "collection",
  "collectible",
  "wholesale",
  "custom",
  "new",
  "hot",
  "for",
  "the",
  "with",
  "and",
  "set",
  "box",
  "blind",
  "gift",
  "cm",
  "cartoon",
  "plastic",
  "crafts",
  "ornament",
  "decoration",
  "decor",
]);
const SIMILARITY_THRESHOLD = 0.6;
const PRICE_OVERLAP_THRESHOLD = 0.3;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const defaultInputPath = path.join(dataDir, "filtered-layer1.json");
const outputPath = path.join(dataDir, "filtered-layer3.json");
const duplicatesOutputPath = path.join(dataDir, "filtered-layer3-duplicates.json");

class UnionFind {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = Array(size).fill(0);
  }

  find(index) {
    if (this.parent[index] !== index) {
      this.parent[index] = this.find(this.parent[index]);
    }

    return this.parent[index];
  }

  union(left, right) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);

    if (leftRoot === rightRoot) {
      return false;
    }

    if (this.rank[leftRoot] < this.rank[rightRoot]) {
      this.parent[leftRoot] = rightRoot;
      return true;
    }

    if (this.rank[leftRoot] > this.rank[rightRoot]) {
      this.parent[rightRoot] = leftRoot;
      return true;
    }

    this.parent[rightRoot] = leftRoot;
    this.rank[leftRoot] += 1;
    return true;
  }
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return "";
  }

  return title
    .toLowerCase()
    .replace(/\d+/gu, " ")
    .replace(/[^a-z\s]+/gu, " ")
    .split(/\s+/u)
    .filter(Boolean)
    .filter((token) => !COMMON_WORDS.has(token))
    .join(" ")
    .replace(/\s+/gu, " ")
    .trim();
}

function toTokenSet(normalizedTitle) {
  if (typeof normalizedTitle !== "string" || normalizedTitle.length === 0) {
    return new Set();
  }

  return new Set(normalizedTitle.split(/\s+/u).filter(Boolean));
}

function jaccardSimilarity(leftTitle, rightTitle) {
  const leftTokens = toTokenSet(leftTitle);
  const rightTokens = toTokenSet(rightTitle);

  if (leftTokens.size === 0 && rightTokens.size === 0) {
    return 0;
  }

  let intersectionSize = 0;
  const [smallerSet, largerSet] =
    leftTokens.size <= rightTokens.size
      ? [leftTokens, rightTokens]
      : [rightTokens, leftTokens];

  for (const token of smallerSet) {
    if (largerSet.has(token)) {
      intersectionSize += 1;
    }
  }

  const unionSize = leftTokens.size + rightTokens.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

function parsePrice(priceText) {
  if (typeof priceText !== "string" || priceText.trim().length === 0) {
    return {
      priceMin: null,
      priceMax: null,
    };
  }

  const matches = priceText.replaceAll(",", "").match(/\d+(?:\.\d+)?/g);

  if (!matches || matches.length === 0) {
    return {
      priceMin: null,
      priceMax: null,
    };
  }

  const [firstValue, secondValue = firstValue] = matches.map(Number);

  return {
    priceMin: firstValue,
    priceMax: secondValue,
  };
}

function hasPrice(priceRange) {
  return priceRange.priceMin !== null && priceRange.priceMax !== null;
}

function getPriceOverlapRatio(leftPrice, rightPrice) {
  const overlapStart = Math.max(leftPrice.priceMin, rightPrice.priceMin);
  const overlapEnd = Math.min(leftPrice.priceMax, rightPrice.priceMax);

  if (overlapEnd < overlapStart) {
    return 0;
  }

  const leftSpan = leftPrice.priceMax - leftPrice.priceMin;
  const rightSpan = rightPrice.priceMax - rightPrice.priceMin;

  if (leftSpan === 0 && rightSpan === 0) {
    return leftPrice.priceMin === rightPrice.priceMin ? 1 : 0;
  }

  if (leftSpan === 0) {
    return leftPrice.priceMin >= rightPrice.priceMin &&
      leftPrice.priceMin <= rightPrice.priceMax
      ? 1
      : 0;
  }

  if (rightSpan === 0) {
    return rightPrice.priceMin >= leftPrice.priceMin &&
      rightPrice.priceMin <= leftPrice.priceMax
      ? 1
      : 0;
  }

  const overlapSpan = overlapEnd - overlapStart;
  return overlapSpan / Math.min(leftSpan, rightSpan);
}

function passesPriceGroupingRule(leftPrice, rightPrice) {
  if (!hasPrice(leftPrice) || !hasPrice(rightPrice)) {
    return true;
  }

  return getPriceOverlapRatio(leftPrice, rightPrice) >= PRICE_OVERLAP_THRESHOLD;
}

function readItems(inputPath) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const items = JSON.parse(raw);

  if (!Array.isArray(items)) {
    throw new Error(`${inputPath} does not contain a JSON array.`);
  }

  return items;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildMetadata(items) {
  return items.map((item, index) => {
    const normalizedTitle = normalizeTitle(item?.title);
    const { priceMin, priceMax } = parsePrice(item?.price);

    return {
      index,
      item,
      normalizedTitle,
      tokenSet: toTokenSet(normalizedTitle),
      priceMin,
      priceMax,
    };
  });
}

function getJaccardFromTokenSets(leftTokens, rightTokens) {
  if (leftTokens.size === 0 && rightTokens.size === 0) {
    return 0;
  }

  let intersectionSize = 0;
  const [smallerSet, largerSet] =
    leftTokens.size <= rightTokens.size
      ? [leftTokens, rightTokens]
      : [rightTokens, leftTokens];

  for (const token of smallerSet) {
    if (largerSet.has(token)) {
      intersectionSize += 1;
    }
  }

  const unionSize = leftTokens.size + rightTokens.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

function findDuplicateGroups(metadata) {
  const unionFind = new UnionFind(metadata.length);

  for (let leftIndex = 0; leftIndex < metadata.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < metadata.length;
      rightIndex += 1
    ) {
      const left = metadata[leftIndex];
      const right = metadata[rightIndex];
      const similarity = getJaccardFromTokenSets(left.tokenSet, right.tokenSet);

      if (similarity <= SIMILARITY_THRESHOLD) {
        continue;
      }

      if (
        !passesPriceGroupingRule(
          { priceMin: left.priceMin, priceMax: left.priceMax },
          { priceMin: right.priceMin, priceMax: right.priceMax },
        )
      ) {
        continue;
      }

      unionFind.union(leftIndex, rightIndex);
    }
  }

  const groupedIndices = new Map();

  metadata.forEach((_, index) => {
    const root = unionFind.find(index);
    const group = groupedIndices.get(root) ?? [];
    group.push(index);
    groupedIndices.set(root, group);
  });

  return Array.from(groupedIndices.values())
    .filter((group) => group.length > 1)
    .sort((left, right) => left[0] - right[0]);
}

function compareRepresentativePriority(left, right) {
  const leftMin = left.priceMin ?? Number.POSITIVE_INFINITY;
  const rightMin = right.priceMin ?? Number.POSITIVE_INFINITY;

  if (leftMin !== rightMin) {
    return leftMin - rightMin;
  }

  const leftMax = left.priceMax ?? Number.POSITIVE_INFINITY;
  const rightMax = right.priceMax ?? Number.POSITIVE_INFINITY;

  if (leftMax !== rightMax) {
    return leftMax - rightMax;
  }

  return left.index - right.index;
}

function selectRepresentative(group, metadata) {
  return group
    .map((index) => metadata[index])
    .slice()
    .sort(compareRepresentativePriority)[0];
}

function toOutputEntry(item, similarity = null) {
  const entry = {
    title: item?.title ?? null,
    url: item?.url ?? null,
    price: item?.price ?? null,
  };

  if (similarity !== null) {
    entry.similarity = Number(similarity.toFixed(2));
  }

  return entry;
}

function buildDeduplicationResult(items) {
  const metadata = buildMetadata(items);
  const groups = findDuplicateGroups(metadata);
  const removedIndices = new Set();
  const duplicates = groups.map((group, groupOffset) => {
    const kept = selectRepresentative(group, metadata);
    const removed = group
      .filter((index) => index !== kept.index)
      .sort((left, right) => left - right)
      .map((index) => {
        removedIndices.add(index);
        const itemMeta = metadata[index];
        const similarity = jaccardSimilarity(
          kept.normalizedTitle,
          itemMeta.normalizedTitle,
        );

        return toOutputEntry(itemMeta.item, similarity);
      });

    return {
      group_id: groupOffset + 1,
      kept: toOutputEntry(kept.item),
      removed,
    };
  });

  const dedupedItems = items.filter((_, index) => !removedIndices.has(index));

  return {
    dedupedItems,
    duplicates,
  };
}

function logSummary(inputCount, groupCount, removedCount, outputCount) {
  console.log("Layer 3 Dedup Results:");
  console.log(`  Input: ${inputCount}`);
  console.log(`  Duplicate groups found: ${groupCount}`);
  console.log(`  Items removed: ${removedCount}`);
  console.log(`  Output: ${outputCount}`);
}

function resolveInputPath(inputArg) {
  if (!inputArg) {
    return defaultInputPath;
  }

  return path.resolve(process.cwd(), inputArg);
}

async function main(inputArg = process.argv[2]) {
  const inputPath = resolveInputPath(inputArg);
  const items = readItems(inputPath);
  const { dedupedItems, duplicates } = buildDeduplicationResult(items);

  writeJson(outputPath, dedupedItems);
  writeJson(duplicatesOutputPath, duplicates);

  logSummary(items.length, duplicates.length, items.length - dedupedItems.length, dedupedItems.length);
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
  COMMON_WORDS,
  PRICE_OVERLAP_THRESHOLD,
  SIMILARITY_THRESHOLD,
  UnionFind,
  buildDeduplicationResult,
  findDuplicateGroups,
  getPriceOverlapRatio,
  jaccardSimilarity,
  main,
  normalizeTitle,
  parsePrice,
  passesPriceGroupingRule,
  resolveInputPath,
  selectRepresentative,
};
