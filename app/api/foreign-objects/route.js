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
    let matchedDates = [];
    let allDateParsed = [];
    let debugInfo = {
      totalRows: rows.length - 1,
      dateColumnIndex,
      dateColumnName: headers[dateColumnIndex] || 'N/A',
      rangeStart: rangeStart.toLocaleDateString('zh-TW'),
      rangeEnd: rangeEnd.toLocaleDateString('zh-TW'),
      rangeStartISO: rangeStart.toISOString(),
      rangeEndISO: rangeEnd.toISOString(),
      rangeStartTime: rangeStart.getTime(),
      rangeEndTime: rangeEnd.getTime(),
    };

    console.log(`\n========== 夾異物數據篩選開始 ==========`);
    console.log(`日期欄位: ${headers[dateColumnIndex]} (index: ${dateColumnIndex})`);
    console.log(`日期範圍: ${rangeStart.toLocaleDateString('zh-TW')} ~ ${rangeEnd.toLocaleDateString('zh-TW')}`);
    console.log(`範圍時間戳: ${rangeStart.getTime()} ~ ${rangeEnd.getTime()}`);

    // 掃描所有行
    const MAX_LOG_SAMPLES = 20;
    let logCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const dateStr = String(row[dateColumnIndex] || '').trim();

      if (!dateStr) continue;

      try {
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

        // 記錄樣本
        if (logCount < MAX_LOG_SAMPLES) {
          const isMatched = itemDate && !isNaN(itemDate.getTime()) && (itemDate >= rangeStart && itemDate <= rangeEnd);
          const itemDateObj = itemDate && !isNaN(itemDate.getTime()) ? {
            zh_TW: itemDate.toLocaleDateString('zh-TW'),
            timestamp: itemDate.getTime(),
            iso: itemDate.toISOString()
          } : null;

          console.log(`行 ${i}: "${dateStr}" => ${JSON.stringify(itemDateObj)} | 匹配: ${isMatched ? '✓' : '✗'}`);
          logCount++;
        }

        // 日期比較
        if (itemDate && !isNaN(itemDate.getTime())) {
          const itemTime = itemDate.getTime();
          const inRange = itemTime >= rangeStart.getTime() && itemTime <= rangeEnd.getTime();

          if (inRange) {
            count++;
            matchedDates.push(dateStr);
          }

          // 記錄第一個匹配項
          if (count === 1) {
            console.log(`🎯 首個匹配: 行 ${i}, "${dateStr}", ${itemDate.toLocaleDateString('zh-TW')}`);
          }
        } else {
          if (logCount < MAX_LOG_SAMPLES) {
            console.warn(`⚠️ 行 ${i}: 日期無效 "${dateStr}"`);
          }
        }
      } catch (e) {
        console.error(`❌ 行 ${i} 解析錯誤:`, e.message, dateStr);
      }
    }

    console.log(`\n========== 結果 ==========`);
    console.log(`✅ 匹配筆數: ${count}`);
    console.log(`📊 樣本匹配: ${matchedDates.slice(0, 5).join(', ')}`);
    console.log(`==========================================\n`);

    return NextResponse.json({
      count: count,
      startDate: rangeStart.toLocaleDateString('zh-TW'),
      endDate: rangeEnd.toLocaleDateString('zh-TW'),
      debug: {
        ...debugInfo,
        matchedCount: count,
        sampleMatches: matchedDates.slice(0, 10),
        totalScanned: rows.length - 1,
        successRate: rows.length > 1 ? `${((count / (rows.length - 1)) * 100).toFixed(2)}%` : '0%',
      }
    });
  } catch (err) {
    console.error("夾異物統計 API 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "無法讀取夾異物數據", count: 0 },
      { status: 500 }
    );
  }
}
