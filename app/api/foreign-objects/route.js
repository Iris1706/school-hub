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

// GET: 獲取南區夾異物筆數（支援日期範圍）
export async function GET(request) {
  try {
    const FOREIGN_SHEET_ID = process.env.FOREIGN_SHEET_ID;
    const SHEET_NAME = "南區";

    console.log('FOREIGN_SHEET_ID:', FOREIGN_SHEET_ID);

    if (!FOREIGN_SHEET_ID) {
      return NextResponse.json(
        { error: "缺少環境變數 FOREIGN_SHEET_ID", count: 0 },
        { status: 500 }
      );
    }

    // 從 query 參數獲取日期範圍
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let rangeStart, rangeEnd;

    // 解析 yyyy/m/d 格式的日期
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        return new Date(year, month, day);
      }
      return null;
    };

    // 如果提供了日期參數，使用提供的日期；否則計算本週
    if (startDateParam && endDateParam) {
      rangeStart = parseLocalDate(startDateParam);
      rangeEnd = parseLocalDate(endDateParam);
      if (!rangeStart || !rangeEnd) {
        throw new Error('日期格式錯誤，應為 yyyy/m/d 格式');
      }
      console.log(`使用提供的日期範圍: ${rangeStart.toLocaleDateString('zh-TW')} ~ ${rangeEnd.toLocaleDateString('zh-TW')}`);
    } else {
      // 計算本週日期（備用）
      const today = new Date();
      rangeStart = new Date(today);
      const day = rangeStart.getDay();
      const diff = rangeStart.getDate() - day + (day === 0 ? -6 : 1);
      rangeStart.setDate(diff);

      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 6);
      console.log(`使用計算的本週日期: ${rangeStart.toLocaleDateString('zh-TW')} ~ ${rangeEnd.toLocaleDateString('zh-TW')}`);
    }

    const sheets = getSheetsClient();
    console.log(`正在讀取 sheet: ${SHEET_NAME}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: FOREIGN_SHEET_ID,
      range: `'${SHEET_NAME}'!A:Z`,
    });

    const rows = res.data.values || [];
    console.log(`讀到 ${rows.length} 行數據`);

    const headers = rows[0] || [];
    console.log('表頭:', headers);

    // 找到日期欄位
    const dateColumnIndex = headers.findIndex(
      (h) => h === "日期" || h === "date" || h.includes("日期")
    );

    console.log('日期欄位索引:', dateColumnIndex);

    if (dateColumnIndex === -1) {
      console.warn("找不到日期欄位，使用第一列作為日期");
      // 如果找不到，使用第一列
      const dateIndex = 0;

      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[dateIndex]) continue;

        try {
          const itemDate = new Date(row[dateIndex]);
          if (itemDate >= rangeStart && itemDate <= rangeEnd) {
            count++;
          }
        } catch (e) {
          // 日期解析失敗，跳過
        }
      }

      return NextResponse.json({
        count: count,
        startDate: rangeStart.toLocaleDateString('zh-TW'),
        endDate: rangeEnd.toLocaleDateString('zh-TW'),
      });
    }

    // 篩選日期範圍內的數據
    let count = 0;
    console.log(`日期範圍: ${rangeStart.toLocaleDateString('zh-TW')} ~ ${rangeEnd.toLocaleDateString('zh-TW')}`);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[dateColumnIndex]) continue;

      try {
        const dateStr = String(row[dateColumnIndex]).trim();
        console.log(`第 ${i} 行日期字符串: "${dateStr}"`);

        // 解析格式 "2026/08/23" 或 "2026/8/23"
        let itemDate;
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // JavaScript 月份從 0 開始
            const day = parseInt(parts[2]);
            itemDate = new Date(year, month, day);
          }
        } else {
          itemDate = new Date(dateStr);
        }

        console.log(`解析後的日期: ${itemDate.toLocaleDateString('zh-TW')}`);

        if (itemDate >= rangeStart && itemDate <= rangeEnd) {
          count++;
          console.log(`✓ 匹配日期範圍`);
        }
      } catch (e) {
        console.error(`第 ${i} 行日期解析失敗:`, e.message);
      }
    }

    console.log(`最終計數: ${count}`);

    return NextResponse.json({
      count: count,
      startDate: rangeStart.toLocaleDateString('zh-TW'),
      endDate: rangeEnd.toLocaleDateString('zh-TW'),
    });
  } catch (err) {
    console.error("夾異物統計 API 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "無法讀取夾異物數據", count: 0 },
      { status: 500 }
    );
  }
}
