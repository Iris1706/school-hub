'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function InProgressTable({ sheetName, onShowCompleteModal, onShowEditModal }) {
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
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('讀取處理中資料錯誤:', err);
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
      {/* Title and Count - Top Left */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '2px' }}>
          ⚙️ 處理中 <span style={{ fontSize: '14px', fontWeight: '400', color: '#6b7280' }}>共 {data.length} 筆</span>
        </h3>
      </div>

      {/* Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--background, white)',
            minWidth: '1300px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: 'var(--background-secondary, #f9f9f9)' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '90px' }}>建單日期</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '90px' }}>維修單號</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '140px' }}>學校名稱</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '120px' }}>問題分類</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '100px' }}>機器舊序號</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '100px' }}>進度</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', fontSize: '13px', minWidth: '100px' }}>ASM帳號</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', fontSize: '13px', minWidth: '120px' }}>操作</th>
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
                <td style={{ padding: '12px 8px', fontSize: '12px', minWidth: '90px' }}>{row[0] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', fontFamily: 'monospace', minWidth: '90px' }}>{row[1] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', minWidth: '140px' }}>{row[2] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', minWidth: '120px' }}>{row[3] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', fontFamily: 'monospace', minWidth: '100px' }}>{row[4] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', minWidth: '100px' }}>{row[5] || '-'}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px', minWidth: '100px' }}>{row[7] || '-'}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', minWidth: '120px' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                    {/* Complete Button */}
                    <button
                      onClick={() => onShowCompleteModal(index, row)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
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
                      <CheckCircle size={11} />
                      完成
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onShowEditModal(index, row)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
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
                      <Edit2 size={11} />
                      編輯
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
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
                      <Trash2 size={11} />
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
