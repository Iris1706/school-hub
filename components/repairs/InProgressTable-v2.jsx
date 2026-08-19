'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function InProgressTable({ sheetName, onShowCompleteModal, onShowEditModal, onDataLoaded }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [sheetName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/repairs/read?sheetName=${encodeURIComponent(sheetName)}&type=inProgress`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('讀取處理中資料失敗');
      }

      const result = await response.json();
      const loadedData = result.data || [];
      setData(loadedData);
      setError(null);
      // 通知父元件資料已載入
      if (onDataLoaded) {
        onDataLoaded(loadedData.length);
      }
    } catch (err) {
      setError(err.message);
      console.error('讀取處理中資料錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // 如果已經是 yyyy/mm/dd 格式，直接返回
    if (dateStr.includes('/')) return dateStr;
    // 如果是 yyyy-mm-dd 格式，轉換為 yyyy/mm/dd
    if (dateStr.includes('-')) return dateStr.replace(/-/g, '/');
    return dateStr;
  };

  const handleDelete = async (rowIndex) => {
    if (!confirm('確定要刪除此筆資料嗎？')) return;

    try {
      const response = await fetch('/api/repairs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex,
          type: 'inProgress',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除失敗');
      }

      setData(data.filter((_, idx) => idx !== rowIndex));
    } catch (err) {
      alert(`刪除失敗: ${err.message}`);
      console.error('刪除錯誤:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
        錯誤: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>
        暫無處理中資料
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'transparent',
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>建單日期</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>維修單號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '14%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>學校名稱</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '11%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>問題分類</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '9%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>機器舊序號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '9%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>進度</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ASM帳號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ASM取消指派</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>PreStage註冊</th>
            <th style={{ padding: '12px 6px', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '17%', whiteSpace: 'nowrap' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDate(row[0])}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', fontFamily: 'monospace', width: '8%', whiteSpace: 'nowrap' }}>{row[1] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '14%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[2] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '11%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[3] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', fontFamily: 'monospace', width: '9%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[4] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '9%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[5] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[7] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[8] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '8%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[9] || '-'}</td>
              <td style={{ padding: '12px 6px', textAlign: 'center', width: '17%' }}>
                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                  <button
                    onClick={() => onShowEditModal(index, row)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 7px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '10px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#2563eb';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#3b82f6';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <Edit2 size={10} />
                    編輯
                  </button>

                  <button
                    onClick={() => onShowCompleteModal(index, row)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 7px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '10px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#059669';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#10b981';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <CheckCircle size={10} />
                    完成
                  </button>

                  <button
                    onClick={() => handleDelete(index)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 7px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '10px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ef4444';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={10} />
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
