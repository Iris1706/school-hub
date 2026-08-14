import { google } from "googleapis";

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
export const SCHOOL_INFO_TAB = "學校資訊";
export const HISTORY_TAB = "修改歷程";

// Accepts the private key either as a raw PEM string (with real or literal
// \n line breaks) or as a base64-encoded version of that string. Base64 is
// recommended because it survives copy/paste into Vercel's env var UI
// without corruption.
function resolvePrivateKey() {
  const raw = process.env.GOOGLE_PRIVATE_KEY || "";
  let text = raw;
  if (!text.includes("BEGIN PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      if (decoded.includes("BEGIN PRIVATE KEY")) text = decoded;
    } catch {
      // not base64, fall through and use raw as-is
    }
  }
  return text.replace(/\\n/g, "\n");
}

export function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: resolvePrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Converts a 0-based column index into a spreadsheet column letter (0 -> A, 25 -> Z, 26 -> AA ...)
export function columnLetter(index) {
  let letter = "";
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}
