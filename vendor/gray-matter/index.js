"use strict";

let loadYaml = null;

try {
  ({ load: loadYaml } = require("js-yaml"));
} catch {
  loadYaml = null;
}

function normalizeValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "[]") {
    return [];
  }

  return value;
}

function parseFrontmatter(frontmatter) {
  if (loadYaml) {
    const parsed = loadYaml(frontmatter);

    if (!parsed) {
      return {};
    }

    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Frontmatter must parse into an object");
    }

    return parsed;
  }

  const data = {};
  const lines = frontmatter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);

    if (!match) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const key = match[1];
    const rawValue = match[2] ?? "";

    if (!rawValue.trim()) {
      const items = [];

      for (let listIndex = index + 1; listIndex < lines.length; listIndex += 1) {
        const listLine = lines[listIndex];

        if (!listLine.trim()) {
          index = listIndex;
          continue;
        }

        const itemMatch = listLine.match(/^\s*-\s+(.*)$/);

        if (!itemMatch) {
          break;
        }

        items.push(normalizeValue(itemMatch[1]));
        index = listIndex;
      }

      data[key] = items;
      continue;
    }

    data[key] = normalizeValue(rawValue);
  }

  return data;
}

function matter(source) {
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!frontmatterMatch) {
    return {
      content: source,
      data: {},
    };
  }

  const frontmatter = frontmatterMatch[1];
  const content = source.slice(frontmatterMatch[0].length);

  return {
    content,
    data: parseFrontmatter(frontmatter),
  };
}

module.exports = matter;
module.exports.default = matter;
