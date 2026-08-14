import { google } from "googleapis";

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
export const SCHOOL_INFO_TAB = "學校資訊";
export const HISTORY_TAB = "修改歷程";

// Reads the whole service-account JSON key (base64-encoded) from one env
// var, rather than splitting email/private_key into separate vars — this
// avoids any manual line-break handling that could corrupt the key.
function getCredentials() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json);
  }
  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  };
}

export function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
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
