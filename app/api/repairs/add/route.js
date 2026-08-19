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
    const { sheetName, values, type } = await request.json();

    if (!sheetName || !values || !type) {
      return Response.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();

    if (type === 'inProgress') {
      // 找到下一個空行
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!J:J`,
      });

      let nextRow = 3;
      const columnValues = response.data.values || [];
      for (let i = 2; i < columnValues.length; i++) {
        if (!columnValues[i] || !columnValues[i][0]) {
          nextRow = i + 1;
          break;
        }
      }

      // 新增數據到找到的空行
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!J${nextRow}:S${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      // 紀錄操作日誌
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
              '新增',
              values[1] || '',
              values[2] || '',
              '新增維修記錄',
            ],
          ],
        },
      });
    }

    return Response.json({
      success: true,
      message: '新增成功',
    });
  } catch (error) {
    console.error('新增失敗:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
