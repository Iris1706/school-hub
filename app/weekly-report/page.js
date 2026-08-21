'use client';

import { useState, useEffect } from 'react';

export default function ReportGenerator() {
  const [dateRange, setDateRange] = useState('week');
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

    if (dateRange === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  // 從 API 獲取數據
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const responses = await Promise.all([
          fetch('/api/inspect'),
          fetch('/api/repairs'),
          fetch('/api/daily-schedule'),
          fetch('/api/todos'),
          fetch('/api/weekly-status'),
        ]);

        if (!responses.every((r) => r.ok)) {
          throw new Error('無法獲取部分數據');
        }

        const [inspectData, repairsData, scheduleData, todosData, weeklyStatusData] =
          await Promise.all(responses.map((r) => r.json()));

        setData({
          inspect: inspectData || [],
          repairs: repairsData || [],
          schedule: scheduleData || [],
          todos: todosData || [],
          weeklyStatus: weeklyStatusData || [],
        });
      } catch (err) {
        setError('獲取數據失敗：' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExport = async (format) => {
    try {
      if (format === 'PDF') {
        const element = document.getElementById('report-content');
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf()
          .set({
            margin: 10,
            filename: `報表_${new Date().toLocaleDateString('zh-TW')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
          })
          .from(element)
          .save();
      } else if (format === 'PNG') {
        const element = document.getElementById('report-content');
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, { scale: 2 });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `報表_${new Date().toLocaleDateString('zh-TW')}.png`;
        link.click();
      } else if (format === 'HTML') {
        const element = document.getElementById('report-content');
        const htmlContent = element.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 標題 */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px', color: '#1f2937' }}>
          📊 報表產生器
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          查看和匯出 {dateRangeText} 的各項報表
        </p>
      </div>

      {/* 篩選區域 + 匯出功能 */}
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
        {/* 左側：日期範圍篩選 */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
            日期範圍：
          </label>
          <button
            onClick={() => handleDateRangeChange('week')}
            style={{
              padding: '8px 20px',
              backgroundColor: dateRange === 'week' ? '#2563eb' : '#e5e7eb',
              color: dateRange === 'week' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
          >
            📅 每週
          </button>
          <button
            onClick={() => handleDateRangeChange('month')}
            style={{
              padding: '8px 20px',
              backgroundColor: dateRange === 'month' ? '#2563eb' : '#e5e7eb',
              color: dateRange === 'month' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
          >
            📆 每月
          </button>
        </div>

        {/* 右側：匯出功能 */}
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
              transition: 'background-color 0.3s ease',
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
              transition: 'background-color 0.3s ease',
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
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
          >
            🌐 HTML
          </button>
        </div>
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
          <ReportCard title="1️⃣ 本週重點">
            <div style={{ padding: '15px' }}>
              {data.weeklyStatus && data.weeklyStatus.length > 0 ? (
                <div>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1f2937' }}>
                    本週關鍵事項：
                  </p>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {data.weeklyStatus.slice(0, 5).map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: '8px',
                          color: '#374151',
                          fontSize: '14px',
                        }}
                      >
                        {item.title || item.content || '待定'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無本週重點數據</p>
              )}
            </div>
          </ReportCard>

          {/* 2. 本週班表 */}
          <ReportCard title="2️⃣ 本週班表">
            <div style={{ padding: '15px', overflowX: 'auto' }}>
              {data.schedule && data.schedule.length > 0 ? (
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
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>日期</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>
                        負責人
                      </th>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#1f2937' }}>地點</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.schedule.slice(0, 7).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item.date || '待定'}
                        </td>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item.person || item.name || '待定'}
                        </td>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item.location || item.school || '待定'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無本週班表數據</p>
              )}
            </div>
          </ReportCard>

          {/* 3. 年度統計 */}
          <ReportCard title="3️⃣ 年度統計">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                padding: '15px',
              }}
            >
              <StatCard label="總巡檢數" value={data.inspect.length} color="#10b981" />
              <StatCard label="總維修數" value={data.repairs.length} color="#f59e0b" />
              <StatCard label="待辦事項" value={data.todos.length} color="#8b5cf6" />
            </div>
          </ReportCard>

          {/* 4. 個人處理案件數（本週） */}
          <ReportCard title="4️⃣ 個人處理案件數（本週）">
            <div style={{ padding: '15px' }}>
              {data.inspect && data.inspect.length > 0 ? (
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
                        {data.inspect.length}
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
                        {data.repairs.length}
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
          <ReportCard title="5️⃣ 每日統計與問題分類">
            <div style={{ padding: '15px' }}>
              {data.inspect && data.inspect.length > 0 ? (
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
                      共檢測到 <strong style={{ color: '#1f2937' }}>{data.inspect.length}</strong> 項巡檢紀錄
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>暫無統計數據</p>
              )}
            </div>
          </ReportCard>

          {/* 6. 本週報修明細 */}
          <ReportCard title="6️⃣ 本週報修明細">
            <div style={{ padding: '15px', overflowX: 'auto' }}>
              {data.repairs && data.repairs.length > 0 ? (
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
                    {data.repairs.slice(0, 7).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item.date || '待定'}
                        </td>
                        <td style={{ padding: '10px', color: '#374151' }}>
                          {item.category || item.type || '其他'}
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
                            {item.status || '待處理'}
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
          <ReportCard title="7️⃣ 南區維修情況">
            <div style={{ padding: '15px' }}>
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
                    backgroundColor: '#fffbeb',
                    borderRadius: '6px',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>
                    維修總數
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      margin: 0,
                    }}
                  >
                    {data.repairs.length}
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
                    待完成
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#ef4444',
                      margin: 0,
                    }}
                  >
                    {data.repairs.filter((r) => r.status !== '已完成').length}
                  </p>
                </div>
              </div>
            </div>
          </ReportCard>

          {/* 8. 巡檢進度 */}
          <ReportCard title="8️⃣ 巡檢進度">
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
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                65% 完成 (90/263)
              </p>
            </div>
          </ReportCard>

          {/* 9. 巡檢個人進度（學期） */}
          <ReportCard title="9️⃣ 巡檢個人進度（學期）">
            <div style={{ padding: '15px' }}>
              {data.inspect && data.inspect.length > 0 ? (
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
          <ReportCard title="🔟 高雄巡檢報告（週別）">
            <div style={{ padding: '15px' }}>
              {data.inspect && data.inspect.length > 0 ? (
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
                        {Array.from(new Set(data.inspect.map((i) => i.school || i.location))).length}
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
                        {data.inspect.length}
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
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// 統計卡片元件
function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        textAlign: 'center',
        border: `2px solid ${color}20`,
      }}
    >
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', margin: 0 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: color,
          margin: 0,
        }}
      >
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
