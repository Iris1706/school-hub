'use client';

import { useState, useEffect } from 'react';

export default function ReportGenerator() {
  // 人員代碼映射表
  const personMap = {
    'P': 'Pawn',
    'E': 'Esther',
    'I': 'Iris',
    'H': 'Hongkun',
    'M': 'May',
    'Z': 'Zephyr',
    'A': 'Andy',
    'J': 'Jenna',
  };

  const [dateMode, setDateMode] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyHighlights, setWeeklyHighlights] = useState('');

  const [data, setData] = useState({
    inspect: [],
    repairs: [],
    schedule: [],
    attendance: [],
    todos: [],
    weeklyStatus: [],
    foreignObjects: { count: 0, weekStart: '', weekEnd: '' },
    annualStats: { data: [], total: 0 },
    repairDetails: { headers: [], data: [], count: 0 },
    tabletRepairsInProgress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 計算週期日期
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (dateMode === 'week') {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);

      const day = targetDate.getDay();
      const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(targetDate.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  // 獲取本週日期（週一到週日）
  const getWeekDays = () => {
    const { startDate } = getDateRange();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // 格式化日期為 yyyy/m/d（與 Google Sheets 格式一致）
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateStr = `${year}/${month}/${day}`;

      days.push({
        date,
        dateStr,
        dayName: ['一', '二', '三', '四', '五', '六', '日'][date.getDay() === 0 ? 6 : date.getDay() - 1],
      });
    }
    return days;
  };

  // 從 API 獲取數據
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoints = [
          { key: 'inspect', url: '/api/inspect' },
          { key: 'schedule', url: '/api/daily-schedule' },
          { key: 'attendance', url: '/api/schedule' },
          { key: 'todos', url: '/api/todos' },
          { key: 'weeklyStatus', url: '/api/weekly-status' },
          { key: 'foreignObjects', url: '/api/foreign-objects' },
          { key: 'annualStats', url: '/api/annual-stats' },
          { key: 'repairDetails', url: '/api/repair-details' },
        ];

        const newData = {
          inspect: [],
          repairs: [],
          schedule: [],
          attendance: [],
          todos: [],
          weeklyStatus: [],
          foreignObjects: { count: 0, weekStart: '', weekEnd: '' },
          annualStats: { data: [], total: 0 },
          repairDetails: { headers: [], data: [], count: 0 },
          tabletRepairsInProgress: 0,
        };

        // 嘗試獲取每個 API，失敗時使用空陣列
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint.url);
            if (response.ok) {
              const json = await response.json();
              // 處理兩種 API 格式：{ data: [...] } 或直接 [...]
              newData[endpoint.key] = json?.data || json || [];

              // 調試日志
              if (endpoint.key === 'attendance') {
                console.log(`班表數據 (${endpoint.key}):`, newData[endpoint.key]);
              }
              if (endpoint.key === 'foreignObjects') {
                console.log(`夾異物 API 返回:`, json);
                console.log(`夾異物數據:`, newData[endpoint.key]);
              }
            }
          } catch (err) {
            console.warn(`無法獲取 ${endpoint.url}:`, err.message);
          }
        }

        // 獲取一期和二期平板維修處理中的筆數
        try {
          const period1Url = `/api/repairs/read?sheetName=${encodeURIComponent('Pawn')}&type=inProgress`;
          const period2Url = `/api/repairs/read?sheetName=${encodeURIComponent('二期生生平板維修')}&type=inProgress`;

          console.log('一期 URL:', period1Url);
          console.log('二期 URL:', period2Url);

          const period1Response = await fetch(period1Url);
          const period2Response = await fetch(period2Url);

          let tabletRepairsInProgress = 0;

          if (period1Response.ok) {
            const period1Data = await period1Response.json();
            console.log('一期 API 返回:', period1Data);
            const period1Count = (period1Data?.data || []).length;
            tabletRepairsInProgress += period1Count;
            console.log(`一期生生平板維修處理中: ${period1Count} 筆`);
          } else {
            console.error(`一期 API 失敗，狀態: ${period1Response.status}`, await period1Response.text());
          }

          if (period2Response.ok) {
            const period2Data = await period2Response.json();
            console.log('二期 API 返回:', period2Data);
            const period2Count = (period2Data?.data || []).length;
            tabletRepairsInProgress += period2Count;
            console.log(`二期生生平板維修處理中: ${period2Count} 筆`);
          } else {
            console.error(`二期 API 失敗，狀態: ${period2Response.status}`, await period2Response.text());
          }

          newData.tabletRepairsInProgress = tabletRepairsInProgress;
          console.log(`【總處理中筆數】: ${tabletRepairsInProgress}`);
        } catch (err) {
          console.warn(`無法獲取平板維修處理中數據:`, err.message);
          console.error(err);
        }

        setData(newData);
        console.log('最終數據:', newData);
      } catch (err) {
        setError('獲取數據失敗：' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateMode, weekOffset, monthOffset]);

  const handleExport = async (format) => {
    try {
      if (format === 'PDF') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          const element = document.getElementById('report-content');
          const opt = {
            margin: 10,
            filename: `報表_${new Date().toLocaleDateString('zh-TW')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
          };
          window.html2pdf().set(opt).from(element).save();
        };
        document.head.appendChild(script);
      } else if (format === 'PNG') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
          const element = document.getElementById('report-content');
          window.html2canvas(element, { scale: 2 }).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `報表_${new Date().toLocaleDateString('zh-TW')}.png`;
            link.click();
          });
        };
        document.head.appendChild(script);
      } else if (format === 'HTML') {
        const element = document.getElementById('report-content');
        const htmlContent = element.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `報表_${new Date().toLocaleDateString('zh-TW')}.html`;
        link.click();
      }
    } catch (err) {
      alert(`${format} 匯出失敗：${err.message}`);
    }
  };

  const { startDate, endDate } = getDateRange();
  const dateRangeText = `${startDate.toLocaleDateString('zh-TW')} ~ ${endDate.toLocaleDateString('zh-TW')}`;

  // 計算生生巡檢和 THSD 巡檢數據
  const inspectArray = Array.isArray(data.inspect) ? data.inspect : [];
  const repairsArray = Array.isArray(data.repairs) ? data.repairs : [];

  // 檢查是否打勾（與 inspect 頁籤邏輯一致）
  const isChecked = (value) => {
    if (!value) return false;
    const str = String(value).toLowerCase().trim();
    return str === "true" || str === "✓" || str === "☑" || str === "✔";
  };

  // 取得欄位值（與 inspect 頁籤邏輯一致，容錯處理）
  const getFieldValue = (obj, fieldName) => {
    if (!obj) return "";

    // 首先嘗試直接匹配
    if (obj[fieldName] !== undefined) {
      return obj[fieldName] || "";
    }

    // 如果直接匹配失敗，尋找相似的欄位名稱（去除空格和換行符）
    const normalizedFieldName = fieldName.replace(/\s+/g, "").toLowerCase();
    for (const key in obj) {
      const normalizedKey = key.replace(/\s+/g, "").toLowerCase();
      if (normalizedKey === normalizedFieldName) {
        return obj[key] || "";
      }
    }

    return "";
  };

  // 生生用平板統計（與 inspect 頁籤邏輯一致）
  const shengshengInspect = inspectArray.filter((i) => {
    const uploadCheck = getFieldValue(i, "巡檢單上傳");
    const emailCheck = getFieldValue(i, "巡檢單email給老師");
    return isChecked(uploadCheck) && isChecked(emailCheck);
  }).length;

  const shengshengTotal = inspectArray.length || 1;

  // THSD 巡檢統計（與 inspect 頁籤邏輯一致）
  // 只計算有 THSD 數據的行
  const thsdDataRows = inspectArray.filter((d) => {
    const hasThsdData =
      getFieldValue(d, "THSD學校") ||
      getFieldValue(d, "載具數量") ||
      getFieldValue(d, "是否完成");
    return hasThsdData;
  });

  // 完成數 = THSD 數據中「是否完成」勾選的數量
  const thsdInspect = thsdDataRows.filter((d) => isChecked(getFieldValue(d, "是否完成"))).length;
  // 總計 = 所有有 THSD 數據的行數
  const thsdTotal = thsdDataRows.length || 1;

  // SA 維修處理中（與硬體管理頁籤邏輯一致）
  // 顯示一期生生平板維修及二期生生平板維修總共處理中的筆數
  const saRepairsProcessing = data.tabletRepairsInProgress || 0;

  // 計算南區維修數據
  const getRepairStats = () => {
    const { startDate, endDate } = getDateRange();
    const repairs = Array.isArray(data.repairs) ? data.repairs : [];
    const tabletRepairs = repairs.filter((r) =>
      r?.category === '一期生生平板維修' || r?.category === '二期生生平板維修'
    );

    const completed = tabletRepairs.filter((r) => {
      const repairDate = new Date(r?.date);
      return repairDate >= startDate && repairDate <= endDate && (r?.status === '已完成' || r?.status === '完成');
    }).length;

    const newRepairs = tabletRepairs.filter((r) => {
      const createdDate = new Date(r?.createdDate || r?.date);
      return createdDate >= startDate && createdDate <= endDate;
    }).length;

    const processing = tabletRepairs.filter((r) => {
      const repairDate = new Date(r?.date);
      return repairDate >= startDate && repairDate <= endDate && (r?.status === '處理中' || r?.status === '進行中');
    }).length;

    return { completed, newRepairs, processing };
  };

  const repairStats = getRepairStats();
  const weekDays = getWeekDays();

  // 按日期組織行程數據，並過濾排休日（沒有行程的日期不顯示）
  const getScheduleByDay = () => {
    const scheduleByDay = {};
    const schedule = Array.isArray(data.schedule) ? data.schedule : [];

    weekDays.forEach((day) => {
      const daySchedules = schedule.filter((s) => {
        try {
          const scheduleDate = new Date(s?.date || s?.datetime);
          return scheduleDate.toLocaleDateString('zh-TW') === day.dateStr;
        } catch {
          return false;
        }
      });

      if (daySchedules.length > 0) {
        scheduleByDay[day.dateStr] = {
          ...day,
          schedules: daySchedules,
        };
      }
    });

    return Object.values(scheduleByDay);
  };

  const scheduleByDay = getScheduleByDay();

  // 獲取當天所有人員的班表數據（包括特定行程和班表狀態）
  const getAllPeopleForDay = (dateStr) => {
    const allPeople = ['P', 'E', 'I', 'H', 'M', 'Z', 'A', 'J'];
    const attendance = Array.isArray(data.attendance) ? data.attendance : [];
    const schedule = Array.isArray(data.schedule) ? data.schedule : [];

    const peopleData = {};

    // 初始化所有人員
    allPeople.forEach((person) => {
      peopleData[person] = {
        person,
        schedules: [],
        bandSchedule: null,
      };
    });

    // 1. 填入特定行程
    const daySchedules = schedule.filter((s) => {
      try {
        const apiDate = String(s?.date || '').trim();
        return apiDate === dateStr;
      } catch {
        return false;
      }
    });

    daySchedules.forEach((schedule) => {
      const persons = String(schedule?.person || '')
        .split('/')
        .map((p) => p.trim())
        .filter((p) => p);

      persons.forEach((person) => {
        if (peopleData[person]) {
          peopleData[person].schedules.push(schedule);
        }
      });
    });

    // 2. 填入班表狀態
    attendance.forEach((att) => {
      const person = String(att?.person || '').trim();
      const attDate = String(att?.date || '').trim();

      if (person && attDate === dateStr && peopleData[person]) {
        const status = String(att?.status || '').trim();
        if (status) {
          peopleData[person].bandSchedule = status;
          // 調試：打印成功匹配的數據
          if (dateStr === '2026/8/23') {
            console.log(`✓ 匹配班表: ${person} - ${dateStr} - ${status}`);
          }
        }
      }
    });

    // 調試：顯示該日期的所有數據
    if (dateStr === '2026/8/23') {
      console.log(`日期 ${dateStr} 的班表數據:`, Object.values(peopleData).filter(p => p.bandSchedule));
    }

    return Object.values(peopleData);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 頂部控制欄 - 匯出功能 + 日期範圍 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* 左側：匯出功能 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleExport('PDF')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0052a3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#0066cc')}
          >
            📄 PDF
          </button>
          <button
            onClick={() => handleExport('PNG')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#d97706')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#f59e0b')}
          >
            🖼️ PNG
          </button>
          <button
            onClick={() => handleExport('HTML')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
          >
            🌐 HTML
          </button>
        </div>

        {/* 右側：日期範圍篩選 */}
        {dateMode === 'week' ? (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              ◀ 上週
            </button>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>本週</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                {dateRangeText}
              </p>
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              下週 ▶
            </button>
            <button
              onClick={() => setDateMode('month')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: '1.5px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              月份
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={() => setMonthOffset(monthOffset - 1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              ◀ 上月
            </button>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>本月</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                {dateRangeText}
              </p>
            </div>
            <button
              onClick={() => setMonthOffset(monthOffset + 1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              下月 ▶
            </button>
            <button
              onClick={() => setDateMode('week')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: '1.5px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              月份
            </button>
          </div>
        )}
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            marginBottom: '20px',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '14px',
          }}
        >
          ⚠️ {error}
        </div>
      )}


      {/* 預覽區域 */}
      {!loading && (
        <div id="report-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. 本週重點 */}
          <ReportCard title="本週重點">
            <div style={{ padding: '15px' }}>
              {/* 統計卡片區域 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '15px',
                  marginBottom: '20px',
                }}
              >
                {/* 本週報修 */}
                <StatCard title="本週報修" value="－" />

                {/* 生生巡檢 */}
                <StatCard title="生生巡檢" value={`${shengshengInspect}/${shengshengTotal}`} />

                {/* THSD 巡檢 */}
                <StatCard title="THSD 巡檢" value={`${thsdInspect}/${thsdTotal}`} />

                {/* SA 維修處理中 */}
                <StatCard title="SA 維修處理中" value={saRepairsProcessing} />

                {/* 夾異物（本週） */}
                <StatCard title="夾異物（本週）" value={data.foreignObjects?.count || 0} />
              </div>

              {/* 文字輸入框 */}
              <textarea
                value={weeklyHighlights}
                onChange={(e) => setWeeklyHighlights(e.target.value)}
                placeholder="請輸入本週重點內容..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </ReportCard>

          {/* 2. 本週班表 */}
          <ReportCard title="本週班表">
            <div style={{ padding: '15px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '12px',
                }}
              >
                {weekDays.slice(0, 5).map((dayData, idx) => {
                  // 獲取當天所有人員的數據（包括班表狀態）
                  const dayPeople = getAllPeopleForDay(dayData.dateStr);
                  // 篩選出 Iris（'I'）的數據
                  const irisPerson = dayPeople.find(p => p.person === 'I');

                  const getEventColor = (event) => {
                    if (!event) return { bgColor: '#d4edbb', textColor: '#374151' };
                    const eventStr = String(event).trim();
                    const colorMap = {
                      '三多': { bgColor: '#d4edbb', textColor: '#374151' },
                      '上午(外)': { bgColor: '#c6dbe1', textColor: '#374151' },
                      '下午(外)': { bgColor: '#ffcfc8', textColor: '#374151' },
                      '特休': { bgColor: '#ca3750', textColor: '#ffffff' },
                      '排休': { bgColor: '#ffe59f', textColor: '#374151' },
                      '巡檢': { bgColor: '#c0e1f6', textColor: '#374151' },
                      '上午(巡)': { bgColor: '#5b3286', textColor: '#ffffff' },
                      '下午(巡)': { bgColor: '#5b3286', textColor: '#ffffff' },
                      '國定假日': { bgColor: '#d81b91', textColor: '#ffffff' },
                      '彈性假': { bgColor: '#a7adb6', textColor: '#374151' },
                      '病假': { bgColor: '#7d9ac4', textColor: '#374151' },
                      '事假': { bgColor: '#473822', textColor: '#ffffff' },
                      '駐點': { bgColor: '#e28d38', textColor: '#374151' },
                      '上午(特)': { bgColor: '#b10202', textColor: '#ffffff' },
                      '下午(特)': { bgColor: '#b10202', textColor: '#ffffff' },
                    };
                    return colorMap[eventStr] || { bgColor: '#d4edbb', textColor: '#374151' };
                  };

                  const hasSchedules = irisPerson && irisPerson.schedules && irisPerson.schedules.length > 0;
                  const bandSchedule = irisPerson ? irisPerson.bandSchedule : null;

                  // 生成 Iris 的顯示文本和顏色
                  let displayText = '';
                  let statusColor = { bgColor: '#d4edbb', textColor: '#374151' };

                  if (hasSchedules) {
                    // 有行程時：顯示 "iris 事件（細項：區域 地點 事件）"
                    const schedule = irisPerson.schedules[0];
                    displayText = `iris ${schedule.event || ''}（細項：${[schedule.region || '', schedule.location || '', schedule.event || ''].filter(Boolean).join(' ')}）`;
                    statusColor = getEventColor(schedule.event);
                  } else if (bandSchedule) {
                    // 沒有行程時：顯示 "iris 班表狀態（沒有細項）"
                    displayText = `iris ${bandSchedule}（沒有細項）`;
                    statusColor = getEventColor(bandSchedule);
                  } else {
                    // 都沒有時：不顯示
                    displayText = '';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '9px',
                      }}
                    >
                      {/* 日期和星期 - 黑色背景 */}
                      <div
                        style={{
                          textAlign: 'center',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '9px 6px',
                          borderRadius: '6px',
                          marginBottom: '2px',
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
                          {dayData.dateStr}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>
                          週{dayData.dayName}
                        </div>
                      </div>

                      {/* 分隔線 */}
                      <div
                        style={{
                          height: '1px',
                          backgroundColor: '#d1d5db',
                          margin: '4px 0',
                        }}
                      />

                      {/* Iris 班表信息 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        {displayText ? (
                          <div
                            style={{
                              padding: '8px',
                              backgroundColor: statusColor.bgColor,
                              color: statusColor.textColor,
                              borderRadius: '4px',
                              fontSize: '12px',
                              lineHeight: '1.4',
                              fontWeight: '500',
                            }}
                          >
                            {displayText}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: '8px',
                              backgroundColor: '#f3f4f6',
                              color: '#9ca3af',
                              borderRadius: '4px',
                              fontSize: '12px',
                              textAlign: 'center',
                            }}
                          >
                            無班表資料
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ReportCard>

          {/* 3. 當年度（2026）年度統計 */}
          <ReportCard title="當年度（2026）年度統計">
            <div style={{ padding: '15px', overflowX: 'auto' }}>
              {data.annualStats?.data && data.annualStats.data.length > 0 ? (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        borderBottom: '2px solid #d1d5db',
                      }}
                    >
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>
                        月份
                      </th>
                      <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                        Iris
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.annualStats.data.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', color: '#374151', fontWeight: '500' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#374151' }}>
                          {item.values && item.values.length > 0 ? item.values[0] : '－'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                  尚未帶入資料
                </div>
              )}
            </div>
          </ReportCard>

          {/* 4. 個人處理案件數（本週） */}
          <ReportCard title="個人處理案件數（本週）">
            <div style={{ padding: '15px' }}>
              {Array.isArray(data.inspect) && data.inspect.length > 0 ? (
                <div>
                  <p
                    style={{
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontSize: '14px',
                    }}
                  >
                    本週案件統計
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '6px',
                        borderLeft: '4px solid #10b981',
                      }}
                    >
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                        巡檢數
                      </p>
                      <p
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#10b981',
                          margin: 0,
                        }}
                      >
                        {inspectArray.length}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '6px',
                        borderLeft: '4px solid #f59e0b',
                      }}
                    >
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                        維修數
                      </p>
                      <p
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#f59e0b',
                          margin: 0,
                        }}
                      >
                        {repairsArray.length}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無案件數據</p>
              )}
            </div>
          </ReportCard>

          {/* 5. 每日統計與問題分類 */}
          <ReportCard title="每日統計與問題分類">
            <div style={{ padding: '15px' }}>
              {Array.isArray(data.inspect) && data.inspect.length > 0 ? (
                <div>
                  <p
                    style={{
                      marginBottom: '10px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontSize: '14px',
                    }}
                  >
                    問題分布
                  </p>
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                    }}
                  >
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      共檢測到 <strong style={{ color: '#1f2937' }}>{inspectArray.length}</strong> 項巡檢紀錄
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無統計數據</p>
              )}
            </div>
          </ReportCard>

          {/* 6. 本週報修明細 */}
          <ReportCard title="本週報修明細">
            <div style={{ padding: '15px', overflowX: 'auto' }}>
              {Array.isArray(data.repairDetails?.data) && data.repairDetails.data.length > 0 ? (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        borderBottom: '2px solid #d1d5db',
                      }}
                    >
                      {data.repairDetails.headers?.slice(0, 13).map((header, idx) => (
                        <th
                          key={idx}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.repairDetails.data.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        {data.repairDetails.headers?.slice(0, 13).map((header, hidx) => (
                          <td key={hidx} style={{ padding: '10px 8px', color: '#374151', fontSize: '12px' }}>
                            {item[header] || '－'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無報修紀錄</p>
              )}
            </div>
          </ReportCard>

          {/* 7. 南區維修情況 */}
          <ReportCard title="南區維修情況">
            <div style={{ padding: '15px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '6px',
                    borderLeft: '4px solid #10b981',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                    本週完修
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#10b981',
                      margin: 0,
                    }}
                  >
                    {repairStats.completed}
                  </p>
                </div>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '6px',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                    本週新增
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      margin: 0,
                    }}
                  >
                    {repairStats.newRepairs}
                  </p>
                </div>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '6px',
                    borderLeft: '4px solid #ef4444',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                    維修處理中
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#ef4444',
                      margin: 0,
                    }}
                  >
                    {repairStats.processing}
                  </p>
                </div>
              </div>
            </div>
          </ReportCard>

          {/* 8. 巡檢進度 */}
          <ReportCard title="巡檢進度">
            <div style={{ padding: '15px' }}>
              <p
                style={{
                  fontSize: '14px',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                完成進度
              </p>
              <div
                style={{
                  width: '100%',
                  height: '24px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '65%',
                    height: '100%',
                    backgroundColor: '#10b981',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                65% 完成 (90/263)
              </p>
            </div>
          </ReportCard>

          {/* 9. 巡檢個人進度（學期） */}
          <ReportCard title="巡檢個人進度（學期）">
            <div style={{ padding: '15px' }}>
              {Array.isArray(data.inspect) && data.inspect.length > 0 ? (
                <div>
                  <p
                    style={{
                      fontSize: '14px',
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                    }}
                  >
                    個人完成進度
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '15px',
                    }}
                  >
                    <ProgressItem label="Pawn" value={86} />
                    <ProgressItem label="Esther" value={71} />
                    <ProgressItem label="Iris" value={67} />
                    <ProgressItem label="其他" value={50} />
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無進度數據</p>
              )}
            </div>
          </ReportCard>

          {/* 10. 高雄巡檢報告（週別） */}
          <ReportCard title="高雄巡檢報告（週別）">
            <div style={{ padding: '15px' }}>
              {Array.isArray(data.inspect) && data.inspect.length > 0 ? (
                <div>
                  <p
                    style={{
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontSize: '14px',
                    }}
                  >
                    本週巡檢摘要
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                      }}
                    >
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                        巡檢學校數
                      </p>
                      <p
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          margin: 0,
                        }}
                      >
                        {Array.from(new Set(inspectArray.map((i) => i?.school || i?.location))).length}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                      }}
                    >
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                        檢測項目
                      </p>
                      <p
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          margin: 0,
                        }}
                      >
                        {inspectArray.length}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無巡檢報告</p>
              )}
            </div>
          </ReportCard>
        </div>
      )}
    </div>
  );
}

// 報表卡片元件
function ReportCard({ title, children }) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          paddingBottom: '12px',
          borderBottom: '2px solid #f3f4f6',
          color: '#1f2937',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// 統計卡片元件（頂部）- 深立體風格
function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        border: '2px solid #0284c7',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(2, 132, 199, 0.2)',
      }}
    >
      <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0 0 12px 0', fontWeight: 'bold' }}>
        {title}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7', margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

// 進度項目元件
function ProgressItem({ label, value }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#2563eb',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {value}%
        </p>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: '#2563eb',
          }}
        />
      </div>
    </div>
  );
}
