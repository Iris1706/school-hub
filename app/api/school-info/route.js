import { NextResponse } from "next/server";
import {
  getSheetsClient,
  SPREADSHEET_ID,
  SCHOOL_INFO_TAB,
  HISTORY_TAB,
  columnLetter,
} from "../../../lib/googleSheets";

// GET: return every school as an object keyed by the sheet's header row,
// plus __row so the client knows which sheet row to update later.
export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SCHOOL_INFO_TAB}'!A1:Z1000`,
    });
    const rows = res.data.values || [];
    const headers = rows[0] || [];
    const data = rows.slice(1).map((row, idx) => {
      const obj = { __row: idx + 2 };
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
    return NextResponse.json({ headers, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST body: { row: number, updates: { [header]: newValue } }
// Reads the current row, writes only the changed cells back, and appends
// one row per changed field to the 修改歷程 tab (time / school code / field / old / new).
export async function POST(request) {
  try {
    const { row, updates } = await request.json();
    if (!row || !updates) {
      return NextResponse.json({ error: "缺少 row 或 updates" }, { status: 400 });
    }

    const sheets = getSheetsClient();

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SCHOOL_INFO_TAB}'!A1:Z1`,
    });
    const headers = headerRes.data.values[0] || [];

    const currentRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SCHOOL_INFO_TAB}'!A${row}:Z${row}`,
    });
    const currentValues = currentRes.data.values ? currentRes.data.values[0] : [];
    const schoolCodeIndex = headers.indexOf("學校代碼");
    const schoolCode = schoolCodeIndex >= 0 ? currentValues[schoolCodeIndex] || "" : "";

    const historyRows = [];
    const dataUpdates = [];

    Object.entries(updates).forEach(([header, newValue]) => {
      const colIndex = headers.indexOf(header);
      if (colIndex === -1) return;
      const oldValue = currentValues[colIndex] || "";
      if (oldValue === newValue) return;

      dataUpdates.push({
        range: `'${SCHOOL_INFO_TAB}'!${columnLetter(colIndex)}${row}`,
        values: [[newValue]],
      });
      historyRows.push([
        new Date().toISOString(),
        schoolCode,
        header,
        oldValue,
        newValue,
      ]);
    });

    if (dataUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: "RAW", data: dataUpdates },
      });
    }

    if (historyRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${HISTORY_TAB}'!A:E`,
        valueInputOption: "RAW",
        requestBody: { values: historyRows },
      });
    }

    return NextResponse.json({ ok: true, changed: historyRows.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
