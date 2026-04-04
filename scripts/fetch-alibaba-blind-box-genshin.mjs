import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const QUERY = "blind box genshin impact";
const SHOWROOM_URL =
  "https://www.alibaba.com/showroom/blind-box-genshin-impact.html";
const SEARCH_URL =
  "https://www.alibaba.com/trade/search?SearchText=blind+box+genshin+impact";
const OUTPUT_PATH =
  "/home/yamadarion/projects/otaku-wassyoi/data/alibaba-blind-box-genshin.json";
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeUrl(value) {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `https://www.alibaba.com${value}`;
  if (!/^https?:\/\//.test(value)) {
    return `https://www.alibaba.com/${value.replace(/^\/+/, "")}`;
  }
  return value;
}

function looksBlocked(html) {
  return /captcha interception|unusual traffic|please slide to verify|punish-component/i.test(
    html,
  );
}

function runCurl(url) {
  const result = spawnSync(
    "curl",
    [
      "-L",
      "--compressed",
      "--max-time",
      "60",
      "-A",
      USER_AGENT,
      url,
    ],
    {
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `curl failed for ${url}`);
  }

  return result.stdout;
}

function extractBalancedJson(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const braceStart = source.indexOf("{", markerIndex + marker.length);
  if (braceStart === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart, index + 1);
      }
    }
  }

  return null;
}

function extractPageData(html) {
  const jsonText = extractBalancedJson(html, "window._PAGE_DATA_ = ");
  if (!jsonText) {
    return null;
  }

  return JSON.parse(jsonText);
}

function pickTitle(offer) {
  return (
    offer.information?.enPureTitle ||
    offer.information?.puretitle ||
    offer.puretitle ||
    offer.image?.alt ||
    null
  );
}

function pickUrl(offer) {
  return normalizeUrl(
    offer.information?.productUrl ||
      offer.productUrl ||
      offer.information?.eurl ||
      null,
  );
}

function pickImage(offer) {
  return normalizeUrl(
    offer.image?.productImage ||
      offer.image?.mainImage ||
      offer.image?.bigImage ||
      null,
  );
}

function pickPrice(offer) {
  return (
    offer.tradePrice?.price ||
    offer.promotionInfoVO?.styleLocalOriginalPriceRangeStr ||
    null
  );
}

function pickSeller(offer) {
  return offer.supplier?.supplierName || null;
}

function extractProducts(pageData) {
  const items = pageData?.offerResultData?.itemInfoList ?? [];
  const products = [];

  for (const item of items) {
    const offer = item?.offer;
    if (!offer) continue;

    const product = {
      title: pickTitle(offer),
      price: pickPrice(offer),
      image: pickImage(offer),
      url: pickUrl(offer),
      seller: pickSeller(offer),
    };

    if (!product.title || !product.url) {
      continue;
    }

    products.push(product);
  }

  return products;
}

function mergeProducts(productGroups) {
  const merged = [];
  const seen = new Set();

  for (const group of productGroups) {
    for (const product of group) {
      if (!product.title || !product.url) {
        continue;
      }

      if (seen.has(product.url)) {
        continue;
      }

      seen.add(product.url);
      merged.push(product);
    }
  }

  return merged;
}

async function fetchWithPlaywright(url) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(5_000);
    return await page.content();
  } finally {
    await browser.close();
  }
}

async function attemptExtraction({ url, label }) {
  const attempts = [];

  const curlHtml = runCurl(url);
  attempts.push({
    method: "curl",
    url,
    blocked: looksBlocked(curlHtml),
  });

  let pageData = !looksBlocked(curlHtml) ? extractPageData(curlHtml) : null;
  let products = extractProducts(pageData);
  if (products.length > 0) {
    return { source: `${label}-curl`, url, attempts, products, pageData };
  }

  const playwrightHtml = await fetchWithPlaywright(url);
  attempts.push({
    method: "playwright",
    url,
    blocked: looksBlocked(playwrightHtml),
  });

  pageData = !looksBlocked(playwrightHtml) ? extractPageData(playwrightHtml) : null;
  products = extractProducts(pageData);
  if (products.length > 0) {
    return { source: `${label}-playwright`, url, attempts, products, pageData };
  }

  return { source: null, url, attempts, products: [], pageData: null };
}

function buildShowroomPageUrl(basePageData, pageNumber) {
  if (pageNumber <= 1) {
    return SHOWROOM_URL;
  }

  const urlRule = basePageData?.pagination?.urlRule;
  if (urlRule?.includes("{0}")) {
    return normalizeUrl(urlRule.replace("{0}", String(pageNumber)));
  }

  return SHOWROOM_URL.replace(/\.html$/, `_${pageNumber}.html`);
}

async function resolveShowroomProducts() {
  const firstPage = await attemptExtraction({
    url: SHOWROOM_URL,
    label: "showroom-page-1",
  });

  if (firstPage.products.length === 0) {
    return firstPage;
  }

  const totalPages = Math.max(1, Number(firstPage.pageData?.pagination?.total) || 1);
  const productGroups = [firstPage.products];
  const attempts = [...firstPage.attempts];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const pageUrl = buildShowroomPageUrl(firstPage.pageData, pageNumber);
    const pageResult = await attemptExtraction({
      url: pageUrl,
      label: `showroom-page-${pageNumber}`,
    });

    attempts.push(...pageResult.attempts);

    if (pageResult.products.length === 0) {
      continue;
    }

    productGroups.push(pageResult.products);
  }

  return {
    source: firstPage.source,
    url: SHOWROOM_URL,
    attempts,
    products: mergeProducts(productGroups),
  };
}

async function resolveProducts() {
  const showroomResult = await resolveShowroomProducts();
  if (showroomResult.products.length > 0) {
    return showroomResult;
  }

  const searchResult = await attemptExtraction({
    url: SEARCH_URL,
    label: "search",
  });
  if (searchResult.products.length > 0) {
    return {
      source: searchResult.source,
      url: searchResult.url,
      attempts: [...showroomResult.attempts, ...searchResult.attempts],
      products: mergeProducts([searchResult.products]),
    };
  }

  throw new Error(
    JSON.stringify(
      {
        query: QUERY,
        attempts: [...showroomResult.attempts, ...searchResult.attempts],
        message: "No Alibaba product data could be extracted from showroom or search pages.",
      },
      null,
      2,
    ),
  );
}

async function main() {
  ensureDir(OUTPUT_PATH);

  const result = await resolveProducts();
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(result.products, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        query: QUERY,
        outputPath: OUTPUT_PATH,
        source: result.source,
        sourceUrl: result.url,
        itemCount: result.products.length,
        attempts: result.attempts,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
