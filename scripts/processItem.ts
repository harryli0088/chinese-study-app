import fs from "fs";
import nodejieba from "nodejieba";
import { pinyin } from "pinyin";
import cedict from "cc-cedict";
import type { SearchResults } from "cc-cedict";
import { z } from "zod";

import { data } from "./data"

const UnprocessedItemSchema = z.object({
  chinese: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    content: z.string().min(1),
  }),
  translation: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    content: z.string().min(1),
  }),
  type: z.string().min(1),
}).strict();

type UnprocessedItemType = z.infer<typeof UnprocessedItemSchema>;

export type ProcessedTokenType = [string,string,SearchResults]

export type ItemType = UnprocessedItemType & {
  processed: {
    title: ProcessedTokenType[][],
    author: ProcessedTokenType[][],
    content: ProcessedTokenType[][],
  },
}

/* Parse Input Data */
const result = UnprocessedItemSchema.safeParse(data);
if (!result.success) {
  console.error("Validation errors:", result.error);
  throw new Error("Invalid JSON structure");
}
const DATA = result.data;
console.log("Input data has a valid schema. Processing...")


/* Process data */
function processText(text:string) {
  const tokens = nodejieba.cut(text);


  let row:ProcessedTokenType[] = [];
  const output:ProcessedTokenType[][] = [row];
  tokens.forEach(t => {
    if(t.trim()) {
      lookupWithFallback(row,t)
    }
    else if(t === "\n") {
      row = [];
      output.push(row);
    }
    else {
      row.push([t,"",null]);
    }
  });

  return output;
}

function lookupWithFallback(row: ProcessedTokenType[], token: string):void {
  // 1. Try full token
  let result = cedict.getBySimplified(token);
  if (result || token.length===1) {
    if(!result && !["。","，","；","？"].includes(token)) {
      console.warn(`Could not find a definition for ${token}`)
    }
    row.push([
      token,
      pinyin(token, { style: pinyin.STYLE_TONE, heteronym: false }).flat().join(" "),
      result
    ]);
    return;
  }

  // 2. Try splitting with jieba again (finer segmentation)
  const subTokens = nodejieba.cut(token, true); // true = HMM for finer cut
  if (subTokens.length > 1) {
    const subResults = subTokens
      .map(st => cedict.getBySimplified(st))
      .filter(Boolean);

    if (subTokens.length === subResults.length) {
      console.log(`Split ${token} into ${subTokens}`)
      subTokens.forEach((t,i) => {
        const result = subResults[i];
        row.push([
          t,
          pinyin(t, { style: pinyin.STYLE_TONE, heteronym: false }).flat().join(" "),
          result
        ]);
      });
      return;
    }
  }

  // 3. Fallback: character-by-character
  console.log(`Splitting ${token} into individual characters`)
  token.split("").forEach(t => {
    lookupWithFallback(row,t)
  });
}


fs.writeFileSync(`../src/catalog/items/${DATA.chinese.title}.json`, JSON.stringify({
  ...DATA,
  processed: {
    title: processText(DATA.chinese.title),
    author: processText(DATA.chinese.author),
    content: processText(DATA.chinese.content),
  },
} as ItemType), "utf-8");
console.log(`Done! Wrote output file to ../src/catalog/items/${DATA.chinese.title}.json`)