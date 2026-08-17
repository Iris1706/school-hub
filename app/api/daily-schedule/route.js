import { getSheetsClient, SPREADSHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = getSheetsClient();

    // 讀取行程表資料（B20:M 欄）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'每日行程'!B20:M200", // 讀取行程表
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return Response.json({ data: [] });
    }

    // 欄位對應：B=日期, C=人員, D=區域, E=地點, F=時間, G=事件, H=備註, I=台數, J=提醒
    const headers = rows[0];
    const schedules = rows.slice(1).map((row) => ({
      date: row[0] || "", // B 列：日期
      person: row[1] || "", // C 列：人員
      region: row[2] || "", // D 列：區域
      location: row[3] || "", // E 列：地點
      time: row[4] || "", // F 列：時間
      event: row[5] || "", // G 列：事件
      note: row[6] || "", // H 列：備註
      devices: row[7] || "", // I 列：台數
      reminder: row[8] || "", // J 列：提醒
    }));

    // 過濾當週的行程（根據日期）
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 取週一
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 取週日

    const weekSchedules = schedules.filter((s) => {
      if (!s.date) return false;
      try {
        const scheduleDate = new Date(s.date);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd && s.date.trim() !== "";
      } catch {
        return false;
      }
    });

    return Response.json({
      data: weekSchedules,
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
