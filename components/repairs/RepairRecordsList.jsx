'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function RepairRecordsList({ sheetName }) {
  const [records, setRecords] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = `/api/repairs/records?sheetName=${encodeURIComponent(sheetName)}`;
      console.log('正在請求 API:', url);

      const response = await fetch(url);
      console.log('HTTP 狀態:', response.status, response.statusText);

      let result;
      const text = await response.text();
      console.log('API 原始響應:', text);

      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`無法解析 API 響應: ${text.substring(0, 200)}`);
      }

      console.log('解析後的 API 響應:', result);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || '讀取報修紀錄失敗');
      }

      setHeaders(result.headers);
      // 反向排序，最新的在前面
      setRecords([...result.records].reverse());
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMsg = err.message || '未知錯誤';
      setError(errorMsg);
      console.error('讀取報修紀錄錯誤:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    fetchRecords();
  }, [sheetName]);

  // 自動每30秒刷新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecords();
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, [sheetName]);

  const getStatusColor = (status) => {
    switch (status?.trim().toLowerCase()) {
      case '完成':
      case '已完成':
        return '#10b981';
      case '進行中':
      case '處理中':
        return '#3b82f6';
      case '待處理':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.trim().toLowerCase()) {
      case '完成':
      case '已完成':
        return 'rgba(16, 185, 129, 0.1)';
      case '進行中':
      case '處理中':
        return 'rgba(59, 130, 246, 0.1)';
      case '待處理':
        return 'rgba(245, 158, 11, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (loading && records.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ marginBottom: '12px', fontSize: '10px' }}>載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertCircle size={20} />
        <div>
          <div style={{ fontWeight: '600' }}>讀取失敗</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* 空資料提示 */}
      {records.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: 'var(--background-secondary, #f9f9f9)',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '10px' }}>暫無報修紀錄</div>
        </div>
      ) : (
        // 表格視圖 - 按月份分組
        <div>
          {(() => {
            // 按月份分組數據
            const groupedByMonth = records.reduce((acc, record) => {
              const dateStr = record.values[0]; // 假設第一列是日期
              const monthKey = dateStr ? dateStr.substring(0, 7) : 'unknown'; // "2026/9" 格式
              if (!acc[monthKey]) {
                acc[monthKey] = [];
              }
              acc[monthKey].push(record);
              return acc;
            }, {});

            // 按月份排序（降序，最新在前）
            const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

            return sortedMonths.map((monthKey) => (
              <div key={monthKey} style={{ marginBottom: '24px' }}>
                {/* 月份標題 */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #1f2937)',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid var(--border-color, #e5e7eb)',
                }}>
                  {monthKey}
                </div>

                {/* 月份內的表格 */}
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '10px',
                    }}
                  >
                    <thead>
                      <tr style={{ background: 'var(--background-secondary, #f9f9f9)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                        {headers.map((header, idx) => (
                          <th
                            key={idx}
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              fontWeight: '600',
                              color: 'var(--text-secondary)',
                              fontSize: '10px',
                              whiteSpace: 'nowrap',
                              borderRight: idx < headers.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none',
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByMonth[monthKey].map((record, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--background-secondary, #f9f9f9)',
                  }}
                >
                  {record.values.map((value, colIdx) => {
                    const header = headers[colIdx];
                    const isStatus = header?.includes('狀態');
                    const isProblem = header?.includes('問題');
                    const isMethod = header?.includes('報修方式');

                    let displayValue = value;
                    if (isProblem && value && value.length > 12) {
                      displayValue = value.substring(0, 12) + '...';
                    } else if (isMethod && value && value.includes('（')) {
                      displayValue = value.substring(0, value.indexOf('（'));
                    }

                    return (
                      <td
                        key={colIdx}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          borderRight: colIdx < headers.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none',
                          whiteSpace: 'nowrap',
                        }}
                        title={(isProblem || isMethod) && value ? value : ''}
                      >
                        {isStatus ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              background: getStatusBgColor(value),
                              color: getStatusColor(value),
                              fontWeight: '600',
                              fontSize: '10px',
                            }}
                          >
                            {value || '—'}
                          </span>
                        ) : (
                          <span>{displayValue || '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* 自動更新提示 */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '6px',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <RefreshCw size={14} />
        資料每30秒自動更新一次
      </div>
    </div>
  );
}
