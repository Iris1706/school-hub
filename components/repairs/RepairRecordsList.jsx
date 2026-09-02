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
      const response = await fetch(
        `/api/repairs/records?sheetName=${encodeURIComponent(sheetName)}`
      );

      if (!response.ok) {
        throw new Error('讀取報修紀錄失敗');
      }

      const result = await response.json();
      if (result.success) {
        setHeaders(result.headers);
        setRecords(result.records);
        setError(null);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || '無法取得資料');
      }
    } catch (err) {
      setError(err.message);
      console.error('讀取報修紀錄錯誤:', err);
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

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>載入中...</div>
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
          <div style={{ fontSize: '14px', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 標題和刷新按鈕 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color, #e5e7eb)',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
            報修紀錄
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            共 {records.length} 筆紀錄
            {lastUpdated && (
              <>
                ・最後更新: {lastUpdated.toLocaleTimeString('zh-TW')}
              </>
            )}
          </div>
        </div>
        <button
          onClick={fetchRecords}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

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
          <div style={{ fontSize: '14px' }}>暫無報修紀錄</div>
        </div>
      ) : (
        // 清單視圖
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {records.map((record) => (
            <div
              key={record.rowIndex}
              style={{
                background: 'var(--background, white)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '8px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {/* 為每個欄位創建卡片 */}
              {headers.map((header, idx) => {
                const value = record.values[idx] || '';
                const isStatus = header?.includes('狀態');

                return (
                  <div key={idx}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {header}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        ...(isStatus && {
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          background: getStatusBgColor(value),
                          color: getStatusColor(value),
                          fontWeight: '600',
                        }),
                      }}
                    >
                      {value || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* 自動更新提示 */}
      <div
        style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '6px',
          fontSize: '12px',
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
