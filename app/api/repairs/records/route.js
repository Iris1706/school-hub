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
    const sheetId = searchParams.get('sheetId') || '1748221178'; // 總表的 gid

    const sheets = getSheetsClient();

    // 讀取資料（避免開放式範圍的問題，使用具體行數）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `'總表'!A1:P1000`,
    });

    const allData = response.data.values || [];

    if (allData.length < 1) {
      return Response.json({
        success: true,
        headers: [],
        records: [],
      });
    }

    // 提取標題（第1行）
    const headerRow = allData[0];

    // 建立標題對應（A到K及O到P）
    const headers = [
      ...(headerRow.slice(0, 11) || []), // A1:K1 (0-10)
      ...(headerRow.slice(14, 16) || []) // O1:P1 (14-15)
    ];

    // 提取資料行（從第2行開始，過濾空行）
    const records = allData.slice(1)
      .filter(row => row && row[0] && (typeof row[0] !== 'string' || row[0].trim()))
      .map((row, index) => {
        // 組合 A:K 及 O:P 的資料
        const recordData = [
          ...(row.slice(0, 11) || []), // A:K
          ...(row.slice(14, 16) || []) // O:P
        ];

        return {
          rowIndex: index + 2, // 原始行號（從1開始，資料從第2行）
          values: recordData,
        };
      });

    return Response.json({
      success: true,
      headers: headers,
      records: records,
    });
  } catch (error) {
    console.error('讀取報修紀錄錯誤:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
