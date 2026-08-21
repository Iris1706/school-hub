'use client';

import { useState, useEffect } from 'react';

export default function ReportGenerator() {
  const [dateMode, setDateMode] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyHighlights, setWeeklyHighlights] = useState('');

  const [data, setData] = useState({
    inspect: [],
    repairs: [],
    schedule: [],
    todos: [],
    weeklyStatus: [],
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
      days.push({
        date,
        dateStr: date.toLocaleDateString('zh-TW'),
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
          { key: 'repairs', url: '/api/repairs' },
          { key: 'schedule', url: '/api/daily-schedule' },
          { key: 'todos', url: '/api/todos' },
          { key: 'weeklyStatus', url: '/api/weekly-status' },
        ];

        const newData = {
          inspect: [],
          repairs: [],
          schedule: [],
          todos: [],
          weeklyStatus: [],
        };

        // 嘗試獲取每個 API，失敗時使用空陣列
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint.url);
            if (response.ok) {
              const json = await response.json();
              newData[endpoint.key] = json || [];
            }
          } catch (err) {
            console.warn(`無法獲取 ${endpoint.url}:`, err.message);
          }
        }

        setData(newData);
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

  const shengshengInspect = inspectArray.filter((i) => i?.type === '生生' || i?.category === '生生用平板' || i?.name?.includes('生生')).length;
  const shengshengTotal = shengshengInspect || 1;

  const thsdInspect = inspectArray.filter((i) => i?.type === 'THSD' || i?.category === 'THSD' || i?.name?.includes('THSD')).length;
  const thsdTotal = thsdInspect || 1;

  const saRepairsProcessing = repairsArray.filter((r) => r?.status === '處理中' || r?.status === '進行中').length;

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

      {/* 統計卡片區域 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
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
        <StatCard title="夾異物（本週）" value="－" />
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

      {/* 載入指示 */}
      {loading && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          ⏳ 正在載入報表數據...
        </div>
      )}

      {/* 預覽區域 */}
      {!loading && (
        <div id="report-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. 本週重點 */}
          <ReportCard title="本週重點">
            <div style={{ padding: '15px' }}>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                }}
              >
                {weekDays.map((dayData, idx) => {
                  const daySchedules = scheduleByDay.find(
                    (d) => d.dateStr === dayData.dateStr
                  );
                  const schedules = daySchedules?.schedules || [];
                  const dayOfWeek = dayData.date.getDay();
                  // 只顯示平日（1-5），或假日有行程
                  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
                  const hasSchedules = schedules.length > 0;

                  if (!isWeekday && !hasSchedules) return null;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* 日期和星期 - 黑色背景 */}
                      <div
                        style={{
                          textAlign: 'center',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                          {dayData.dateStr}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                          週{dayData.dayName}
                        </div>
                      </div>

                      {/* 分隔線 */}
                      <div
                        style={{
                          height: '1px',
                          backgroundColor: '#d1d5db',
                          margin: '8px 0',
                        }}
                      />

                      {/* 行程列表 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {schedules.length > 0 ? (
                          schedules.map((schedule, sidx) => (
                            <div
                              key={sidx}
                              style={{
                                padding: '12px 14px',
                                backgroundColor: 'white',
                                border: '2px solid #2563eb',
                                borderRadius: '8px',
                                color: '#2563eb',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              {schedule.region && (
                                <div>{schedule.region}</div>
                              )}
                              {(schedule.location || schedule.school) && (
                                <div>{schedule.location || schedule.school}</div>
                              )}
                              {schedule.event && (
                                <div>{schedule.event}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: '12px 14px',
                              backgroundColor: 'white',
                              border: '2px solid #2563eb',
                              borderRadius: '8px',
                              color: '#2563eb',
                              fontSize: '16px',
                              fontWeight: '600',
                              textAlign: 'center',
                            }}
                          >
                            ...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {weekDays.filter((d) => {
                const dayOfWeek = d.date.getDay();
                const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
                const hasSchedules = scheduleByDay.some(
                  (s) => s.dateStr === d.dateStr && s.schedules.length > 0
                );
                return isWeekday || hasSchedules;
              }).length === 0 && (
                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '40px 20px' }}>
                  本週無行程
                </p>
              )}
            </div>
          </ReportCard>

          {/* 3. 年度統計 */}
          <ReportCard title="年度統計">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                padding: '15px',
              }}
            >
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                尚未帶入資料
              </div>
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
              {Array.isArray(data.repairs) && data.repairs.length > 0 ? (
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
                        日期
                      </th>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>
                        類別
                      </th>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>
                        狀態
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairsArray.slice(0, 7).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item?.date || '待定'}
                        </td>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item?.category || item?.type || '其他'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {item?.status || '待處理'}
                          </span>
                        </td>
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
