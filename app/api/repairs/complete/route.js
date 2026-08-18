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
    const { sheetName, rowIndex, completeData } = await request.json();

    if (!sheetName || !rowIndex || !completeData) {
      return Response.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();

    const inProgressRange = `${sheetName}!J${rowIndex}:S${rowIndex}`;
    const inProgressResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: inProgressRange,
    });

    const inProgressRow = (inProgressResponse.data.values || [])[0];
    if (!inProgressRow) {
      throw new Error('找不到該筆資料');
    }

    const completedRow = [
      inProgressRow[0] || '',
      inProgressRow[1] || '',
      inProgressRow[2] || '',
      inProgressRow[3] || '',
      inProgressRow[4] || '',
      completeData.newSerialNumber,
      completeData.status,
      completeData.completionDate,
    ];

    const completedDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!A3:A`,
    });

    let nextEmptyRow = 3;
    const completedValues = completedDataResponse.data.values || [];
    for (let i = 0; i < completedValues.length; i++) {
      if (!completedValues[i] || !completedValues[i][0]) {
        nextEmptyRow = 3 + i;
        break;
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!A${nextEmptyRow}:H${nextEmptyRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: [completedRow],
      },
    });

    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: inProgressRange,
    });

    const logsSheetName = sheetName === 'Pawn' ? '操作日誌1' : '操作日誌2';
    const timestamp = new Date().toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
    });

    const logsDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${logsSheetName}!A3:A`,
    });

    let logNextRow = 3;
    const logsValues = logsDataResponse.data.values || [];
    for (let i = 0; i < logsValues.length; i++) {
      if (!logsValues[i] || !logsValues[i][0]) {
        logNextRow = 3 + i;
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
            '完修',
            inProgressRow[1] || '',
            inProgressRow[2] || '',
            `機器序號: ${inProgressRow[4] || ''} → ${completeData.newSerialNumber}`,
          ],
        ],
      },
    });

    return Response.json({
      success: true,
      message: '完修成功',
      completedRow: nextEmptyRow,
    });
  } catch (error) {
    console.error('完修失敗:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
