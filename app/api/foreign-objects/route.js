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

// GET: 獲取當週南區夾異物筆數
export async function GET(request) {
  try {
    const FOREIGN_SHEET_ID = process.env.FOREIGN_SHEET_ID;
    const SHEET_NAME = "南區";

    if (!FOREIGN_SHEET_ID) {
      return NextResponse.json(
        { error: "缺少環境變數 FOREIGN_SHEET_ID", count: 0 },
        { status: 500 }
      );
    }

    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: FOREIGN_SHEET_ID,
      range: `'${SHEET_NAME}'!A:Z`,
    });

    const rows = res.data.values || [];
    const headers = rows[0] || [];

    // 找到日期欄位
    const dateColumnIndex = headers.findIndex(
      (h) => h === "日期" || h === "date" || h.includes("日期")
    );

    if (dateColumnIndex === -1) {
      console.warn("找不到日期欄位");
      return NextResponse.json({
        count: 0,
        weekStart: new Date().toLocaleDateString('zh-TW'),
        weekEnd: new Date().toLocaleDateString('zh-TW'),
      });
    }

    // 計算本週日期
    const today = new Date();
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 篩選本週數據
    let weekCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[dateColumnIndex]) continue;

      try {
        const itemDate = new Date(row[dateColumnIndex]);
        if (itemDate >= weekStart && itemDate <= weekEnd) {
          weekCount++;
        }
      } catch (e) {
        // 日期解析失敗，跳過
      }
    }

    return NextResponse.json({
      count: weekCount,
      weekStart: weekStart.toLocaleDateString('zh-TW'),
      weekEnd: weekEnd.toLocaleDateString('zh-TW'),
    });
  } catch (err) {
    console.error("夾異物統計 API 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "無法讀取夾異物數據", count: 0 },
      { status: 500 }
    );
  }
}
