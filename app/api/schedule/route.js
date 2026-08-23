import { getSheetsClient } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sheets = getSheetsClient();

    const SCHEDULE_SHEET_ID = "1QnrYP7dDl12oMyD613Sm5cccZDjqeOwj3ho9bZSTsfs";

    const url = new URL(request.url);
    let year = parseInt(url.searchParams.get("year"));
    let month = parseInt(url.searchParams.get("month"));

    if (!year || !month) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const sheetName = `${year}/${month}`;
    console.log(`讀取班表資料：${sheetName}`);

    // 1. 讀取日期行（C5:AG5）
    let dateRowRes;
    try {
      dateRowRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SCHEDULE_SHEET_ID,
        range: `'${sheetName}'!C5:AG5`,
      });
    } catch (error) {
      if (error.message && error.message.includes("Unable to parse range")) {
        console.warn(`分頁不存在：${sheetName}`);
        return Response.json({ data: [] });
      }
      throw error;
    }

    const dateRow = dateRowRes.data.values?.[0] || [];
    if (dateRow.length === 0) {
      console.warn(`未找到日期資料：${sheetName}`);
      return Response.json({ data: [] });
    }

    // 2. 讀取員工編號（A6:A13）
    let personCodeRes;
    try {
      personCodeRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SCHEDULE_SHEET_ID,
        range: `'${sheetName}'!A6:A13`,
      });
    } catch (error) {
      personCodeRes = { data: { values: [] } };
    }

    const personCodes = personCodeRes.data.values?.map(row => String(row[0] || "").trim()).filter(p => p) || [];

    // 3. 讀取班表狀態（C6:AG13）
    let bandScheduleRes;
    try {
      bandScheduleRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SCHEDULE_SHEET_ID,
        range: `'${sheetName}'!C6:AG13`,
      });
    } catch (error) {
      bandScheduleRes = { data: { values: [] } };
    }

    const scheduleRows = bandScheduleRes.data.values || [];

    // 4. 組合班表資料
    const bandSchedules = [];

    scheduleRows.forEach((row, rowIdx) => {
      const personCode = personCodes[rowIdx];
      if (!personCode) return;

      row.forEach((status, colIdx) => {
        if (!status || String(status).trim() === "") return;

        const dateStr = dateRow[colIdx]?.trim() || "";
        if (!dateStr) return;

        bandSchedules.push({
          person: personCode,
          date: dateStr,
          status: String(status).trim(),
        });
      });
    });

    console.log(`成功讀取班表資料：${bandSchedules.length} 筆`);

    return Response.json({
      data: bandSchedules,
      count: bandSchedules.length,
    });

  } catch (error) {
    console.error("讀取班表失敗：", error);
    return Response.json(
      { error: "讀取班表失敗：" + error.message },
      { status: 500 }
    );
  }
}
