import { getGoogleFundamentals } from "../providers/google-finance-provider.js";

const result = await getGoogleFundamentals("532174:BOM");

console.log(result);
