import { getSheetsClient } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const VERIFICATION_SHEET_ID = "102pIS7m3xKv73cPj-mBzbN0iE0jNlpR93vdYGevdwk4";

    // 讀取驗證碼表資料（A1:C 欄）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: VERIFICATION_SHEET_ID,
      range: "工作表1!A1:C1000",
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return Response.json({ data: [] });
    }

    // 第一行是標題
    const headers = rows[0]; // 假設是：收到時間、手機末2碼、驗證碼

    // 讀取資料（倒序排列，最新的在前）
    const data = rows.slice(1).map((row) => ({
      time: row[0] || "",
      phone: row[1] || "",
      code: row[2] || "",
    }));

    // 倒序排列並取最新三個
    const latest = data.reverse().slice(0, 3);

    return Response.json({
      data: latest,
    });
  } catch (error) {
    console.error("讀取驗證碼失敗：", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
