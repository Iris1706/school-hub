import { google } from 'googleapis';

function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName') || 'Pawn';
    const type = searchParams.get('type') || 'completed';

    const sheets = getSheetsClient();

    if (type === 'completed') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!A3:H`,
      });

      const rows = response.data.values || [];
      return Response.json({
        success: true,
        rows: rows,
      });
    } else if (type === 'inProgress') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.Repair_SHEET_ID,
        range: `${sheetName}!J3:S`,
      });

      const rows = response.data.values || [];
      return Response.json({
        success: true,
        rows: rows,
      });
    }

    return Response.json(
      { success: false, error: '無效的資料類型' },
      { status: 400 }
    );
  } catch (error) {
    console.error('讀取資料錯誤:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
