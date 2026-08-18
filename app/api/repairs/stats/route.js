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

    const sheets = getSheetsClient();

    // 讀取已完修資料 (A2:H)
    const completedResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!A2:H`,
    });

    // 讀取處理中資料 (J2:P)
    const inProgressResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!J2:P`,
    });

    const completedData = completedResponse.data.values || [];
    const inProgressData = inProgressResponse.data.values || [];

    // 計算統計資料
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    let thisMonthCompleted = 0;
    let thisWeekCompleted = 0;
    let totalDaysForMonth = 0;
    let monthCompletedCount = 0;

    const schoolStats = {};
    const categoryStats = {};

    // 分析已完修資料
    // 格式：建單日期、維修單號、學校名稱、問題分類、機器舊序號、機器新序號、狀態、完成日期
    completedData.forEach((row) => {
      if (!row[0] || !row[7]) return; // 需要有建單日期和完成日期

      try {
        const createdDate = new Date(row[0]);
        const completedDate = new Date(row[7]);

        // 檢查是否在本月
        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
          thisMonthCompleted++;
          monthCompletedCount++;

          // 計算維修天數
          const daysToRepair = Math.ceil((completedDate - createdDate) / (1000 * 60 * 60 * 24));
          totalDaysForMonth += daysToRepair;
        }

        // 檢查是否在本週
        if (createdDate >= weekStart && createdDate <= now) {
          thisWeekCompleted++;
        }

        // 統計學校
        const school = row[2];
        if (school) {
          schoolStats[school] = (schoolStats[school] || 0) + 1;
        }

        // 統計問題分類
        const category = row[3];
        if (category) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        }
      } catch (e) {
        // 日期解析失敗，跳過此列
      }
    });

    // 處理中資料
    // 格式：建單日期、維修單號、學校名稱、問題分類、機器舊序號、進度、完修日期、綁定ASM帳號、ASM取消指派、PreStage註冊
    inProgressData.forEach((row) => {
      const school = row[2];
      if (school) {
        schoolStats[school] = (schoolStats[school] || 0) + 1;
      }

      const category = row[3];
      if (category) {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
    });

    const averageRepairDays =
      monthCompletedCount > 0 ? Math.round(totalDaysForMonth / monthCompletedCount) : 0;

    // 排序並取前 5 名
    const topSchools = Object.entries(schoolStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return Response.json({
      success: true,
      stats: {
        thisMonthCompleted,
        thisWeekCompleted,
        averageRepairDays,
        completedCount: completedData.length,
        inProgressCount: inProgressData.length,
        topSchools: topSchools.map(([name, count]) => ({ name, count })),
        topCategories: topCategories.map(([name, count]) => ({ name, count })),
      },
    });
  } catch (error) {
    console.error('計算統計資料失敗:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
