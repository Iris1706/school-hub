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

export async function POST(request) {
  try {
    const { sheetName, rowIndex, type } = await request.json();

    if (!sheetName || rowIndex === undefined) {
      return Response.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();

    const googleSheetRowIndex = rowIndex + 3;

    if (type === 'completed') {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!A${googleSheetRowIndex}:H${googleSheetRowIndex}`,
      });
    } else if (type === 'inProgress') {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!J${googleSheetRowIndex}:S${googleSheetRowIndex}`,
      });
    }

    const logsSheetName = sheetName === 'Pawn' ? '操作日誌1' : '操作日誌2';
    const timestamp = new Date().toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
    });

    const logsDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${logsSheetName}!A:A`,
    });

    let logNextRow = 3;
    const logsValues = logsDataResponse.data.values || [];
    for (let i = 2; i < logsValues.length; i++) {
      if (!logsValues[i] || !logsValues[i][0]) {
        logNextRow = i + 1;
        break;
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${logsSheetName}!A${logNextRow}:E${logNextRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: [
          [
            timestamp,
            '刪除',
            `行 ${googleSheetRowIndex}`,
            type === 'completed' ? '已完修' : '處理中',
            '資料已清空',
          ],
        ],
      },
    });

    return Response.json({
      success: true,
      message: '刪除成功',
    });
  } catch (error) {
    console.error('刪除失敗:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
