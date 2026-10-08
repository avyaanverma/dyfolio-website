import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("portfolio service does not fetch Yahoo chart history", async () => {
  const source = await readFile(
    new URL("../services/portofolio.service.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /getYahooPriceHistory|yahooFinance\.chart/);
});
