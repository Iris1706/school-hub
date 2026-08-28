import { NextResponse } from "next/server";
import {
  getSheetsClient,
  SPREADSHEET_ID,
  TODO_TAB,
  columnLetter,
} from "../../../lib/googleSheets";

// 新欄位映射
const FIELD_NAMES = [
  "日期",
  "學校",
  "事件",
  "聯絡人",
  "電話",
  "郵件",
  "進度",
  "備註",
  "優先級",
];

// GET: 獲取所有待辦事項（無上限）
export async function GET() {
  try {
    const sheets = getSheetsClient();
    // 移除行數限制，讀取整個表格
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A:J`,
    });
    const rows = res.data.values || [];
    const headers = rows[0] || [];

    // 建立欄位索引映射
    const headerIndex = {};
    FIELD_NAMES.forEach((field) => {
      headerIndex[field] = headers.indexOf(field);
    });

    // 解析資料行（過濾掉空行）
    const data = rows.slice(1)
      .filter(row => row && row.some(cell => cell?.trim()))
      .map((row, idx) => {
        // 相容舊資料：如果找不到新的進度欄位，檢查是否有舊的完成欄位
        let progress = row[headerIndex.進度] || "";
        // 如果進度欄位為空，檢查第10列是否有舊的完成狀態
        if (!progress && row[9] === 'true') {
          progress = '完成';
        }

        return {
          __row: idx + 2,
          日期: row[headerIndex.日期] || "",
          學校: row[headerIndex.學校] || "",
          事件: row[headerIndex.事件] || "",
          聯絡人: row[headerIndex.聯絡人] || "",
          電話: row[headerIndex.電話] || "",
          郵件: row[headerIndex.郵件] || "",
          進度: progress,
          備註: row[headerIndex.備註] || "",
          優先級: row[headerIndex.優先級] || "",
        };
      });

    return NextResponse.json({ headers, data });
  } catch (err) {
    console.error("GET /api/todos error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: 新增待辦事項（無上限）
export async function POST(req) {
  try {
    const body = await req.json();
    const sheets = getSheetsClient();

    // 構建新行資料
    const newRow = [
      body.日期 || "",
      body.學校 || "",
      body.事件 || "",
      body.聯絡人 || "",
      body.電話 || "",
      body.郵件 || "",
      body.進度 || "",
      body.備註 || "",
      body.優先級 || "",
    ];

    // 使用 append 方法自動新增到最後（推薦方法）
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A:J`,
      valueInputOption: "RAW",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({
      success: true,
      message: "待辦事項已新增",
    });
  } catch (err) {
    console.error("POST /api/todos error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: 更新待辦事項
export async function PUT(req) {
  try {
    const body = await req.json();
    const sheets = getSheetsClient();
    const { __row, ...data } = body;

    if (!__row) {
      return NextResponse.json(
        { error: "缺少 __row 資訊" },
        { status: 400 }
      );
    }

    // 構建更新資料
    const updateRow = [
      data.日期 || "",
      data.學校 || "",
      data.事件 || "",
      data.聯絡人 || "",
      data.電話 || "",
      data.郵件 || "",
      data.進度 || "",
      data.備註 || "",
      data.優先級 || "",
    ];

    // 更新行
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A${__row}:I${__row}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [updateRow],
      },
    });

    return NextResponse.json({
      success: true,
      message: "待辦事項已更新",
    });
  } catch (err) {
    console.error("PUT /api/todos error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: 刪除待辦事項
export async function DELETE(req) {
  try {
    const body = await req.json();
    const sheets = getSheetsClient();
    const { __row } = body;

    if (!__row) {
      return NextResponse.json(
        { error: "缺少 __row 資訊" },
        { status: 400 }
      );
    }

    // 刪除行（實際上是清空該行）
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A${__row}:I${__row}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [Array(9).fill("")],
      },
    });

    return NextResponse.json({
      success: true,
      message: "待辦事項已刪除",
    });
  } catch (err) {
    console.error("DELETE /api/todos error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
