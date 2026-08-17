import { getSheetsClient } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const SCHEDULE_SHEET_ID = "1QnrYP7dDl12oMyD613Sm5cccZDjqeOwj3ho9bZSTsfs";

    // 根據當前月份動態構造 Sheet 名稱
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const sheetName = `${year}/${month}`;

    // 讀取員工狀態表（A6:AG13 欄）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SCHEDULE_SHEET_ID,
      range: `'${sheetName}'!A6:AG13`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return Response.json({ data: [] });
    }

    // 取得當週日期
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // 從表頭(第一行)取得日期，對應到當週
    const headers = rows[0];
    let weekDayIndices = [];

    // 查找當週五個工作日(一到五)在表中的欄位位置
    for (let i = 1; i < headers.length && weekDayIndices.length < 5; i++) {
      try {
        const dateStr = headers[i];
        if (!dateStr) continue;

        const scheduleDate = new Date(dateStr);
        const dayOfWeek = scheduleDate.getDay();

        // 只包含一到五(工作日)
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && scheduleDate >= weekStart && scheduleDate <= weekEnd) {
          weekDayIndices.push({ colIndex: i, date: dateStr, dayOfWeek });
        }
      } catch {
        continue;
      }
    }

    // 排序以確保順序正確
    weekDayIndices.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    // 解析員工狀態
    const employees = [];
    for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const employeeName = row[0];

      if (!employeeName || employeeName.trim() === "") continue;

      const statusByDay = [];
      for (const { colIndex } of weekDayIndices) {
        const status = row[colIndex] || "";
        statusByDay.push(status);
      }

      employees.push({
        name: employeeName,
        status: statusByDay,
      });
    }

    const dayLabels = ["一", "二", "三", "四", "五"];

    return Response.json({
      data: employees,
      dayLabels,
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("讀取員工狀態失敗：", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
