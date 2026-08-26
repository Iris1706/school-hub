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
    const googleSheetRowIndex = rowIndex + 3; // 轉換為實際行號

    // 讀取「處理中」的資料
    const inProgressRange = `${sheetName}!J${googleSheetRowIndex}:S${googleSheetRowIndex}`;
    const inProgressResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: inProgressRange,
    });

    const inProgressRow = (inProgressResponse.data.values || [])[0];
    if (!inProgressRow) {
      throw new Error('找不到該筆資料');
    }

    // 準備完修後的資料
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

    // 找到「已完修」的下一個空行
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

    // 新增資料到「已完修」
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!A${nextEmptyRow}:H${nextEmptyRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: [completedRow],
      },
    });

    // 實現「資料往上遞補」：將「處理中」該行以下的所有資料往上移一行
    const inProgressAllResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!J3:S`,
    });

    const allInProgressRows = inProgressAllResponse.data.values || [];
    const currentRowIndexInArray = googleSheetRowIndex - 3; // 轉換為陣列索引

    if (currentRowIndexInArray < allInProgressRows.length) {
      // 將該行以下的所有資料往上移一行
      const rowsToMove = allInProgressRows.slice(currentRowIndexInArray + 1);

      // 更新從當前行開始的資料（將下面的資料往上移）
      const updates = [];
      for (let i = 0; i < rowsToMove.length; i++) {
        const targetRow = googleSheetRowIndex + i;
        updates.push({
          range: `${sheetName}!J${targetRow}:S${targetRow}`,
          values: [rowsToMove[i]],
        });
      }

      // 清除最後一行
      const lastRowToClean = googleSheetRowIndex + rowsToMove.length;
      updates.push({
        range: `${sheetName}!J${lastRowToClean}:S${lastRowToClean}`,
        values: [Array(10).fill('')], // 清除10個欄位（J到S）
      });

      // 批量執行更新
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
      // 如果該行是最後一行或下面沒有資料，直接清除該行
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: inProgressRange,
      });
    }

    // 記錄操作日誌
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
