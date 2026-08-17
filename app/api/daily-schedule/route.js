import { getSheetsClient } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    const sheets = getSheetsClient();

    // 行程表的 Google Sheet ID
    const SCHEDULE_SHEET_ID = "1QnrYP7dDl12oMyD613Sm5cccZDjqeOwj3ho9bZSTsfs";

    // 從查詢參數或使用當前月份
    const url = new URL(request.url);
    let year = parseInt(url.searchParams.get("year"));
    let month = parseInt(url.searchParams.get("month"));

    if (!year || !month) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const sheetName = `${year}/${month}`;

    // 先讀取員編-姓名映射表（A5:B13）
    const employeeMapRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SCHEDULE_SHEET_ID,
      range: `'${sheetName}'!A5:B13`,
    });

    const employeeMapRows = employeeMapRes.data.values || [];
    const employeeMap = {}; // 姓名 -> 員編
    employeeMapRows.forEach((row) => {
      if (row[0] && row[1]) {
        employeeMap[row[1].trim()] = row[0]; // row[1]=姓名, row[0]=員編
      }
    });

    // 讀取行程表資料（B20:M 欄）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SCHEDULE_SHEET_ID,
      range: `'${sheetName}'!B20:M200`, // 讀取當月的行程表
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return Response.json({ data: [] });
    }

    // 欄位對應：B=日期, C=人員, D=區域, E=地點, F=時間, G=事件, H=備註, I=台數, J=提醒
    const headers = rows[0];
    const schedules = rows.slice(1).map((row) => {
      const personName = row[1] || "";
      return {
        date: row[0] || "", // B 列：日期
        employeeId: employeeMap[personName.trim()] || "", // 根據姓名查找員編
        person: personName, // C 列：人員
        region: row[2] || "", // D 列：區域
        location: row[3] || "", // E 列：地點
        time: row[4] || "", // F 列：時間
        event: row[5] || "", // G 列：事件
        note: row[6] || "", // H 列：備註
        devices: row[7] || "", // I 列：台數
        reminder: row[8] || "", // J 列：提醒
      };
    });

    // 返回所有行程（不再限制於當週）
    const allSchedules = schedules.filter((s) => {
      if (!s.date) return false;
      try {
        return s.date.trim() !== "";
      } catch {
        return false;
      }
    });

    // 計算當週日期供參考
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return Response.json({
      data: allSchedules,
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("讀取行程表失敗：", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
