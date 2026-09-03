'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['', '待處理', '已接件', '已處理，待追蹤', '已完成', '報價中', '報價已回簽待送貨', '等待老師回覆', '老師未接待追聯', '已轉其他廠商處理'];

export default function RepairRecordsList({ sheetName }) {
  const [records, setRecords] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [updatingRecordId, setUpdatingRecordId] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = `/api/repairs/records?sheetName=${encodeURIComponent(sheetName)}`;

      const response = await fetch(url);
      let result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '讀取失敗');
      }

      setHeaders(result.headers);
      const reversed = [...result.records].reverse();
      setRecords(reversed);
      setError(null);

      console.log('API 返回記錄數:', reversed.length);
    } catch (err) {
      setError(err.message || '未知錯誤');
      console.error('讀取錯誤:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (record, newStatus) => {
    // 用 record 對象本身作為唯一識別符
    const recordId = JSON.stringify(record);
    setUpdatingRecordId(recordId);

    try {
      // 找到 record 在原始（未反向排序）records 中的索引
      const originalIdx = records.indexOf(record);
      if (originalIdx === -1) {
        throw new Error('找不到要更新的記錄');
      }

      // Google Sheet 行號 = 原始索引 + 2（第 1 行是標題，第 2 行開始是數據，且索引從 0 開始）
      const sheetRowIndex = originalIdx + 2;

      console.log('更新狀態:', {
        originalIdx,
        sheetRowIndex,
        newStatus,
      });

      const response = await fetch('/api/repairs/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex: sheetRowIndex,
          newStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '更新失敗');
      }

      // 更新本地狀態 - 找到 records 中的對應索引並更新
      const updatedRecords = records.map((r, idx) => {
        if (idx === originalIdx) {
          return {
            ...r,
            values: r.values.map((v, colIdx) => {
              // K column is the 11th column (0-based: A=0, B=1, ..., K=10)
              return colIdx === 10 ? newStatus : v;
            }),
          };
        }
        return r;
      });
      setRecords(updatedRecords);

      console.log('狀態已更新:', newStatus);
    } catch (err) {
      setError(`更新失敗: ${err.message}`);
      console.error('更新狀態錯誤:', err.message);
    } finally {
      setUpdatingRecordId(null);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [sheetName]);

  useEffect(() => {
    const interval = setInterval(fetchRecords, 30000);
    return () => clearInterval(interval);
  }, [sheetName]);

  // 當 records 變化時，自動設置 selectedMonth 為最新月份
  useEffect(() => {
    if (records.length > 0 && !selectedMonth) {
      const months = [...new Set(
        records
          .map(r => {
            const dateStr = r.values[0];
            if (!dateStr) return null;
            const match = dateStr.match(/(\d{4})[\/-](\d{1,2})/);
            return match ? `${match[1]}/${String(match[2]).padStart(2, '0')}` : null;
          })
          .filter(Boolean)
      )].sort().reverse();

      if (months.length > 0) {
        console.log('可用月份:', months);
        setSelectedMonth(months[0]);
      }
    }
  }, [records, selectedMonth]);

  const getStatusColor = (status) => {
    const lower = status?.trim().toLowerCase();
    if (lower === '完成' || lower === '已完成') return '#10b981';
    if (lower === '進行中' || lower === '處理中') return '#3b82f6';
    if (lower === '待處理') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusBgColor = (status) => {
    const lower = status?.trim().toLowerCase();
    if (lower === '完成' || lower === '已完成') return 'rgba(16, 185, 129, 0.1)';
    if (lower === '進行中' || lower === '處理中') return 'rgba(59, 130, 246, 0.1)';
    if (lower === '待處理') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(107, 114, 128, 0.1)';
  };

  if (loading && records.length === 0) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '10px' }}>載入中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={20} />
        <div>
          <div style={{ fontWeight: '600' }}>讀取失敗</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    );
  }

  const availableMonths = [...new Set(
    records
      .map(r => {
        const dateStr = r.values[0];
        if (!dateStr) return null;
        const match = dateStr.match(/(\d{4})[\/-](\d{1,2})/);
        return match ? `${match[1]}/${String(match[2]).padStart(2, '0')}` : null;
      })
      .filter(Boolean)
  )].sort().reverse();

  const filteredRecords = selectedMonth
    ? records.filter(r => {
        const dateStr = r.values[0];
        if (!dateStr) return false;
        const match = dateStr.match(/(\d{4})[\/-](\d{1,2})/);
        if (!match) return false;
        return `${match[1]}/${String(match[2]).padStart(2, '0')}` === selectedMonth;
      })
    : [];

  return (
    <div>
      {availableMonths.length > 0 && selectedMonth && (
        <div style={{ marginBottom: '20px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              minWidth: '120px',
            }}
          >
            {availableMonths.map(month => {
              const [year, m] = month.split('/');
              return (
                <option key={month} value={month}>
                  {parseInt(m)}月
                </option>
              );
            })}
          </select>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--background-secondary, #f9f9f9)', borderRadius: '8px', fontSize: '10px' }}>
          {records.length === 0 ? '暫無報修紀錄' : `${selectedMonth} 暫無資料`}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
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
              {filteredRecords.map((record, displayIdx) => {
                const recordId = JSON.stringify(record);
                const isUpdating = updatingRecordId === recordId;

                return (
                  <tr
                    key={displayIdx}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e5e7eb)',
                      backgroundColor: displayIdx % 2 === 0 ? 'transparent' : 'var(--background-secondary, #f9f9f9)',
                    }}
                  >
                    {record.values.map((value, colIdx) => {
                      const header = headers[colIdx];
                      const isStatus = header?.includes('狀態');
                      const isProblem = header?.includes('問題');
                      const isMethod = header?.includes('報修方式');

                      let displayValue = value;
                      if (isProblem && value?.length > 12) {
                        displayValue = value.substring(0, 12) + '...';
                      } else if (isMethod && value?.includes('（')) {
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
                            <select
                              value={value || ''}
                              onChange={(e) => handleStatusChange(record, e.target.value)}
                              disabled={isUpdating}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: getStatusBgColor(value),
                                color: getStatusColor(value),
                                fontWeight: '600',
                                fontSize: '10px',
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                opacity: isUpdating ? 0.6 : 1,
                              }}
                            >
                              {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>
                                  {status || '—'}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>{displayValue || '—'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
