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
  }
}

export async function POST(request) {
  try {
    const { sheetName, rowIndex, values, type } = await request.json();

    if (!sheetName || rowIndex === undefined || !values || !type) {
      return Response.json(
        {
          success: false,
          error: '缺少必要參數: sheetName、rowIndex、values 或 type',
        },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();

    const startColumn = type === 'completed' ? 'A' : 'J';
    const endColumn = type === 'completed' ? 'H' : 'P';
    const range = `${sheetName}!${startColumn}${rowIndex}:${endColumn}${rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    const logSheetName = sheetName === 'Pawn' ? '操作日誌1' : '操作日誌2';
    const logData = [
      new Date().toLocaleString('zh-TW'),
      '更新',
      sheetName,
      `列 ${rowIndex}`,
      values.join(' | '),
    ];

    await appendLog(logSheetName, logData);

    return Response.json({
      success: true,
      message: `成功更新 ${sheetName} 的第 ${rowIndex} 列`,
    });
  } catch (error) {
    console.error('API 錯誤:', error.message);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
