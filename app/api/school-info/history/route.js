import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, HISTORY_TAB } from "../../../../lib/googleSheets";

// GET /api/school-info/history?code=SUN042
export async function GET(request) {
  try {
    const code = new URL(request.url).searchParams.get("code");
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HISTORY_TAB}!A:E`,
    });
    const rows = res.data.values || [];
    const entries = rows
      .filter((r) => r[1] === code)
      .map((r) => ({ time: r[0], schoolCode: r[1], field: r[2], oldValue: r[3], newValue: r[4] }))
      .reverse();
    return NextResponse.json(entries);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
