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

    // 讀取完整排班表（A5:AG13）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SCHEDULE_SHEET_ID,
      range: `'${sheetName}'!A5:AG13`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return Response.json({ data: [] });
    }

    // 第一行是日期和其他信息
    const headers = rows[0];

    // 解析員工排班數據
    const employees = [];
    for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      if (!row || row.length === 0) continue;

      const employeeId = row[0] || ""; // A列：員工編號
      const employeeName = row[1] || ""; // B列：姓名

      if (!employeeId || !employeeName) continue;

      // C列開始是每天的狀態（日期1-31）
      const dailyStatus = row.slice(2); // 從第3個元素開始（C列）

      employees.push({
        employeeId,
        employeeName,
        dailyStatus, // 31天的狀態
      });
    }

    // 日期數組（1-31）
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);

    return Response.json({
      data: employees,
      dates,
      month,
      year,
    });
  } catch (error) {
    console.error("讀取員工狀態失敗：", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
