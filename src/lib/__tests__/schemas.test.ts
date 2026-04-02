import { describe, expect, it } from "vitest";

import {
  parsePurchaseUrls,
  purchaseUrlSchema,
  purchaseUrlsSchema,
} from "@/lib/schemas";
import type { PurchaseUrl } from "@/types";

describe("parsePurchaseUrls", () => {
  it("parses valid purchase URLs", () => {
    const purchaseUrls: PurchaseUrl[] = [
      {
        label: "miHoYo旗舰店",
        url: "https://example.com/official-store",
        type: "official",
      },
      {
        label: "代行サービス",
        url: "https://example.com/proxy-service",
        type: "proxy",
      },
    ];

    expect(parsePurchaseUrls(purchaseUrls)).toEqual(purchaseUrls);
  });

  it("returns an empty array for nullish values", () => {
    expect(parsePurchaseUrls(null)).toEqual([]);
    expect(parsePurchaseUrls(undefined)).toEqual([]);
  });

  it("throws when the input is not a valid purchase URL array", () => {
    expect(() => parsePurchaseUrls({ label: "official" })).toThrow();
    expect(() =>
      parsePurchaseUrls([
        {
          label: "broken",
          url: "not-a-url",
          type: "official",
        },
      ]),
    ).toThrow();
  });
});

describe("purchase_urls schema", () => {
  it("accepts an array of purchase URLs", () => {
    const result = purchaseUrlsSchema.safeParse([
      {
        label: "公式ストア",
        url: "https://example.com/item",
        type: "official",
      },
    ]);

    expect(result.success).toBe(true);
  });

  it.each([
    [
      "label",
      {
        label: "",
        url: "https://example.com/item",
        type: "official",
      },
    ],
    [
      "url",
      {
        label: "公式ストア",
        url: "not-a-url",
        type: "official",
      },
    ],
    [
      "type",
      {
        label: "公式ストア",
        url: "https://example.com/item",
        type: "marketplace",
      },
    ],
  ])("rejects invalid %s values", (_field, value) => {
    const result = purchaseUrlSchema.safeParse(value);

    expect(result.success).toBe(false);
  });
});
