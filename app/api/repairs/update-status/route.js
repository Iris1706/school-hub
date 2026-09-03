import { google } from 'googleapis';

const sheets = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function POST(request) {
  try {
    const { sheetName, rowIndex, newStatus } = await request.json();

    console.log('更新狀態請求:', { sheetName, rowIndex, newStatus });

    if (!sheetName || rowIndex === undefined || newStatus === undefined) {
      return Response.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.Recode_SHEET_ID;
    if (!spreadsheetId) {
      return Response.json(
        { success: false, error: '未設定 Google Sheet ID' },
        { status: 500 }
      );
    }

    // K column is the 11th column (A=1, B=2, ..., K=11)
    const cellAddress = `${sheetName}!K${rowIndex}`;

    console.log('更新單元格:', cellAddress, '值:', newStatus);

    const authClient = await auth.getClient();

    // Update the cell value
    const updateResponse = await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId,
      range: cellAddress,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newStatus]],
      },
    });

    console.log('Google Sheets 更新結果:', updateResponse.data);

    return Response.json({
      success: true,
      message: '狀態已更新',
      updatedCell: cellAddress,
      newValue: newStatus,
    });
  } catch (error) {
    console.error('更新狀態錯誤:', error);
    return Response.json(
      {
        success: false,
        error: error.message || '更新失敗',
      },
      { status: 500 }
    );
  }
}
