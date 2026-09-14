import { NextResponse } from "next/server";
import { google } from "googleapis";

// 獲取巡檢用的 Google Sheets 認證
function getInspectCredentials() {
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

function getInspectSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getInspectCredentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// GET: 從巡檢 Sheet 讀取資料
export async function GET() {
  try {
    const INSPECT_SHEET_ID = process.env.Inspect_SHEET_ID;
    const INSPECT_TAB = "2026下半年高雄市生生平板巡檢總表";

    if (!INSPECT_SHEET_ID) {
      return NextResponse.json(
        { error: "缺少環境變數 Inspect_SHEET_ID" },
        { status: 500 }
      );
    }

    const sheets = getInspectSheetsClient();

    // 同時讀取兩個範圍
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: INSPECT_SHEET_ID,
      ranges: [
        `'${INSPECT_TAB}'!G1:V500`,    // 巡檢未完成清單
        `'${INSPECT_TAB}'!W1:AD10`,    // 人員統計
      ],
    });

    const batchResults = res.data.valueRanges || [];

    // 處理巡檢資料 (G:V)
    const inspectRows = batchResults[0]?.values || [];
    let inspectHeaders = [];
    let inspectData = [];

    if (inspectRows.length > 0) {
      inspectHeaders = (inspectRows[0] || []).map(h => String(h || "").trim());
      inspectData = inspectRows.slice(1)
        .filter(row => row && row.some(cell => cell && String(cell).trim() !== ""))
        .map((row, idx) => {
          const obj = { __row: idx + 2 };
          inspectHeaders.forEach((header, colIdx) => {
            if (header) {
              obj[header] = (row[colIdx] || "").toString().trim();
            }
          });
          return obj;
        });
    }

    // 處理人員統計資料 (W:AD)
    const staffRows = batchResults[1]?.values || [];
    let staffHeaders = [];
    let staffData = [];

    if (staffRows.length > 0) {
      staffHeaders = (staffRows[0] || []).map(h => String(h || "").trim());
      staffData = staffRows.slice(1)
        .filter(row => row && row.some(cell => cell && String(cell).trim() !== ""))
        .map((row, idx) => {
          const obj = { __row: idx + 2 };
          staffHeaders.forEach((header, colIdx) => {
            if (header) {
              obj[header] = (row[colIdx] || "").toString().trim();
            }
          });
          return obj;
        });
    }

    return NextResponse.json({
      inspect: {
        headers: inspectHeaders,
        data: inspectData,
      },
      staff: {
        headers: staffHeaders,
        data: staffData,
      },
    });
  } catch (err) {
    console.error("巡檢 API 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "無法讀取巡檢數據" },
      { status: 500 }
    );
  }
}
