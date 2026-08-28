import { NextResponse } from "next/server";
import {
  getSheetsClient,
  SPREADSHEET_ID,
  TODO_TAB,
  columnLetter,
} from "../../../lib/googleSheets";

// Google Sheets 實際欄位映射（A:J）
const FIELD_NAMES = [
  "優先級",
  "日期",
  "學校",
  "事件",
  "聯絡人",
  "電話",
  "郵件",
  "進度",
  "備註",
  "完成",
];

// GET: 獲取所有待辦事項（無上限）
export async function GET() {
  try {
    const sheets = getSheetsClient();
    // 讀取整個表格
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A:Z`,
    });
    const rows = res.data.values || [];
    const headers = rows[0] || [];

    console.log("Google Sheets 表頭:", headers);

    // 建立表頭 → 欄位索引的映射
    const headerIndex = {};
    headers.forEach((headerName, idx) => {
      headerIndex[headerName] = idx;
    });
    console.log("表頭映射:", headerIndex);

    // 解析資料行（過濾掉空行，保留正確的行號）
    const data = rows.slice(1).map((row, originalIdx) => {
      // 檢查是否為空行
      if (!row || !row.some(cell => cell?.trim())) {
        return null;
      }

      const rowNumber = originalIdx + 2; // 原始行號（Google Sheets 中的列號）

      const item = {
        __row: rowNumber,
        優先級: row[headerIndex.優先級] || "",
        日期: row[headerIndex.日期] || "",
        學校: row[headerIndex.學校] || "",
        事件: row[headerIndex.事件] || "",
        聯絡人: row[headerIndex.聯絡人] || "",
        電話: row[headerIndex.電話] || "",
        郵件: row[headerIndex.郵件] || "",
        進度: row[headerIndex.進度] || "",
        備註: row[headerIndex.備註] || "",
        完成: row[headerIndex.完成] || "",
      };

      console.log(`第 ${rowNumber} 列 - 優先級:"${item.優先級}", 日期:"${item.日期}", 事件:"${item.事件}"...`);
      return item;
    }).filter(item => item !== null);

    console.log("解析後的第一筆資料:", data[0]);

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

    // 先讀取表頭以確定欄位順序
    const headersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!1:1`,
    });
    const headers = headersRes.data.values?.[0] || [];

    // 構建新行資料（按照 Google Sheets 的欄位順序）
    const newRow = headers.map(headerName => {
      switch (headerName) {
        case "優先級": return body.優先級 || "";
        case "日期": return body.日期 || "";
        case "學校": return body.學校 || "";
        case "事件": return body.事件 || "";
        case "聯絡人": return body.聯絡人 || "";
        case "電話": return body.電話 || "";
        case "郵件": return body.郵件 || "";
        case "進度": return body.進度 || "";
        case "備註": return body.備註 || "";
        case "完成": return body.完成 || "";
        default: return "";
      }
    });

    console.log("新增資料:", newRow);

    // 使用 append 方法自動新增到最後
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!A:Z`,
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
    console.log("PUT 收到資料:", body);

    const sheets = getSheetsClient();
    const { __row, ...data } = body;

    if (!__row) {
      console.error("缺少 __row，收到的資料:", body);
      return NextResponse.json(
        { error: "缺少 __row 資訊" },
        { status: 400 }
      );
    }

    console.log(`更新第 ${__row} 列，資料:`, data);

    // 先讀取表頭以確定欄位順序
    const headersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!1:1`,
    });
    const headers = headersRes.data.values?.[0] || [];

    // 構建更新資料（按照 Google Sheets 的欄位順序）
    const updateRow = headers.map(headerName => {
      switch (headerName) {
        case "優先級": return data.優先級 || "";
        case "日期": return data.日期 || "";
        case "學校": return data.學校 || "";
        case "事件": return data.事件 || "";
        case "聯絡人": return data.聯絡人 || "";
        case "電話": return data.電話 || "";
        case "郵件": return data.郵件 || "";
        case "進度": return data.進度 || "";
        case "備註": return data.備註 || "";
        case "完成": return data.完成 || "";
        default: return "";
      }
    });

    console.log("要寫入的行資料:", updateRow);

    // 計算範圍（A到最後一個有表頭的欄位）
    const lastColumn = String.fromCharCode(64 + headers.length); // A=65, B=66, ...
    const range = `'${TODO_TAB}'!A${__row}:${lastColumn}${__row}`;
    console.log("更新範圍:", range);

    // 更新行
    const updateResult = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: [updateRow],
      },
    });

    console.log("Google Sheets 更新成功:", updateResult.data);

    return NextResponse.json({
      success: true,
      message: "待辦事項已更新",
      updatedRow: __row,
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

    // 先讀取表頭以確定欄位個數
    const headersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TODO_TAB}'!1:1`,
    });
    const headers = headersRes.data.values?.[0] || [];

    // 刪除行（實際上是清空該行的所有欄位）
    const lastColumn = String.fromCharCode(64 + headers.length);
    const range = `'${TODO_TAB}'!A${__row}:${lastColumn}${__row}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: [Array(headers.length).fill("")],
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
