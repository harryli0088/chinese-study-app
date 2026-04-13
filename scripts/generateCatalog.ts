import fs from "fs";
import path from "path";

import type { ItemType } from "./processItem"

const dir = "../src/catalog/items";
const files = fs.readdirSync(dir);

const catalog = files.map((file) => {
  const json = JSON.parse(
    fs.readFileSync(path.join(dir, file), "utf-8")
  ) as ItemType;

  return {
    name: json.chinese.title,
    type: json.type,
  };
});

fs.writeFileSync(
  "../src/catalog/catalog.ts",
  `export type CatalogType = {name:string,type:string};

export const catalog = ${JSON.stringify(catalog, null, 2)};`
);