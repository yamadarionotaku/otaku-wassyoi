export type Element =
  | "pyro"
  | "hydro"
  | "electro"
  | "dendro"
  | "cryo"
  | "geo"
  | "anemo";

export const CHARACTER_META: Record<
  string,
  {
    element: Element;
    elementLabel: string;
    region: string;
    regionLabel: string;
  }
> = {
  zhongli: {
    element: "geo",
    elementLabel: "岩元素",
    region: "liyue",
    regionLabel: "璃月",
  },
  "raiden-shogun": {
    element: "electro",
    elementLabel: "雷元素",
    region: "inazuma",
    regionLabel: "稲妻",
  },
  "hu-tao": {
    element: "pyro",
    elementLabel: "炎元素",
    region: "liyue",
    regionLabel: "璃月",
  },
  ganyu: {
    element: "cryo",
    elementLabel: "氷元素",
    region: "liyue",
    regionLabel: "璃月",
  },
  kazuha: {
    element: "anemo",
    elementLabel: "風元素",
    region: "inazuma",
    regionLabel: "稲妻",
  },
};

export const ELEMENT_COLORS: Record<Element, string> = {
  pyro: "var(--color-element-pyro)",
  hydro: "var(--color-element-hydro)",
  electro: "var(--color-element-electro)",
  dendro: "var(--color-element-dendro)",
  cryo: "var(--color-element-cryo)",
  geo: "var(--color-element-geo)",
  anemo: "var(--color-element-anemo)",
};
