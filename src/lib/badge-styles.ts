import type { Availability } from "@/types";

export const availabilityClassNames: Record<Availability, string> = {
  preorder:
    "border border-[color:var(--color-gold-soft)] bg-[#b6945b24] text-[color:var(--color-ink)]",
  available:
    "border border-[#ba965466] bg-[#71985a24] text-[color:var(--color-night)]",
  sold_out:
    "border border-[#50617a33] bg-[#50617a1f] text-[color:var(--color-ink-soft)]",
  unknown:
    "border border-[#8fc0cc66] bg-[#4e86c524] text-[color:var(--color-night)]",
};
