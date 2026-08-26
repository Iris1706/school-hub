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

    if (type === 'completed') {
      // 「已完修」資料往上遞補
      const completedAllResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!A3:H`,
      });

      const allCompletedRows = completedAllResponse.data.values || [];
      const currentRowIndexInArray = rowIndex - 3;

      if (currentRowIndexInArray < allCompletedRows.length) {
        const rowsToMove = allCompletedRows.slice(currentRowIndexInArray + 1);

        const updates = [];
        for (let i = 0; i < rowsToMove.length; i++) {
          const targetRow = rowIndex + i;
          updates.push({
            range: `${sheetName}!A${targetRow}:H${targetRow}`,
            values: [rowsToMove[i]],
          });
        }

        const lastRowToClean = rowIndex + rowsToMove.length;
        updates.push({
          range: `${sheetName}!A${lastRowToClean}:H${lastRowToClean}`,
          values: [Array(8).fill('')],
        });

        if (updates.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: process.env.Repair_SHEET_ID,
            resource: {
              data: updates,
              valueInputOption: 'RAW',
            },
          });
        }
      } else {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: process.env.Repair_SHEET_ID,
          range: `${sheetName}!A${rowIndex}:H${rowIndex}`,
        });
      }
    } else if (type === 'inProgress') {
      // 「處理中」資料往上遞補
      const inProgressAllResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!J3:S`,
      });

      const allInProgressRows = inProgressAllResponse.data.values || [];
      const currentRowIndexInArray = rowIndex - 3;

      if (currentRowIndexInArray < allInProgressRows.length) {
        const rowsToMove = allInProgressRows.slice(currentRowIndexInArray + 1);

        const updates = [];
        for (let i = 0; i < rowsToMove.length; i++) {
          const targetRow = rowIndex + i;
          updates.push({
            range: `${sheetName}!J${targetRow}:S${targetRow}`,
            values: [rowsToMove[i]],
          });
        }

        const lastRowToClean = rowIndex + rowsToMove.length;
        updates.push({
          range: `${sheetName}!J${lastRowToClean}:S${lastRowToClean}`,
          values: [Array(10).fill('')],
        });

        if (updates.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: process.env.Repair_SHEET_ID,
            resource: {
              data: updates,
              valueInputOption: 'RAW',
            },
          });
        }
      } else {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: process.env.Repair_SHEET_ID,
          range: `${sheetName}!J${rowIndex}:S${rowIndex}`,
        });
      }
    }

    // 記錄操作日誌
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
            `行 ${rowIndex}`,
            type === 'completed' ? '已完修' : '處理中',
            '資料已刪除並往上遞補',
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
