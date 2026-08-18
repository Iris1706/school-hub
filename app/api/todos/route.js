import { NextResponse } from "next/server";
import {
  getSheetsClient,
  SPREADSHEET_ID,
  TODO_TAB,
} from "../../../lib/googleSheets";

// GET: return all todos with completed and pending items
export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A1:F1000`,
    });
    const rows = res.data.values || [];
    const headers = rows[0] || [];

    // Map headers to column indices
    const headerIndex = {
      日期: headers.indexOf("日期"),
      學校: headers.indexOf("學校"),
      事件: headers.indexOf("事件"),
      完成日期: headers.indexOf("完成日期"),
      備註: headers.indexOf("備註"),
      狀態: headers.indexOf("狀態"),
    };

    const data = rows.slice(1).map((row, idx) => {
      return {
        __row: idx + 2,
        日期: row[headerIndex.日期] || "",
        學校: row[headerIndex.學校] || "",
        事件: row[headerIndex.事件] || "",
        完成日期: row[headerIndex.完成日期] || "",
        備註: row[headerIndex.備註] || "",
        狀態: row[headerIndex.狀態] || "",
      };
    });

    return NextResponse.json({ headers, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
