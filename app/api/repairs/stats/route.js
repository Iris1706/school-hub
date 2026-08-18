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

    const completedResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!A3:H`,
    });

    const inProgressResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!J3:S`,
    });

    const completedData = completedResponse.data.values || [];
    const inProgressData = inProgressResponse.data.values || [];

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

    completedData.forEach((row) => {
      if (!row[0] || !row[7]) return;

      try {
        const createdDate = new Date(row[0]);
        const completedDate = new Date(row[7]);

        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
          thisMonthCompleted++;
          monthCompletedCount++;

          const daysToRepair = Math.ceil((completedDate - createdDate) / (1000 * 60 * 60 * 24));
          totalDaysForMonth += daysToRepair;
        }

        if (createdDate >= weekStart && createdDate <= now) {
          thisWeekCompleted++;
        }

        const school = row[2];
        if (school) {
          schoolStats[school] = (schoolStats[school] || 0) + 1;
        }

        const category = row[3];
        if (category) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        }
      } catch (e) {
        // 日期解析失敗
      }
    });

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
