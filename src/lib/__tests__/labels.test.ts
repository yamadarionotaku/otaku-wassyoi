import { describe, expect, it } from "vitest";

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_VALUES,
  ITEM_TYPE_LABELS,
  ITEM_TYPES,
} from "@/lib/labels";

describe("label mappings", () => {
  it("has labels for every ItemType key", () => {
    expect(Object.keys(ITEM_TYPE_LABELS).sort()).toEqual([...ITEM_TYPES].sort());

    for (const itemType of ITEM_TYPES) {
      expect(ITEM_TYPE_LABELS[itemType]).toBeTruthy();
    }
  });

  it("has labels for every Availability key", () => {
    expect(Object.keys(AVAILABILITY_LABELS).sort()).toEqual(
      [...AVAILABILITY_VALUES].sort(),
    );

    for (const availability of AVAILABILITY_VALUES) {
      expect(AVAILABILITY_LABELS[availability]).toBeTruthy();
    }
  });
});
