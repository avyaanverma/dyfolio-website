import { getGoogleSymbol } from "../providers/symbol-mapper.js";

console.log("NSE:", getGoogleSymbol("HDFCBANK"));
console.log("BSE:", getGoogleSymbol("532174"));
