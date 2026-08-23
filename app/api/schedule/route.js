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

    let bandScheduleRes;
    try {
      bandScheduleRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SCHEDULE_SHEET_ID,
        range: `'${sheetName}'!A3:AG14`,
      });
    } catch (error) {
      if (error.message && error.message.includes("Unable to parse range")) {
        console.warn(`分頁不存在：${sheetName}`);
        return Response.json({ data: [] });
      }
      throw error;
    }

    const rows = bandScheduleRes.data.values || [];
    if (rows.length === 0) {
      console.warn(`未找到班表資料：${sheetName}`);
      return Response.json({ data: [] });
    }

    let dateRowRes;
    try {
      dateRowRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SCHEDULE_SHEET_ID,
        range: `'${sheetName}'!A2:AG2`,
      });
    } catch (error) {
      dateRowRes = { data: { values: [] } };
    }

    const dateRow = dateRowRes.data.values?.[0] || [];

    const bandSchedules = [];

    rows.forEach((row, rowIdx) => {
      const personCode = String(row[0] || "").trim();
      if (!personCode) return;

      row.forEach((status, colIdx) => {
        if (colIdx === 0) return;
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
    if (error.message && error.message.includes("Unable to parse range")) {
      return Response.json({ data: [] });
    }
    return Response.json(
      { error: "讀取班表失敗：" + error.message },
      { status: 500 }
    );
  }
}
