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
    <div style={{ display: 'grid', gap: '16px' }}>
      {sortedData.map((row, index) => (
        <div
          key={index}
          style={{
            background: 'var(--background, white)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>建單日期</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[0] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>維修單號</div>
            <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{row[1] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>學校名稱</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[2] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>問題分類</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[3] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>機器舊序號</div>
            <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{row[4] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>機器新序號</div>
            <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{row[5] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>狀態</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[6] || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>完成日期(寄回)</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[7] || '-'}</div>
          </div>

          <div>
            <button
              onClick={() => handleDelete(index)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
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
              <Trash2 size={16} />
              刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
