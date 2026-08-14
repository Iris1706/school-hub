import { google } from "googleapis";

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
export const SCHOOL_INFO_TAB = "學校資訊";
export const HISTORY_TAB = "修改歷程";

export function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
