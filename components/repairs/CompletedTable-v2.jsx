'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function CompletedTable({ sheetName }) {
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
        `/api/repairs/read?sheetName=${encodeURIComponent(sheetName)}&type=completed`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('讀取已完修資料失敗');
      }

      const result = await response.json();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('讀取已完修資料錯誤:', err);
    } finally {
      setLoading(false);
    }
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
          type: 'completed',
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

  // Sort by completion date (newest first)
  const sortedData = [...data].sort((a, b) => {
    const dateA = a[7] ? new Date(a[7]) : new Date(0);
    const dateB = b[7] ? new Date(b[7]) : new Date(0);
    return dateB - dateA;
  });

  if (sortedData.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>
        暫無已完修資料
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'var(--background, white)',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb', background: 'var(--background-secondary, #f9f9f9)' }}>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%' }}>建單日期</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '8%' }}>維修單號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '14%' }}>學校名稱</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '12%' }}>問題分類</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '10%' }}>機器舊序號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '10%' }}>機器新序號</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '10%' }}>狀態</th>
            <th style={{ padding: '12px 6px', textAlign: 'left', fontWeight: '600', fontSize: '12px', width: '10%' }}>完成日期</th>
            <th style={{ padding: '12px 6px', textAlign: 'center', fontWeight: '600', fontSize: '12px', width: '8%' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '8%' }}>{row[0] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', fontFamily: 'monospace', width: '8%' }}>{row[1] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '14%' }}>{row[2] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '12%' }}>{row[3] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', fontFamily: 'monospace', width: '10%' }}>{row[4] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', fontFamily: 'monospace', width: '10%' }}>{row[5] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '10%' }}>{row[6] || '-'}</td>
              <td style={{ padding: '12px 6px', fontSize: '11px', width: '10%' }}>{row[7] || '-'}</td>
              <td style={{ padding: '12px 6px', textAlign: 'center', width: '8%' }}>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
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
                  <Trash2 size={12} />
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
