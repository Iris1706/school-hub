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

function getWorkDays(startDate, endDate) {
  let workDays = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 1-5 是週一到週五（工作天）
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workDays;
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

    // 計算本週開始日期（週一），設定為當天午夜
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 調整為週一開始
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    // 計算本週結束日期（週日）
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 週一加 6 天 = 週日
    weekEnd.setHours(23, 59, 59, 999);

    let thisMonthCompleted = 0;
    let thisWeekCompleted = 0;
    let totalDaysForMonth = 0;
    let monthCompletedCount = 0;
    let totalDaysForWeek = 0;
    let weekCompletedCount = 0;
    let totalDaysForAll = 0;
    let allCompletedCount = 0;

    const schoolStats = {};
    const categoryStats = {};

    completedData.forEach((row) => {
      // 過濾掉空行（檢查第一個和第七個欄位）
      if (!row || !row[0] || (typeof row[0] === 'string' && !row[0].trim()) || !row[7]) return;

      try {
        const createdDate = new Date(row[0]);
        const completedDate = new Date(row[7]);

        // 驗證日期是否有效
        if (isNaN(createdDate.getTime()) || isNaN(completedDate.getTime())) return;

        // 標準化 completedDate 為當天的午夜，便於比較
        const completedDateNormalized = new Date(completedDate);
        completedDateNormalized.setHours(0, 0, 0, 0);

        // 計算工作天數（只算週一～週五）
        const daysToRepair = getWorkDays(createdDate, completedDate);

        // 只計算正數天數（完成日期 >= 建單日期）
        if (daysToRepair > 0) {
          allCompletedCount++;
          totalDaysForAll += daysToRepair;
        }

        // 根據完成日期計算本月完修
        if (completedDateNormalized.getMonth() === currentMonth && completedDateNormalized.getFullYear() === currentYear) {
          thisMonthCompleted++;
          monthCompletedCount++;
          totalDaysForMonth += daysToRepair;
        }

        // 根據完成日期檢查是否在本週內（週一到週日）
        // weekStart 是本週一的午夜，weekEnd 是本週日的午夜
        if (completedDateNormalized >= weekStart && completedDateNormalized <= weekEnd) {
          thisWeekCompleted++;
          weekCompletedCount++;
          totalDaysForWeek += daysToRepair;
        }

        const school = row[2];
        if (school && (typeof school !== 'string' || school.trim())) {
          schoolStats[school] = (schoolStats[school] || 0) + 1;
        }

        const category = row[3];
        if (category && (typeof category !== 'string' || category.trim())) {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        }
      } catch (e) {
        // 日期解析失敗，跳過此行
      }
    });

    inProgressData.forEach((row) => {
      // 過濾掉空行
      if (!row || !row[0] || (typeof row[0] === 'string' && !row[0].trim())) return;

      const school = row[2];
      if (school && (typeof school !== 'string' || school.trim())) {
        schoolStats[school] = (schoolStats[school] || 0) + 1;
      }

      const category = row[3];
      if (category && (typeof category !== 'string' || category.trim())) {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
    });

    const averageRepairDays =
      monthCompletedCount > 0 ? Math.round(totalDaysForMonth / monthCompletedCount) : 0;

    const averageRepairDaysWeek =
      weekCompletedCount > 0 ? Math.round(totalDaysForWeek / weekCompletedCount) : 0;

    const averageRepairDaysAll =
      allCompletedCount > 0 ? Math.round(totalDaysForAll / allCompletedCount) : 0;

    const topSchools = Object.entries(schoolStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 計算非空行的數量
    const completedCount = completedData.filter(row => row && row[0] && (typeof row[0] !== 'string' || row[0].trim())).length;
    const inProgressCount = inProgressData.filter(row => row && row[0] && (typeof row[0] !== 'string' || row[0].trim())).length;

    return Response.json({
      success: true,
      stats: {
        thisMonthCompleted,
        thisWeekCompleted,
        averageRepairDays,
        averageRepairDaysWeek,
        averageRepairDaysAll,
        completedCount,
        inProgressCount,
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
