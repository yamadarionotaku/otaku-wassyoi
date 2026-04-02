type GrayMatterResult = {
  content: string;
  data: Record<string, unknown>;
};

declare function matter(source: string): GrayMatterResult;

export = matter;
