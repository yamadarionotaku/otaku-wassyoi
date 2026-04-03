import type { Availability } from "@/types";

export const availabilityClassNames: Record<Availability, string> = {
  preorder: "bg-amber-100 text-amber-800",
  available: "bg-emerald-100 text-emerald-800",
  sold_out: "bg-zinc-200 text-zinc-700",
  unknown: "bg-sky-100 text-sky-800",
};
