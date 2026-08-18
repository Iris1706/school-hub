import { google } from 'googleapis';

function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

async function getSheetId(sheetName) {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
    });

    const sheet = response.data.sheets.find(
      (s) => s.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`找不到分頁: ${sheetName}`);
    }

    return sheet.properties.sheetId;
  } catch (error) {
    console.error('取得 Sheet ID 失敗:', error.message);
    throw error;
  }
}

async function appendLog(logSheetName, logData) {
  const sheets = getSheetsClient();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${logSheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [logData],
      },
    });
  } catch (error) {
    console.error('記錄日誌失敗:', error.message);
    // 不拋出錯誤，只記錄
  }
}

export async function POST(request) {
  try {
    const { sheetName, rowIndex } = await request.json();

    if (!sheetName || rowIndex === undefined) {
      return Response.json(
        { success: false, error: '缺少必要參數: sheetName 或 rowIndex' },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();
    const sheetId = await getSheetId(sheetName);

    // 刪除指定列
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.Repair_SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1, // 轉換為 0-based index
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });

    // 記錄操作日誌
    const logSheetName = sheetName === 'Pawn' ? '操作日誌1' : '操作日誌2';
    const logData = [
      new Date().toLocaleString('zh-TW'),
      '刪除',
      sheetName,
      `列 ${rowIndex}`,
    ];

    await appendLog(logSheetName, logData);

    return Response.json({
      success: true,
      message: `成功刪除 ${sheetName} 的第 ${rowIndex} 列`,
    });
  } catch (error) {
    console.error('API 錯誤:', error.message);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
