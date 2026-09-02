import { NextResponse } from "next/server";
import { google } from "googleapis";

// 獲取 Google Sheets 認證
function getSheetsClient() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  let credentials;

  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    credentials = JSON.parse(json);
  } else {
    credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// 診斷 API
export async function GET(request) {
  try {
    const FOREIGN_SHEET_ID = process.env.FOREIGN_SHEET_ID;
    const SHEET_NAME = "南區";

    const diagnostics = {
      sheetId: FOREIGN_SHEET_ID ? "✓ 已設置" : "✗ 未設置",
      timestamp: new Date().toISOString(),
    };

    if (!FOREIGN_SHEET_ID) {
      return NextResponse.json({
        error: "缺少環境變數 FOREIGN_SHEET_ID",
        diagnostics,
      }, { status: 500 });
    }

    const sheets = getSheetsClient();

    // 1. 讀取工作表清單
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: FOREIGN_SHEET_ID,
    });

    diagnostics.spreadsheetTitle = spreadsheet.data.properties.title;
    diagnostics.sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
    diagnostics.hasSheet = diagnostics.sheetNames.includes(SHEET_NAME);

    // 2. 讀取南區工作表的第一行（表頭）
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: FOREIGN_SHEET_ID,
      range: `'${SHEET_NAME}'!A1:Z1`,
    });

    const headers = res.data.values?.[0] || [];
    diagnostics.headers = headers;
    diagnostics.headerCount = headers.length;

    // 3. 找日期欄位
    const dateColumnIndex = headers.findIndex(
      (h) => h === "日期" || h === "date" || h.includes("日期")
    );
    diagnostics.dateColumnIndex = dateColumnIndex;
    diagnostics.dateColumnName = dateColumnIndex >= 0 ? headers[dateColumnIndex] : "未找到";

    // 4. 讀取全部數據統計
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId: FOREIGN_SHEET_ID,
      range: `'${SHEET_NAME}'!A:Z`,
    });

    const rows = allData.data.values || [];
    diagnostics.totalRows = rows.length;
    diagnostics.dataRows = rows.length - 1; // 扣除表頭

    // 5. 抽樣檢查前5行的日期
    if (dateColumnIndex >= 0 && rows.length > 1) {
      diagnostics.sampleDates = [];
      for (let i = 1; i < Math.min(6, rows.length); i++) {
        const dateStr = rows[i][dateColumnIndex];
        diagnostics.sampleDates.push({
          row: i + 1,
          value: dateStr,
          format: dateStr ? detectDateFormat(dateStr) : "空值",
        });
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}

function detectDateFormat(dateStr) {
  const str = String(dateStr).trim();
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) return "yyyy/m/d ✓";
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) return "yyyy-m-d";
  if (/^\d{2}\/\d{1,2}\/\d{1,2}$/.test(str)) return "yy/m/d";
  return `其他: ${str}`;
}
