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

// GET: 從巡檢 Sheet 讀取 G:V 欄位的資料
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
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: INSPECT_SHEET_ID,
      range: `'${INSPECT_TAB}'!G1:V500`,
    });

    const rows = res.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({ headers: [], data: [], message: "無資料" });
    }

    // 第一行作為標題
    const headers = (rows[0] || []).map(h => String(h || "").trim());

    // 從第二行開始作為數據
    const data = rows.slice(1)
      // 過濾掉完全空白的行
      .filter(row => row && row.some(cell => cell && String(cell).trim() !== ""))
      .map((row, idx) => {
        const obj = { __row: idx + 2 };

        // 確保每個欄位都被正確對應
        headers.forEach((header, colIdx) => {
          if (header) {  // 只處理有標題的欄位
            obj[header] = (row[colIdx] || "").toString().trim();
          }
        });

        return obj;
      });

    return NextResponse.json({ headers, data });
  } catch (err) {
    console.error("巡檢 API 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "無法讀取巡檢數據" },
      { status: 500 }
    );
  }
}
