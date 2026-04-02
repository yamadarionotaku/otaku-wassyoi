import { z } from "zod";

import type { PurchaseUrl } from "@/types";

export const purchaseUrlSchema = z.object({
  label: z.string().trim().min(1),
  url: z.string().url(),
  type: z.enum(["official", "proxy", "reseller", "ec"]),
}) satisfies z.ZodType<PurchaseUrl>;

export const purchaseUrlsSchema = z.array(purchaseUrlSchema);

export function parsePurchaseUrls(data: unknown): PurchaseUrl[] {
  return purchaseUrlsSchema.parse(data ?? []);
}
