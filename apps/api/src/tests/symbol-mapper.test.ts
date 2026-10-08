import assert from "node:assert/strict";
import test from "node:test";
import { getGoogleSymbol, getYahooSymbol } from "../providers/symbol-mapper.js";

test("maps NSE code to Yahoo and Google symbols", () => {
  assert.equal(getYahooSymbol("HDFCBANK"), "HDFCBANK.NS");
  assert.equal(getGoogleSymbol("HDFCBANK"), "HDFCBANK:NSE");
});

test("maps BSE code to Yahoo and Google symbols", () => {
  assert.equal(getYahooSymbol("532174"), "ICICIBANK.BO");
  assert.equal(getGoogleSymbol("532174"), "532174:BOM");
});

test("throws when a BSE code has no Yahoo mapping", () => {
  assert.throws(
    () => getYahooSymbol("999999"),
    /No Yahoo symbol mapping found/,
  );
});